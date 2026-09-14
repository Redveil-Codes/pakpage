import { env } from '$env/dynamic/private';

const BASE = env.PAKAR_FORGEJO_BASE ?? 'https://pak.dpdns.org';
const REPO = env.PAKAR_FORGEJO_REPO ?? 'pak/pakar';
const DEFAULT_BRANCH = env.PAKAR_REPO_REF ?? 'main';

function encodePath(path: string): string {
	return path
		.split('/')
		.map((segment) => encodeURIComponent(segment))
		.join('/');
}

function authHeaders(token: string): HeadersInit {
	return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function putContent(
	token: string,
	path: string,
	content: string,
	message: string,
	branch: string,
	newBranch?: string
): Promise<void> {
	const res = await fetch(`${BASE}/api/v1/repos/${REPO}/contents/${encodePath(path)}`, {
		method: 'POST',
		headers: authHeaders(token),
		body: JSON.stringify({
			content: Buffer.from(content, 'utf-8').toString('base64'),
			message,
			branch,
			new_branch: newBranch
		})
	});
	if (!res.ok) throw new Error(`Forgejo contents API ${res.status} for ${path}: ${await res.text()}`);
}

export interface SubmitResult {
	htmlUrl: string;
}

export async function submitPackage(
	token: string,
	slug: string,
	yamlContent: string,
	pakContent: string,
	title: string,
	body: string
): Promise<SubmitResult> {
	const branch = `submit/${slug}-${Date.now()}`;

	await putContent(token, `packages/${slug}/package.yml`, yamlContent, `Add ${slug} package.yml`, DEFAULT_BRANCH, branch);
	await putContent(token, `packages/${slug}/package.pak`, pakContent, `Add ${slug} package.pak`, branch);

	const prRes = await fetch(`${BASE}/api/v1/repos/${REPO}/pulls`, {
		method: 'POST',
		headers: authHeaders(token),
		body: JSON.stringify({ head: branch, base: DEFAULT_BRANCH, title, body })
	});
	if (!prRes.ok) throw new Error(`Forgejo pulls API ${prRes.status}: ${await prRes.text()}`);
	const pr = await prRes.json();
	return { htmlUrl: pr.html_url };
}
