import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';

export async function load() {
	const raw = readFileSync(join(process.cwd(), 'static', 'why-netlify.md'), 'utf-8');
	return { html: await marked.parse(raw) };
}
