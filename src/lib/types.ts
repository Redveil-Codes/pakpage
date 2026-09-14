export interface PakBuild {
	CC?: string;
	SRC?: string;
	DEPENDENCIES?: string | string[];
	BUILDDIR?: string;
	BIN?: string;
	LIB?: string;
	INSTALL_BIN?: string;
	INSTALL_LIB?: string;
	BUILD_SCRIPT?: string[];
	[key: string]: unknown;
}

export interface LastCommit {
	hash: string;
	authorName: string;
	authorEmail: string;
	date: string;
	message: string;
}

export interface Package {
	slug: string;
	dir: string;
	name: string;
	version: string | number | null;
	description: string;
	homepage: string | null;
	license: string | null;
	dependencies: string[];
	pak: PakBuild | null;
	lastCommit: LastCommit | null;
}
