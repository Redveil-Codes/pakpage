import { load as loadYaml } from 'js-yaml';
import { env } from '$env/dynamic/private';
import { cached } from './cache';
import { decodeContent, ghCommits, ghContents } from './github';
import type { GithubEntry } from './github';
import type { CommitInfo, PakBuild, Package, Repo } from '$lib/types';

const REPO = env.PAKAR_GITHUB_REPO ?? 'Redveil-Codes/pakar';
const REPO_HTTPS_URL = `https://github.com/${REPO}`;
const REF = env.PAKAR_REPO_REF ?? 'main';
const TOKEN = env.PAKAR_GITHUB_TOKEN;
const CACHE_TTL_MS = Number(env.PAKAR_CACHE_TTL_MS ?? 60_000);

function parsePak(text: string): PakBuild {
	const lines = text.split(/\r?\n/);
	const result: Record<string, unknown> = {};
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const match = line.match(/^([A-Z_]+)=(.*)$/);
		if (!match) continue;
		const [, key, rawValue] = match;

		if (rawValue.trim() === '(') {
			const items: string[] = [];
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
	return result as PakBuild;
}

function slugify(value: string): string {
	return String(value)
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

async function commitsFor(path: string): Promise<CommitInfo[]> {
	const commits = await ghCommits(REPO, path, REF, TOKEN, 100);
	return commits.map((c) => ({
		hash: c.sha,
		authorName: c.commit.author.name,
		authorEmail: c.commit.author.email,
		date: c.commit.author.date,
		message: c.commit.message.split('\n')[0]
	}));
}

async function loadPackage(dir: string): Promise<Package | null> {
	const entries = (await ghContents(REPO, `packages/${dir}`, REF, TOKEN)) as GithubEntry[];

	const ymlEntry = entries.find((e) => e.name === 'package.yml' || e.name === 'package.yaml');
	if (!ymlEntry) return null;
	const ymlFile = (await ghContents(REPO, ymlEntry.path, REF, TOKEN)) as GithubEntry;
	const meta = (loadYaml(decodeContent(ymlFile)) ?? {}) as Record<string, unknown>;

	const pakEntry = entries.find((e) => e.name === 'package.pak');
	let pak: PakBuild | null = null;
	if (pakEntry) {
		const pakFile = (await ghContents(REPO, pakEntry.path, REF, TOKEN)) as GithubEntry;
		pak = parsePak(decodeContent(pakFile));
	}

	const slug = slugify((meta.slug as string) || (meta.name as string) || dir);
	const commits = await commitsFor(`packages/${dir}`);

	return {
		slug,
		dir,
		name: (meta.name as string) ?? dir,
		version: (meta.version as string | number) ?? null,
		description: (meta.description as string) ?? '',
		homepage: (meta.homepage as string) ?? null,
		license: (meta.license as string) ?? null,
		maintainer: (meta.maintainer as string) ?? null,
		dependencies: (meta.dependencies as string[]) ?? [],
		pak,
		firstCommit: commits[commits.length - 1] ?? null,
		lastCommit: commits[0] ?? null
	};
}

async function loadPackages(): Promise<{ repo: Repo; packages: Package[] }> {
	if (!TOKEN) {
		throw new Error(
			'PAKAR_GITHUB_TOKEN is not set. Generate a fine-grained GitHub PAT (read-only, Contents permission, scoped to the pakar repo) and set it as an env var.'
		);
	}

	const top = (await ghContents(REPO, 'packages', REF, TOKEN)) as GithubEntry[];
	const dirs = top.filter((e) => e.type === 'dir');
	const packages = (await Promise.all(dirs.map((d) => loadPackage(d.name))))
		.filter((p): p is Package => p !== null)
		.sort((a, b) => a.name.localeCompare(b.name));

	return { repo: { httpsUrl: REPO_HTTPS_URL, cloneUrl: `${REPO_HTTPS_URL}.git` }, packages };
}

export function getPakarData(): Promise<{ repo: Repo; packages: Package[] }> {
	return cached('pakar', CACHE_TTL_MS, loadPackages);
}
