import { getPakarData } from '$lib/server/pakar';

export async function load() {
	const { packages, repo } = await getPakarData();
	return { packages, repo };
}
