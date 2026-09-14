import { env } from '$env/dynamic/private';

const CLIENT_ID = env.FORGEJO_OAUTH_CLIENT_ID;
const CLIENT_SECRET = env.FORGEJO_OAUTH_CLIENT_SECRET;
const BASE = env.PAKAR_FORGEJO_BASE ?? 'https://pak.dpdns.org';
const SCOPE = 'write:repository';

export interface TokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
}

export interface ForgejoUser {
	login: string;
	avatar_url: string;
}

export function authorizeUrl(redirectUri: string, state: string): string {
	const params = new URLSearchParams({
		client_id: CLIENT_ID ?? '',
		redirect_uri: redirectUri,
		response_type: 'code',
		state,
		scope: SCOPE
	});
	return `${BASE}/login/oauth/authorize?${params}`;
}

export async function exchangeCode(code: string, redirectUri: string): Promise<TokenResponse> {
	const res = await fetch(`${BASE}/login/oauth/access_token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			code,
			grant_type: 'authorization_code',
			redirect_uri: redirectUri
		})
	});
	if (!res.ok) throw new Error(`Forgejo token exchange ${res.status}`);
	return res.json();
}

export async function getForgejoUser(accessToken: string): Promise<ForgejoUser> {
	const res = await fetch(`${BASE}/api/v1/user`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	if (!res.ok) throw new Error(`Forgejo user fetch ${res.status}`);
	return res.json();
}
