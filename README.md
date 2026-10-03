# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Swapping in real back-end data

All app data lives in five JSON files in `src/data/`: `rules.json`, `lookups.json`, `changes.json`, `addresses.json` and `sources.json`. Replace them with real back-end output that matches the same data contract (same field names and value types).

`src/data/index.ts` is the single loader: every screen reads through it, and it validates each record with zod on load. Malformed records are skipped (never crash the app), logged to the console, and listed under "Data issues" on the `/audit` page.
