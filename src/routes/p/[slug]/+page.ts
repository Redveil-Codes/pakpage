import { error } from '@sveltejs/kit';
import { getPackageBySlug, packages } from '$lib/data';

export function entries() {
	return packages.map((p) => ({ slug: p.slug }));
}

export function load({ params }) {
	const pkg = getPackageBySlug(params.slug);
	if (!pkg) error(404, 'package not found');
	return { pkg };
}
