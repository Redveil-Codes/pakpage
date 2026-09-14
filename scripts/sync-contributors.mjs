#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const CONTRIB_DIR = join(projectRoot, 'contributors');
const OUT_FILE = join(projectRoot, 'src', 'lib', 'data', 'contributors.json');

const HEADER_RE = /^#\s*@git-usr\s+(\S+)\s*$/;

async function fetchDisplayName(username) {
	try {
		const res = await fetch(`https://api.github.com/users/${username}`, {
			headers: { 'User-Agent': 'pakpage-sync-contributors', Accept: 'application/vnd.github+json' }
		});
		if (!res.ok) return null;
		const data = await res.json();
		return data.name || null;
	} catch {
		return null;
	}
}

function firstMdFile(dir) {
	const file = readdirSync(dir).find((f) => f.endsWith('.md'));
	return file ? join(dir, file) : null;
}

async function main() {
	if (!existsSync(CONTRIB_DIR)) {
		mkdirSync(dirname(OUT_FILE), { recursive: true });
		writeFileSync(OUT_FILE, JSON.stringify({ contributors: [] }, null, '\t') + '\n');
		console.log('[sync-contributors] no contributors/ dir, wrote empty list');
		return;
	}

	const slugs = readdirSync(CONTRIB_DIR).filter((name) => statSync(join(CONTRIB_DIR, name)).isDirectory());
	const contributors = [];

	for (const slug of slugs) {
		const mdPath = firstMdFile(join(CONTRIB_DIR, slug));
		if (!mdPath) {
			console.warn(`[sync-contributors] skipping ${slug}: no .md file`);
			continue;
		}

		const lines = readFileSync(mdPath, 'utf-8').split(/\r?\n/);
		const match = (lines[0] ?? '').match(HEADER_RE);
		if (!match) {
			console.warn(`[sync-contributors] skipping ${slug}: first line must be "# @git-usr <username>"`);
			continue;
		}

		const username = match[1];
		const bodyMd = lines.slice(1).join('\n').trim();
		const name = (await fetchDisplayName(username)) ?? username;

		contributors.push({
			slug,
			username,
			name,
			avatarUrl: `https://github.com/${username}.png`,
			githubUrl: `https://github.com/${username}`,
			bioHtml: marked.parse(bodyMd)
		});
	}

	contributors.sort((a, b) => a.name.localeCompare(b.name));

	mkdirSync(dirname(OUT_FILE), { recursive: true });
	writeFileSync(OUT_FILE, JSON.stringify({ contributors }, null, '\t') + '\n');
	console.log(`[sync-contributors] wrote ${contributors.length} contributor(s) to ${OUT_FILE}`);
}

main();
