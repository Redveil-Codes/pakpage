#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as loadYaml } from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const REPO_URL = process.env.PAKAR_REPO_URL ?? 'git@github.com:Redveil-Codes/pakar.git';
const DEPLOY_KEY = resolve(process.env.PAKAR_DEPLOY_KEY ?? join(homedir(), '.ssh', 'pakar_deploy_key'));
const CACHE_DIR = resolve(process.env.PAKAR_CACHE_DIR ?? join(projectRoot, '.cache', 'pakar'));
const OUT_FILE = join(projectRoot, 'src', 'lib', 'data', 'packages.json');

function git(args, cwd) {
	return execFileSync('git', args, { cwd, encoding: 'utf-8', env: gitEnv() }).trim();
}

function gitEnv() {
	if (!existsSync(DEPLOY_KEY)) return process.env;
	return {
		...process.env,
		GIT_SSH_COMMAND: `ssh -i "${DEPLOY_KEY}" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new`
	};
}

function resolveRepoPath() {
	const localPath = process.env.PAKAR_REPO_PATH;
	if (localPath) {
		const abs = resolve(localPath);
		if (!existsSync(join(abs, '.git'))) {
			throw new Error(`PAKAR_REPO_PATH=${abs} is not a git repository`);
		}
		console.log(`[sync-data] using local checkout at ${abs}`);
		return abs;
	}

	if (existsSync(join(CACHE_DIR, '.git'))) {
		console.log(`[sync-data] pulling latest into ${CACHE_DIR}`);
		git(['fetch', '--depth', '1', 'origin', 'main'], CACHE_DIR);
		git(['reset', '--hard', 'origin/main'], CACHE_DIR);
		return CACHE_DIR;
	}

	mkdirSync(dirname(CACHE_DIR), { recursive: true });
	console.log(`[sync-data] cloning ${REPO_URL} into ${CACHE_DIR}`);
	if (!existsSync(DEPLOY_KEY)) {
		throw new Error(
			`No local checkout given via PAKAR_REPO_PATH and no deploy key found at ${DEPLOY_KEY}. ` +
				`Generate one and add it as a read-only Deploy Key on the pakar repo, or set PAKAR_REPO_PATH.`
		);
	}
	execFileSync('git', ['clone', '--depth', '1', REPO_URL, CACHE_DIR], { encoding: 'utf-8', env: gitEnv() });
	return CACHE_DIR;
}

function parsePak(text) {
	const lines = text.split(/\r?\n/);
	const result = {};
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const match = line.match(/^([A-Z_]+)=(.*)$/);
		if (!match) continue;
		const [, key, rawValue] = match;

		if (rawValue.trim() === '(') {
			const items = [];
			i++;
			while (i < lines.length && lines[i].trim() !== ')') {
				const item = lines[i].trim();
				if (item) items.push(item);
				i++;
			}
			result[key] = items;
			continue;
		}

		const value = rawValue.trim();
		if (value.startsWith('(') && value.endsWith(')')) {
			result[key] = value
				.slice(1, -1)
				.split(/\s+/)
				.map((s) => s.trim())
				.filter(Boolean);
		} else {
			result[key] = value;
		}
	}
	return result;
}

function slugify(value) {
	return String(value)
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function lastCommitFor(repoPath, relDir) {
	const format = ['%H', '%an', '%ae', '%aI', '%s'].join('%x1f');
	let raw;
	try {
		raw = git(['log', '-1', `--format=${format}`, '--', relDir], repoPath);
	} catch {
		return null;
	}
	if (!raw) return null;
	const [hash, authorName, authorEmail, date, message] = raw.split('\x1f');
	return { hash, authorName, authorEmail, date, message };
}

function main() {
	const repoPath = resolveRepoPath();
	const packagesDir = join(repoPath, 'packages');
	const dirs = readdirSync(packagesDir).filter((name) => statSync(join(packagesDir, name)).isDirectory());

	const packages = dirs
		.map((dir) => {
			const base = join(packagesDir, dir);
			const ymlPath = existsSync(join(base, 'package.yml')) ? join(base, 'package.yml') : join(base, 'package.yaml');
			if (!existsSync(ymlPath)) {
				console.warn(`[sync-data] skipping ${dir}: no package.yml`);
				return null;
			}

			const meta = loadYaml(readFileSync(ymlPath, 'utf-8')) ?? {};
			const pakPath = join(base, 'package.pak');
			const pak = existsSync(pakPath) ? parsePak(readFileSync(pakPath, 'utf-8')) : null;

			const slug = slugify(meta.slug || meta.name || dir);
			const lastCommit = lastCommitFor(repoPath, `packages/${dir}`);

			return {
				slug,
				dir,
				name: meta.name ?? dir,
				version: meta.version ?? null,
				description: meta.description ?? '',
				homepage: meta.homepage ?? null,
				license: meta.license ?? null,
				dependencies: meta.dependencies ?? [],
				pak,
				lastCommit
			};
		})
		.filter(Boolean)
		.sort((a, b) => a.name.localeCompare(b.name));

	const slugCounts = new Map();
	for (const p of packages) slugCounts.set(p.slug, (slugCounts.get(p.slug) ?? 0) + 1);
	const dupes = [...slugCounts].filter(([, count]) => count > 1);
	if (dupes.length) {
		throw new Error(`Duplicate package slugs: ${dupes.map(([s]) => s).join(', ')}`);
	}

	mkdirSync(dirname(OUT_FILE), { recursive: true });
	writeFileSync(OUT_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), packages }, null, '\t') + '\n');
	console.log(`[sync-data] wrote ${packages.length} package(s) to ${OUT_FILE}`);
}

main();
