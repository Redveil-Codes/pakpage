import { load as loadYaml } from 'js-yaml';
import { env } from '$env/dynamic/private';
import { cached } from './cache';
import { fgCommits, fgRaw, fgTree } from './forgejo';
import type { CommitInfo, PakBuild, Package, Repo } from '$lib/types';

const BASE = env.PAKAR_FORGEJO_BASE ?? 'https://pak.dpdns.org';
const REPO = env.PAKAR_FORGEJO_REPO ?? 'pak/pakar';
const REPO_HTTPS_URL = `${BASE}/${REPO}`;
const REF = env.PAKAR_REPO_REF ?? 'main';
const TOKEN = env.PAKAR_FORGEJO_TOKEN;
const CACHE_TTL_MS = Number(env.PAKAR_CACHE_TTL_MS ?? 10 * 60_000);
const COMMITS_CACHE_TTL_MS = Number(env.PAKAR_COMMITS_CACHE_TTL_MS ?? 30 * 60_000);

export function parsePak(text: string): PakBuild {
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

export function slugify(value: string): string {
	return String(value)
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

async function commitsFor(path: string): Promise<CommitInfo[]> {
	const commits = await fgCommits(BASE, REPO, path, REF, TOKEN, 100);
	return commits.map((c) => ({
		hash: c.sha,
		authorName: c.commit.author.name,
		authorEmail: c.commit.author.email,
		date: c.commit.author.date,
		message: c.commit.message.split('\n')[0]
	}));
}

const NO_COMMITS = { commits: [] as CommitInfo[], firstCommit: null, lastCommit: null };

export function getPackageCommits(
	dir: string
): Promise<{ commits: CommitInfo[]; firstCommit: CommitInfo | null; lastCommit: CommitInfo | null }> {
	return cached(`commits:${dir}`, COMMITS_CACHE_TTL_MS, async () => {
		const commits = await commitsFor(`packages/${dir}`);
		return { commits, firstCommit: commits[commits.length - 1] ?? null, lastCommit: commits[0] ?? null };
	});
}

interface PackageFiles {
	yml: string;
	pak?: string;
}

async function loadPackage(dir: string, files: PackageFiles): Promise<Package | null> {
	const yamlRaw = await fgRaw(BASE, REPO, REF, files.yml, TOKEN);
	const meta = (loadYaml(yamlRaw) ?? {}) as Record<string, unknown>;

	let pak: PakBuild | null = null;
	let pakRaw: string | null = null;
	if (files.pak) {
		pakRaw = await fgRaw(BASE, REPO, REF, files.pak, TOKEN);
		pak = parsePak(pakRaw);
	}

	const slug = slugify((meta.slug as string) || (meta.name as string) || dir);

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
		yamlRaw,
		pakRaw,
		...NO_COMMITS
	};
}

const PACKAGE_FILE_RE = /^packages\/([^/]+)\/(package\.ya?ml|package\.pak)$/;

async function loadPackages(): Promise<{ repo: Repo; packages: Package[] }> {
	const { tree, truncated } = await fgTree(BASE, REPO, REF, TOKEN);
	if (truncated) {
		console.error('pakar: repo tree listing was truncated by the GitHub API, some packages may be missing');
	}

	const byDir = new Map<string, PackageFiles>();
	for (const entry of tree) {
		if (entry.type !== 'blob') continue;
		const match = entry.path.match(PACKAGE_FILE_RE);
		if (!match) continue;
		const [, dir, file] = match;
		const rec = byDir.get(dir) ?? ({ yml: '' } as PackageFiles);
		if (file === 'package.pak') rec.pak = entry.path;
		else rec.yml = entry.path;
		byDir.set(dir, rec);
	}

	const packages = (
		await Promise.all(
			Array.from(byDir.entries())
				.filter(([, files]) => files.yml)
				.map(([dir, files]) => loadPackage(dir, files))
		)
	)
		.filter((p): p is Package => p !== null)
		.sort((a, b) => a.name.localeCompare(b.name));

	return { repo: { httpsUrl: REPO_HTTPS_URL, cloneUrl: `${REPO_HTTPS_URL}.git` }, packages };
}

export function getPakarData(): Promise<{ repo: Repo; packages: Package[] }> {
	return cached('pakar', CACHE_TTL_MS, loadPackages);
}
