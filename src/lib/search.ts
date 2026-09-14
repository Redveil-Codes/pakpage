import type { Package } from '$lib/types';

function score(p: Package, q: string): number {
	const name = p.name.toLowerCase();
	const slug = p.slug.toLowerCase();
	if (name === q || slug === q) return 100;
	if (name.startsWith(q) || slug.startsWith(q)) return 80;
	if (name.includes(q) || slug.includes(q)) return 60;
	if (p.description.toLowerCase().includes(q)) return 30;
	return 0;
}

const FIELD_FILTERS: Record<string, (p: Package, val: string) => boolean> = {
	d: (p, val) => p.dependencies.some((d) => d.toLowerCase().includes(val)),
	dep: (p, val) => p.dependencies.some((d) => d.toLowerCase().includes(val)),
	l: (p, val) => (p.license ?? '').toLowerCase().includes(val),
	license: (p, val) => (p.license ?? '').toLowerCase().includes(val),
	m: (p, val) => (p.maintainer ?? '').toLowerCase().includes(val),
	maintainer: (p, val) => (p.maintainer ?? '').toLowerCase().includes(val)
};

function unquote(value: string): string {
	if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);
	return value;
}

export function quoteIfNeeded(value: string): string {
	return /\s/.test(value) ? `"${value}"` : value;
}

function tokenScore(p: Package, token: string): number | null {
	const prefixed = token.match(/^(\w+):(.*)$/);
	if (prefixed) {
		const filter = FIELD_FILTERS[prefixed[1].toLowerCase()];
		if (filter) {
			const val = unquote(prefixed[2].trim()).toLowerCase();
			if (!val) return 0;
			return filter(p, val) ? 50 : null;
		}
	}
	const s = score(p, unquote(token).toLowerCase());
	return s > 0 ? s : null;
}

const TOKEN_RE = /(?:[^\s"]+|"[^"]*")+/g;

export function searchPackages(packages: Package[], query: string): Package[] {
	const tokens = query.trim().match(TOKEN_RE) ?? [];
	if (!tokens.length) return packages;

	const matches: { p: Package; s: number }[] = [];
	for (const p of packages) {
		let total = 0;
		let ok = true;
		for (const token of tokens) {
			const s = tokenScore(p, token);
			if (s === null) {
				ok = false;
				break;
			}
			total += s;
		}
		if (ok) matches.push({ p, s: total });
	}

	return matches.sort((a, b) => b.s - a.s || a.p.name.localeCompare(b.p.name)).map(({ p }) => p);
}

export function getPackageBySlug(packages: Package[], slug: string): Package | undefined {
	return packages.find((p) => p.slug === slug);
}
