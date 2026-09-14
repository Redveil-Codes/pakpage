import { error } from '@sveltejs/kit';
import { getPakarData, getPackageCommits } from '$lib/server/pakar';

export async function load({ params }) {
	const { repo, packages } = await getPakarData();
	const pkg = packages.find((p) => p.slug === params.slug);
	if (!pkg) error(404, 'package not found');
	const commitData = await getPackageCommits(pkg.dir);
	return { pkg: { ...pkg, ...commitData }, repo, packages };
}
