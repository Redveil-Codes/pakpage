import { getContributors } from '$lib/server/contributors';

export async function load() {
	const contributors = await getContributors();
	return { contributors };
}
