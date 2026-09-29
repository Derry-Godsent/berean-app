# Berean

Berean is an interactive Bible-reading web application. It combines Scripture
reading, story seasons, questions, games, history, community discussion,
offline downloads and a pastor workspace.

## Source code

The editable source is in this project:

- `src/App.tsx` routes into the app
- `src/berean/Berean.tsx` is the app entry point
- `src/screens/` contains the product screens
- `src/app/` contains state, themes, offline storage, sync and the answer engine
- `src/data/` contains the Bible metadata and authored content
- `public/images/` contains the artwork
- `worker/` contains the optional AI answer service

If your coding workspace has a Files panel, download the project folder from
there. A Git repository is the best long-term home for the source: upload this
folder to GitHub or GitLab, then clone it on any computer.

## Run locally

Requirements: Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```sh
npm run build
```

The deployable output is generated in `dist/`. This project has been built and
verified locally, but it has not been uploaded to a public hosting provider.

## Deploy

The simplest free options are Cloudflare Pages, Netlify or Vercel. Connect the
Git repository, use `npm run build` as the build command, and `dist` as the
output directory.

The current account and progress system is device-local. Cross-device accounts,
church roles and multi-phone chat need a hosted backend before public launch.