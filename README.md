# alexgetman.com

Astro site for [alexgetman.com](https://alexgetman.com): EN/RU posts, public pages, RSS/JSON feeds, agent metadata and static assets.

## Local Development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:4321`.

## Build

```bash
npm run build
```

The build generates responsive images first and then runs `astro build`.

## Content

Runtime post data is read from `DATA_DIR/feed.json` in production and falls back to `src/data/feed.json` locally.

Public routes include:

- `/` — English home and feed.
- `/ru/` — Russian home and feed.
- `/{post_id}/{english-slug}/` — English posts.
- `/ru/{post_id}/{russian-slug}/` — Russian posts.
- `/feed.xml`, `/feed.json`, `/ru/feed.xml`, `/ru/feed.json` — feeds.
- `/about`, `/ru/about`, `/privacy`, `/ru/privacy` — static SEO and policy pages.

## Deployment Notes

Production deployment still uses existing server paths and service names. Treat those as operational internals until the server migration plan explicitly renames them.

Nginx cache rules live in `deploy/nginx/`. Cloudflare notes live in `docs/alexgetman-cloudflare.md`.
