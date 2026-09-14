PakPage
=======

![Svelte](https://img.shields.io/badge/Svelte-FF3E00?style=flat&logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat&logo=pnpm&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat&logo=netlify&logoColor=white)

Web front for [Pak](https://pak.dpdns.org/pak/pakar), a build-from-source package manager.
Nothing here is baked in at build time — package data is fetched live from the self-hosted
Forgejo instance on every request, so the site never needs a rebuild to pick up changes.

```sh
pnpm install
pnpm run dev
```

Package data comes from the public `pak/pakar` repo on `pak.dpdns.org`, no token required by
default. Set `PAKAR_FORGEJO_TOKEN` in a `.env` file only if you need higher API rate limits or the
repo goes private again.

`pnpm run check` for types, `pnpm run test` for the unit tests, `pnpm run build` before shipping.

Contributor cards live in `static/contributors/<slug>/bio.md` — first line `@git <username>`,
optionally a second line `@badges pak,pakpage,pakar` for project tags, rest is your bio.

Licensed [GPL-3.0](./LICENSE).
