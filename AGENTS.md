<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- All data is bundled JSON loaded only through `src/data/index.ts` (zod-validated, malformed records skipped into `issues`) — it is the single swap point for the real back end.
- Result logic lives in pure functions in `src/lib/resolve.ts` (date adjustment, guardrails, jurisdiction stack) — keeps it unit-testable in `src/test/resolve.test.ts`.
- All UI strings go through `src/i18n/{en,es}.ts`; rule content stays in English — one dictionary type keeps translations complete.
- No backend, auth or external calls; TTS is a no-op stub behind `FEATURE_TTS` — hackathon scope is front end only.
- The public door lives at `/`; all operational tools share the `/app` shell and URL-synchronised as-of date — keeps compliance work consistent across screens.
