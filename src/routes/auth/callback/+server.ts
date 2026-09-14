import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exchangeCode } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const expectedState = cookies.get('oauth_state');
	cookies.delete('oauth_state', { path: '/' });

	if (!code || !state || !expectedState || state !== expectedState) {
		error(400, 'invalid oauth state');
	}

	const redirectUri = `${url.origin}/auth/callback`;
	const token = await exchangeCode(code, redirectUri);

	cookies.set('fj_token', token.access_token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: url.protocol === 'https:',
		maxAge: token.expires_in
	});

	const redirectTo = cookies.get('oauth_redirect') ?? '/submit';
	cookies.delete('oauth_redirect', { path: '/' });
	redirect(302, url.origin + redirectTo);
};
