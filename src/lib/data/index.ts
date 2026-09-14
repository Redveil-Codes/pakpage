import raw from './packages.json';
import type { Package } from '$lib/types';

export const packages = raw.packages as Package[];
export const generatedAt = raw.generatedAt as string;

export function getPackageBySlug(slug: string): Package | undefined {
	return packages.find((p) => p.slug === slug);
}

export function searchPackages(query: string): Package[] {
	const q = query.trim().toLowerCase();
	if (!q) return packages;
	return packages.filter(
		(p) =>
			p.name.toLowerCase().includes(q) ||
			p.slug.toLowerCase().includes(q) ||
			p.description.toLowerCase().includes(q)
	);
}
