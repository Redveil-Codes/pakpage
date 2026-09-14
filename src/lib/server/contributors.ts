import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { marked } from 'marked';
import { env } from '$env/dynamic/private';
import { cached } from './cache';
import { ghContents } from './github';
import type { GithubEntry } from './github';
import type { Contributor, ProjectBadge } from '$lib/types';

const LOCAL_DIR = resolve(env.CONTRIBUTORS_DIR ?? join(process.cwd(), 'static', 'contributors'));

const REMOTE_REPO = env.CONTRIBUTORS_REPO;
const REMOTE_PATH = env.CONTRIBUTORS_REPO_PATH ?? 'static/contributors';
const REMOTE_REF = env.CONTRIBUTORS_REPO_REF ?? 'main';

const LIST_TTL_MS = Number(env.CONTRIBUTORS_CACHE_TTL_MS ?? 60_000);
const USER_TTL_MS = Number(env.CONTRIBUTORS_USER_CACHE_TTL_MS ?? 10 * 60_000);

const GH_HEADERS = { 'User-Agent': 'pakpage', Accept: 'application/vnd.github+json' };
const HEADER_RE = /^@git\s+(\S+)\s*$/i;
const BADGES_RE = /^@badges\s+(.+)$/i;

const KNOWN_PROJECTS: Record<string, ProjectBadge> = {
	pak: { label: 'Pak', href: 'https://github.com/Redveil-Codes/pak' },
	pakpage: { label: 'PakPage', href: 'https://github.com/Redveil-Codes/pakpage' },
	pakar: { label: 'Pakar', href: 'https://github.com/Redveil-Codes/pakar' },
	mirror: { label: 'Mirror', href: 'https://github.com/Redveil-Codes/pakar' }
};

function parseBadges(value: string): ProjectBadge[] {
	return value
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean)
		.map((s) => KNOWN_PROJECTS[s.toLowerCase()] ?? { label: s, href: null });
}

interface RawBio {
	slug: string;
	raw: string;
}

async function listRemoteBios(): Promise<RawBio[]> {
	const top = (await ghContents(REMOTE_REPO!, REMOTE_PATH, REMOTE_REF)) as GithubEntry[];
	const out: RawBio[] = [];
	for (const entry of top.filter((e) => e.type === 'dir')) {
		const files = (await ghContents(REMOTE_REPO!, entry.path, REMOTE_REF)) as GithubEntry[];
		const md = files.find((f) => f.type === 'file' && f.name.endsWith('.md'));
		if (!md?.download_url) continue;
		const raw = await fetch(md.download_url).then((r) => r.text());
		out.push({ slug: entry.name, raw });
	}
	return out;
}

function listLocalBios(): RawBio[] {
	if (!existsSync(LOCAL_DIR)) return [];
	const slugs = readdirSync(LOCAL_DIR).filter((name: string) => statSync(join(LOCAL_DIR, name)).isDirectory());
	const out: RawBio[] = [];
	for (const slug of slugs) {
		const dir = join(LOCAL_DIR, slug);
		const file = readdirSync(dir).find((f: string) => f.endsWith('.md'));
		if (!file) continue;
		out.push({ slug, raw: readFileSync(join(dir, file), 'utf-8') });
	}
	return out;
}

function parseBio(raw: string): { username: string; bodyMd: string; badges: ProjectBadge[] } | null {
	const lines = raw.split(/\r?\n/);
	const match = (lines[0] ?? '').match(HEADER_RE);
	if (!match) return null;

	const rest = lines.slice(1);
	let badges: ProjectBadge[] = [];
	const bodyLines = rest.filter((line) => {
		const badgesMatch = line.match(BADGES_RE);
		if (!badgesMatch) return true;
		badges = parseBadges(badgesMatch[1]);
		return false;
	});

	return { username: match[1], bodyMd: bodyLines.join('\n').trim(), badges };
}

interface GithubProfile {
	name: string;
	avatarUrl: string;
	githubUrl: string;
}

function fetchGithubProfile(username: string): Promise<GithubProfile> {
	return cached(`ghuser:${username}`, USER_TTL_MS, async () => {
		try {
			const res = await fetch(`https://api.github.com/users/${username}`, { headers: GH_HEADERS });
			if (!res.ok) throw new Error(`GitHub users API ${res.status} for ${username}`);
			const data = await res.json();
			return {
				name: (data.name as string) || username,
				avatarUrl: data.avatar_url as string,
				githubUrl: data.html_url as string
			};
		} catch {
			return {
				name: username,
				avatarUrl: `https://github.com/${username}.png`,
				githubUrl: `https://github.com/${username}`
			};
		}
	});
}

async function loadContributors(): Promise<Contributor[]> {
	const bios = REMOTE_REPO ? await listRemoteBios() : listLocalBios();

	const contributors: Contributor[] = [];
	for (const bio of bios) {
		const parsed = parseBio(bio.raw);
		if (!parsed) continue;
		const profile = await fetchGithubProfile(parsed.username);
		contributors.push({
			slug: bio.slug,
			username: parsed.username,
			name: profile.name,
			avatarUrl: profile.avatarUrl,
			githubUrl: profile.githubUrl,
			bioHtml: await marked.parse(parsed.bodyMd),
			badges: parsed.badges
		});
	}

	return contributors.sort((a, b) => a.name.localeCompare(b.name));
}

export function getContributors(): Promise<Contributor[]> {
	return cached('contributors', LIST_TTL_MS, loadContributors);
}
