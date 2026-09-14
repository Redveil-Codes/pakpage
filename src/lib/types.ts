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

export interface CommitInfo {
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
	maintainer: string | null;
	dependencies: string[];
	pak: PakBuild | null;
	yamlRaw: string;
	pakRaw: string | null;
	commits: CommitInfo[];
	firstCommit: CommitInfo | null;
	lastCommit: CommitInfo | null;
}

export interface Repo {
	httpsUrl: string;
	cloneUrl: string;
}

export interface ProjectBadge {
	label: string;
	href: string | null;
}

export interface Contributor {
	slug: string;
	username: string;
	name: string;
	avatarUrl: string;
	githubUrl: string;
	bioHtml: string;
	badges: ProjectBadge[];
}
