export interface GithubEntry {
	name: string;
	path: string;
	type: 'file' | 'dir';
	content?: string;
	encoding?: string;
	download_url: string | null;
}

export function ghHeaders(token?: string): HeadersInit {
	const headers: Record<string, string> = {
		'User-Agent': 'pakpage',
		Accept: 'application/vnd.github+json'
	};
	if (token) headers.Authorization = `Bearer ${token}`;
	return headers;
}

export async function ghContents(
	repo: string,
	path: string,
	ref: string,
	token?: string
): Promise<GithubEntry[] | GithubEntry> {
	const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${ref}`;
	const res = await fetch(url, { headers: ghHeaders(token) });
	if (!res.ok) throw new Error(`GitHub contents API ${res.status} for ${repo}/${path}`);
	return res.json();
}

export function decodeContent(entry: GithubEntry): string {
	if (entry.encoding === 'base64' && entry.content) {
		return Buffer.from(entry.content, 'base64').toString('utf-8');
	}
	return '';
}
