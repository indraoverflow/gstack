# SKILL.md workflow

SKILL.md files are **generated** from `.tmpl` templates. To update docs:

1. Edit the `.tmpl` file (e.g. `SKILL.md.tmpl` or `browse/SKILL.md.tmpl`)
2. Run `bun run gen:skill-docs` (or `bun run build` which does it automatically)
3. Commit both the `.tmpl` and generated `.md` files, including a tier 2+ skill's
   `sections/preamble.md` (the shared preamble, rendered by
   `scripts/resolvers/preamble-hoist.ts`; change the preamble resolvers, never that file)

The same `gen:skill-docs` run writes two more generated files from `lib/`:
`review/design-checklist.md` (from `lib/design-catalog.ts`, through
`scripts/resolvers/design-checklist.ts`) and `lib/dom-dump.js` (from
`lib/dom-dump-script.ts`). Edit the catalog or the script source, regenerate,
and commit both; never edit the generated file
(`test/design-checklist-sync.test.ts` fails on drift).

Generation uses each host's `defaultModel` (`claude` for most hosts, `gpt`
for Codex, `gemini` for Antigravity's `agy` and Gemini CLI) unless `--model` is explicit. Codex installs additionally read the
top-level model from `${CODEX_HOME:-~/.codex}/config.toml`; rerun
`./setup --host codex` after changing that model. Note: `bun run build` and a
bare `gen:skill-docs --host codex` render the host default (gpt) — if your
Codex config.toml pins a different model, rerun `./setup --host codex`
afterwards to restore your profile (single-owner persistence is filed in
TODOS.md).

Browser steps in skills are `aside repl` scripts per
`scripts/resolvers/aside.ts`, each with its `$B` equivalent for the fallback
engine. To add a new browse command: add it to `browse/src/commands.ts` and
rebuild. To add a snapshot flag: add it to `SNAPSHOT_FLAGS` in
`browse/src/snapshot.ts` and rebuild. Local-HTML rendering in a skill template
is a `bun run ~/.claude/skills/gstack/bin/gstack-render.ts` call; new render
options go into `lib/aside-render.ts` (which handles the fallback), never into
a skill's own bash.

**Size budgets:** generated SKILL.md files warn above 160KB (~40K tokens);
`test/catalog-budget.test.ts` caps the always-loaded skill catalog at
`CATALOG_BUDGET_TOKEN_EQUIVALENTS` (1,452 today; each new skill ratchets it); and
`test/context-budget-ratchet.test.ts` pins per-skill token ceilings against
`test/fixtures/context-budget.json` (for legitimate growth or a landed
reduction, re-run `bun test/helpers/capture-context-budget.ts` and commit the
refreshed fixture in the same commit). Rationale and protocol:
[docs/CONTRIBUTOR_REFERENCE.md](docs/CONTRIBUTOR_REFERENCE.md#skill-size-budgets).

**Merge conflicts on SKILL.md files:** NEVER resolve conflicts on generated SKILL.md
files by accepting either side. Instead: (1) resolve conflicts on the `.tmpl` templates
and `scripts/gen-skill-docs.ts` (the sources of truth), (2) run `bun run gen:skill-docs`
to regenerate all SKILL.md files, (3) stage the regenerated files. Accepting one side's
generated output silently drops the other side's template changes.
