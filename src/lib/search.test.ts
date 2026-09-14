import { describe, expect, it } from 'vitest';
import { getPackageBySlug, searchPackages } from './search';
import type { Package } from './types';

function pkg(overrides: Partial<Package>): Package {
	return {
		slug: 'pkg',
		dir: 'pkg',
		name: 'pkg',
		version: '1.0.0',
		description: '',
		homepage: null,
		license: null,
		maintainer: null,
		dependencies: [],
		pak: null,
		yamlRaw: '',
		pakRaw: null,
		commits: [],
		firstCommit: null,
		lastCommit: null,
		...overrides
	};
}

const cmatrix = pkg({
	slug: 'cmatrix',
	name: 'cmatrix',
	description: 'terminal based matrix rain animation',
	license: 'GPL-3.0',
	maintainer: 'abishekvashok',
	dependencies: ['ncurses']
});

const ncurses = pkg({
	slug: 'ncurses',
	name: 'ncurses',
	description: 'library for text-based user interfaces',
	license: 'X11',
	maintainer: 'Thomas E. Dickey',
	dependencies: []
});

const neofetch = pkg({
	slug: 'neofetch',
	name: 'neofetch',
	description: 'command-line system information tool',
	license: 'MIT',
	maintainer: 'dylanaraps',
	dependencies: []
});

const packages = [cmatrix, ncurses, neofetch];

describe('searchPackages', () => {
	it('returns everything for an empty query', () => {
		expect(searchPackages(packages, '')).toHaveLength(3);
		expect(searchPackages(packages, '   ')).toHaveLength(3);
	});

	it('ranks an exact name match above a substring match', () => {
		const withSubstringMatch = pkg({ slug: 'catmatrix', name: 'catmatrix', description: '' });
		const results = searchPackages([withSubstringMatch, cmatrix], 'cmatrix');
		expect(results[0].slug).toBe('cmatrix');
	});

	it('does not match a package just because something depends on it', () => {
		const results = searchPackages(packages, 'ncurses');
		expect(results.map((p) => p.slug)).toEqual(['ncurses']);
	});

	it('d: explicitly matches packages that depend on the given name', () => {
		const results = searchPackages(packages, 'd:ncurses');
		expect(results.map((p) => p.slug)).toEqual(['cmatrix']);
	});

	it('l: filters by license', () => {
		const results = searchPackages(packages, 'l:MIT');
		expect(results.map((p) => p.slug)).toEqual(['neofetch']);
	});

	it('m: filters by maintainer', () => {
		const results = searchPackages(packages, 'm:dylanaraps');
		expect(results.map((p) => p.slug)).toEqual(['neofetch']);
	});

	it('combines multiple space-separated tokens with AND semantics', () => {
		const both = searchPackages(packages, 'd:ncurses l:GPL-3.0');
		expect(both.map((p) => p.slug)).toEqual(['cmatrix']);

		const noMatch = searchPackages(packages, 'd:ncurses l:MIT');
		expect(noMatch).toHaveLength(0);
	});

	it('returns nothing for a query that matches no package', () => {
		expect(searchPackages(packages, 'doesnotexist')).toHaveLength(0);
	});
});

describe('getPackageBySlug', () => {
	it('finds a package by slug', () => {
		expect(getPackageBySlug(packages, 'ncurses')).toBe(ncurses);
	});

	it('returns undefined for an unknown slug', () => {
		expect(getPackageBySlug(packages, 'nope')).toBeUndefined();
	});
});
