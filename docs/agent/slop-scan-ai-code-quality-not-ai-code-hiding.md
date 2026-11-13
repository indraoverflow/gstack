# Slop-scan: AI code quality, not AI code hiding

We use [slop-scan](https://github.com/benvinegar/slop-scan) to catch patterns where
AI-generated code is genuinely worse than what a human would write. We are NOT trying
to pass as human code. We are AI-coded and proud of it. The goal is code quality.

```bash
npx slop-scan scan .          # human-readable report
npx slop-scan scan . --json   # machine-readable for diffing
```

Config: `slop-scan.config.json` at repo root (currently excludes `**/vendor/**`).

Before fixing any finding, read [docs/SLOP_SCAN.md](docs/SLOP_SCAN.md):
it separates genuine quality fixes (empty catches around file ops → 
`safeUnlink()`, process kills → `safeKill()`) from linter gaming we
reject (string-matching error messages, tightening best-effort cleanup).
Utilities live in `lib/error-handling.ts`. Don't chase the score.
