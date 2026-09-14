export interface ForgejoCommit {
	sha: string;
	commit: {
		author: { name: string; email: string; date: string };
		message: string;
	};
}

export interface ForgejoTreeEntry {
	path: string;
	type: 'blob' | 'tree' | 'commit';
	sha: string;
}

export function fgHeaders(token?: string): HeadersInit {
	const headers: Record<string, string> = { 'User-Agent': 'pakpage' };
	if (token) headers.Authorization = `token ${token}`;
	return headers;
}

function encodePath(path: string): string {
	return path
		.split('/')
		.map((segment) => encodeURIComponent(segment))
		.join('/');
}

export async function fgTree(
	base: string,
	repo: string,
	ref: string,
	token: string | undefined
): Promise<{ tree: ForgejoTreeEntry[]; truncated: boolean }> {
	const tree: ForgejoTreeEntry[] = [];
	let page = 1;
	for (;;) {
		const url = `${base}/api/v1/repos/${repo}/git/trees/${encodeURIComponent(ref)}?recursive=true&per_page=1000&page=${page}`;
		const res = await fetch(url, { headers: fgHeaders(token) });
		if (res.status === 400) {
			// Empty repo or ref doesn't exist yet (nothing pushed) - not an error, just nothing to show.
			return { tree: [], truncated: false };
		}
		if (!res.ok) throw new Error(`Forgejo tree API ${res.status} for ${repo}@${ref}`);
		const data: { tree: ForgejoTreeEntry[] | null; truncated: boolean } = await res.json();
		const entries = data.tree ?? [];
		tree.push(...entries);
		if (!data.truncated || entries.length === 0) return { tree, truncated: false };
		page++;
	}
}

export async function fgRaw(base: string, repo: string, ref: string, path: string, token?: string): Promise<string> {
	const url = `${base}/api/v1/repos/${repo}/raw/${encodePath(path)}?ref=${encodeURIComponent(ref)}`;
	const res = await fetch(url, { headers: fgHeaders(token) });
	if (!res.ok) throw new Error(`Forgejo raw fetch ${res.status} for ${repo}/${path}`);
	return res.text();
}

export async function fgCommits(
	base: string,
	repo: string,
	path: string,
	ref: string,
	token: string | undefined,
	perPage: number
): Promise<ForgejoCommit[]> {
	const url =
		`${base}/api/v1/repos/${repo}/commits?path=${encodeURIComponent(path)}&sha=${encodeURIComponent(ref)}` +
		`&limit=${perPage}&stat=false&verification=false&files=false`;
	const res = await fetch(url, { headers: fgHeaders(token) });
	if (!res.ok) throw new Error(`Forgejo commits API ${res.status} for ${repo}/${path}`);
	return res.json();
}
