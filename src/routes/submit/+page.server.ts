import { dump } from 'js-yaml';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getForgejoUser } from '$lib/server/auth';
import { submitPackage } from '$lib/server/submit';
import { slugify } from '$lib/server/pakar';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('fj_token');
	if (!token) return { user: null };

	try {
		const user = await getForgejoUser(token);
		return { user: { login: user.login, avatarUrl: user.avatar_url } };
	} catch {
		cookies.delete('fj_token', { path: '/' });
		return { user: null };
	}
};

function field(form: FormData, key: string): string {
	return (form.get(key) ?? '').toString().trim();
}

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const token = cookies.get('fj_token');
		if (!token) return fail(401, { message: 'You need to log in first.' });

		const form = await request.formData();

		const name = field(form, 'name');
		const version = field(form, 'version');
		const description = field(form, 'description');
		const homepage = field(form, 'homepage');
		const license = field(form, 'license');
		const maintainer = field(form, 'maintainer');
		const dependenciesRaw = field(form, 'dependencies');
		const cc = field(form, 'cc');
		const src = field(form, 'src');
		const builddir = field(form, 'builddir');
		const bin = field(form, 'bin');
		const lib = field(form, 'lib') || '0';
		const installBin = field(form, 'install_bin') === 'y' ? 'y' : 'n';
		const installLib = field(form, 'install_lib') === 'y' ? 'y' : 'n';
		const buildScriptRaw = field(form, 'build_script');

		const slug = slugify(field(form, 'slug') || name);
		const dependencies = dependenciesRaw.split(/[\s,]+/).filter(Boolean);
		const buildLines = buildScriptRaw
			.split(/\r?\n/)
			.map((l) => l.trim())
			.filter(Boolean);

		const required: Record<string, string> = { name, slug, version, description, homepage, license, maintainer, src, builddir, bin };
		const missing = Object.entries(required)
			.filter(([, v]) => !v)
			.map(([k]) => k);
		if (!buildLines.length) missing.push('build_script');
		if (missing.length) {
			return fail(400, { message: `Missing required field(s): ${missing.join(', ')}` });
		}

		const yamlObj: Record<string, unknown> = { name, slug, version, description, homepage, license, maintainer };
		if (dependencies.length) yamlObj.dependencies = dependencies;
		const yamlContent = dump(yamlObj, { lineWidth: -1 });

		const pakContent =
			[
				`CC=${cc}`,
				`SRC=${src}`,
				`DEPENDENCIES=(${dependencies.join(' ')})`,
				`BUILDDIR=${builddir}`,
				`BIN=${bin}`,
				`LIB=${lib}`,
				`INSTALL_BIN=${installBin}`,
				`INSTALL_LIB=${installLib}`,
				'BUILD_SCRIPT=('
			].join('\n') +
			'\n' +
			buildLines.map((l) => `    ${l}`).join('\n') +
			'\n)\n';

		try {
			const result = await submitPackage(
				token,
				slug,
				yamlContent,
				pakContent,
				`Add ${name}`,
				`Adds the \`${slug}\` package.\n\nSubmitted via the pakpage submission form.`
			);
			return { success: true, prUrl: result.htmlUrl };
		} catch (e) {
			return fail(500, { message: e instanceof Error ? e.message : 'submission failed' });
		}
	}
};
