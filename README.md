# Highlights Chicago Reviews

Standalone Next.js and Sanity application for the Highlights Chicago review library.

## Public routes

- `/reviews` — review collection with rating, year, and equipment filters
- `/reviews/[serviceSlug]` — all Google review cards for one service level
- `/reviews/studio` — Sanity Studio for dedicated `reviewCollection` documents

The app uses `basePath: '/reviews'` so it can be deployed as its own Vercel project and reverse-proxied beneath `https://www.highlightschicago.com/reviews`.

## Local setup

1. Copy `.env.example` to `.env.local` and set any environment-specific values.
2. Run `pnpm install`.
3. Run `pnpm dev` and open `http://localhost:3000/reviews`.

The frontend first reads dedicated `reviewCollection` documents. Until those exist, it falls back to the review arrays already stored on `servicePage`, allowing the standalone application to launch before content migration.

To create the dedicated collection documents, provide a Sanity write token and run `pnpm content:migrate`. The migration is idempotent and does not delete or alter the source service documents.

## Deployment

Create a separate Vercel project from this repository. Use the default Next.js build settings and add the Sanity and lead-form variables listed in `.env.example`.

