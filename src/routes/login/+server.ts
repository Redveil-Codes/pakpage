import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authorizeUrl } from '$lib/server/auth';

export const GET: RequestHandler = ({ url, cookies }) => {
	const state = crypto.randomUUID();
	const redirectTo = url.searchParams.get('redirect') ?? '/submit';

	cookies.set('oauth_state', state, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 300 });
	cookies.set('oauth_redirect', redirectTo, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 300 });

	const redirectUri = `${url.origin}/auth/callback`;
	redirect(302, authorizeUrl(redirectUri, state));
};
