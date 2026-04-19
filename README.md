# Node.js Backend Academy

Professional documentation site for a phase-by-phase Node.js backend training program built with Astro Starlight.

## What is included

- polished Starlight docs experience for GitHub Pages
- splash homepage with curriculum positioning
- orientation pages for program overview and training format
- four roadmap pages covering the full learning journey
- thirteen module pages mapped to the brochure syllabus
- capstone and tools reference pages
- custom branding, typography, and theme styling

## Local development

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:4321`.

## Production build

```bash
npm run build
```

The static site is generated in `dist/`.

## GitHub Pages notes

The workflow in [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) deploys the built site to GitHub Pages.

`astro.config.mjs` derives `base` from `GITHUB_REPOSITORY` during GitHub Actions builds:

- user or organization site repos such as `username.github.io` build with `/`
- project site repos build with `/<repo-name>/`

That keeps the site usable on GitHub Pages without hardcoding a repository name locally.
