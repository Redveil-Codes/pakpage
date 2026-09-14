import { getPakarData } from '$lib/server/pakar';

export async function load() {
	const { packages } = await getPakarData();
	return { packages };
}
