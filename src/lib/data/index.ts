import raw from './packages.json';
import type { Package, Repo } from '$lib/types';

export const packages = raw.packages as Package[];
export const generatedAt = raw.generatedAt as string;
export const repo = raw.repo as Repo;

export function getPackageBySlug(slug: string): Package | undefined {
	return packages.find((p) => p.slug === slug);
}

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

export function searchPackages(query: string): Package[] {
	const raw = query.trim();
	if (!raw) return packages;

	const prefixed = raw.match(/^(\w+):(.*)$/);
	if (prefixed) {
		const [, key, rest] = prefixed;
		const filter = FIELD_FILTERS[key.toLowerCase()];
		if (filter) {
			const val = rest.trim().toLowerCase();
			return val ? packages.filter((p) => filter(p, val)) : packages;
		}
	}

	const q = raw.toLowerCase();
	return packages
		.map((p) => ({ p, s: score(p, q) }))
		.filter(({ s }) => s > 0)
		.sort((a, b) => b.s - a.s || a.p.name.localeCompare(b.p.name))
		.map(({ p }) => p);
}
