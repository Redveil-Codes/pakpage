import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ cookies, url }) => {
	cookies.delete('fj_token', { path: '/' });
	redirect(302, url.origin + '/');
};
