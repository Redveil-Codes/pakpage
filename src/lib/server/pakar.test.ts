import { describe, expect, it } from 'vitest';
import { parsePak, slugify } from './pakar';

describe('parsePak', () => {
	it('parses single-line fields', () => {
		const result = parsePak(
			['CC=gcc', 'SRC=https://example.com/foo', 'BIN=./foo', 'LIB=0', 'INSTALL_BIN=y', 'INSTALL_LIB=n'].join('\n')
		);
		expect(result.CC).toBe('gcc');
		expect(result.SRC).toBe('https://example.com/foo');
		expect(result.BIN).toBe('./foo');
		expect(result.LIB).toBe('0');
		expect(result.INSTALL_BIN).toBe('y');
		expect(result.INSTALL_LIB).toBe('n');
	});

	it('parses a multi-line BUILD_SCRIPT block into an array', () => {
		const result = parsePak(['BUILD_SCRIPT=(', '    mkdir -p build', '    cd build', '    make -j16', ')'].join('\n'));
		expect(result.BUILD_SCRIPT).toEqual(['mkdir -p build', 'cd build', 'make -j16']);
	});

	it('parses inline DEPENDENCIES=(a b c) into an array', () => {
		const result = parsePak('DEPENDENCIES=(a b c)');
		expect(result.DEPENDENCIES).toEqual(['a', 'b', 'c']);
	});

	it('parses an empty DEPENDENCIES= as an empty string', () => {
		const result = parsePak('DEPENDENCIES=');
		expect(result.DEPENDENCIES).toBe('');
	});

	it('skips blank lines and lines that are not KEY=VALUE', () => {
		const result = parsePak(['# not a real comment marker in this format', '', 'CC=gcc', ''].join('\n'));
		expect(result.CC).toBe('gcc');
	});
});

describe('slugify', () => {
	it('lowercases and replaces spaces with dashes', () => {
		expect(slugify('Hello World')).toBe('hello-world');
	});

	it('collapses punctuation and repeated separators into a single dash', () => {
		expect(slugify('Foo!! Bar__Baz')).toBe('foo-bar-baz');
	});

	it('strips leading and trailing dashes', () => {
		expect(slugify('--Foo Bar--')).toBe('foo-bar');
	});

	it('leaves an already-clean slug untouched', () => {
		expect(slugify('cmatrix')).toBe('cmatrix');
	});
});
