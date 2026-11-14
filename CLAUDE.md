# gstack development

## Commands

```bash
bun install          # install dependencies
bun run dev <cmd>    # run CLI in dev mode, e.g. bun run dev goto https://example.com
bun run typecheck    # strict tsc over product code (zero errors required)
bun run typecheck:test  # test-code type-debt ratchet
bun run build        # gen docs + compile binaries
bun run gen:skill-docs  # regenerate SKILL.md files from templates
bun run skill:check  # health dashboard for all skills
bun run dev:skill    # watch mode: auto-regen + validate on change
bun run slop          # full slop-scan report (all files)
bun run slop:diff     # slop findings in files changed on this branch only
bun run audit:manifest  # file slices for /claude-api prompt-audit; rerun it at each frontier-model release (CONTRIBUTING.md)
```

Test and eval commands, their cost and what each needs live in one table:
[Which command do I run?](CONTRIBUTING.md#which-command-do-i-run). The two you
need most are `bun run test` (free acceptance) and `bun run eval:bg:pr` (paid,
changed coverage). Retired names such as `test:evals` and `test:e2e` print their
replacement and exit 1.

Paid evals require `ANTHROPIC_API_KEY`. Codex E2E tests (`test/codex-e2e.test.ts`,
`test/codex-e2e-sol-scope.test.ts`) use Codex's own auth — the hermetic runner copies
only `auth.json` from `${CODEX_HOME:-~/.codex}` and pins `CODEX_HOME` in the child
env — no `OPENAI_API_KEY` env var needed.

**Hermetic E2E + env keys:** every E2E runner spawns children through
`test/helpers/hermetic-env.ts` (allowlist-scrubbed env, fresh seeded
`CLAUDE_CONFIG_DIR`, temp `GSTACK_HOME`, `--strict-mcp-config`); per-test
`env:` overrides merge last onto a COMPLETE hermetic env, so they're safe.
A PTY test that types a `/skill` command must pass `seedSkills: true`.
Debug against real operator state with `EVALS_HERMETIC=0`. Full detail
(env-shim, seeding tripwires, wiring tests):
[docs/TESTING_INTERNALS.md](docs/TESTING_INTERNALS.md).

**Test selection and tiers:** the sharded paid runner (`test:pr`,
`eval:bg:pr`, `test:gate:sharded`) selects tests from `git diff` through the
dependency lists in `test/helpers/touchfiles.ts` (`EVALS_ALL=1` forces
everything; `eval:select` previews the PR profile, `--profile full` the plain
touchfile selection). Classify every new E2E test in `E2E_TIERS`: safety guardrail or
deterministic functional test -> `gate`; quality benchmark, Opus model test,
non-deterministic, or external service (Codex, Gemini) -> `periodic`.
`test/e2e-tier-alignment.test.ts` enforces the tiers. CI lanes and periodic
exclusions: [docs/TESTING_INTERNALS.md](docs/TESTING_INTERNALS.md#test-selection-and-tiers).

## Testing

```bash
bun run test         # final full free acceptance after focused repairs and source freeze
bun run eval:bg:pr   # required changed PR coverage, with explicit deferrals
```

Follow [validation discipline](docs/agent/validation-discipline.md):
prove repairs with focused checks first, complete required selected evaluations,
then run the full free suite once on the final integrated code. During repairs,
focused checks replace a full-suite run before every commit.

`bun run test` routes through `scripts/test-free-shards.ts`, whose strict
per-shard classification fails a shard that lacks bun's summary line.
`TREE_MUTATING` lists the files that still run in their own trailing serial
shard (today only `test/bootstrap-retention.test.ts`). Never type
bare `bun test` for the suite: it walks the whole repo, loading paid eval files
and missing the strict classifier. `bun run test:pr` runs the selected short
live behaviors and quality judges and reports deferred broad coverage. Full free
acceptance and required PR checks must pass before publishing. See
[testing policy](CONTRIBUTING.md#test-tiers) for commands and measured targets.
Tests that need Aside itself self-skip unless a Mac has the Aside app open.
Shard packing, judge reuse and engine skips:
[docs/TESTING_INTERNALS.md](docs/TESTING_INTERNALS.md#free-suite-runner-judge-reuse-and-engine-skips).

New or changed tests follow the [test value bar](docs/test-value-bar.md): each one
protects behavior a real regression would break, and contract tests (SKILL.md
goldens, and prompt bytes that are a contract as defined below) stay. The bar's
source is `scripts/resolvers/test-value.ts`.

In this repo, prompt bytes are a contract only when software reads them (a
parser, hook, grader or another skill consumes the exact text) or a recorded
eval shows the wording matters. Tests on skill templates and generated SKILL.md
pin structure, step order, routing tables, machine-read markers and
safety-critical lines; check safety lines case-insensitively, on meaning rather
than capitals. Leave behavior to E2E cases and judges. Don't pin emphasis,
capitalization, issue numbers, or a sentence a behavioral check already covers,
and when a rewrite changes a pinned sentence, replace the pin with a structural
or meaning-level check instead of pinning the new sentence. The terms are defined
in [docs/test-value-bar.md](docs/test-value-bar.md) ("Prompt-byte contract",
"Sentence pin"). Use `test/helpers/prompt-structure.ts` (`between`,
`expectTokens`, `expectAbsent`, `expectOrdered`, `expectMentions`) for
template/SKILL.md checks: tokens and order exactly, safety rules as
case-insensitive keyword co-occurrence in one sentence.
Projects tune `/ship`'s coverage gate with optional CLAUDE.md `## Test Coverage`
keys, all absent by default: `Minimum:`, `Target:`, `Generation cap:` (default 5),
`Base control:` (`auto` or `off`), `Base control budget:` (seconds, default 90) and
`Star rating:` (`auto` or `off`).

## Commit style

**Always bisect commits.** Every commit should be a single logical change. When
you've made multiple changes (e.g., a rename + a rewrite + new tests), split them
into separate commits before pushing. Each commit should be independently
understandable and revertable.

Examples of good bisection:
- Rename/move separate from behavior changes
- Test infrastructure (touchfiles, helpers) separate from test implementations
- Template changes separate from generated file regeneration
- Mechanical refactors separate from new features

When the user says "bisect commit" or "bisect and push," split staged/unstaged
changes into logical commits and push.

## Redaction guard (PII / secrets / legal content)

`lib/redact-patterns.ts` + `lib/redact-engine.ts` (CLI `bin/gstack-redact`,
opt-in hook `bin/gstack-redact-prepush`) catch credentials, PII and legal content
before an external sink. It is a **guardrail, not airtight enforcement**; never
claim it stops a determined leaker. Always scan the EXACT bytes that will be
sent, and render skill docs from `scripts/resolvers/redact-doc.ts`. Tiers,
visibility, fences and config keys:
[docs/CONTRIBUTOR_REFERENCE.md](docs/CONTRIBUTOR_REFERENCE.md#redaction-guard).

## Compiled binaries — never commit browse/dist/, design/dist/, or make-pdf/dist/

The `browse/dist/`, `design/dist/`, and `make-pdf/dist/` directories contain
compiled Bun binaries (`browse`, `find-browse`, `design`, ~62MB each). These are
Mach-O arm64 only — they do NOT work on Linux, Windows, or Intel Macs. The
`./setup` script builds from source for every platform.

These directories are **untracked and gitignored** (`.gitignore:3-6`; the
`browse/dist/` binaries were untracked in `64d5a3e4`, v0.11.16.0; the others were
never tracked). They will NOT appear in `git status`. If a dist binary ever does
show up in `git status`, something force-added it (`git add -f`) — do not commit
it; unstage it and find out how it got there.

When staging files, always use specific filenames (`git add file1 file2`) — never
`git add .` or `git add -A`, which can sweep in build outputs and junk.

## Reference: read on demand

These sections used to sit in this file and were paid for on every request. Open the one you need,
when the task touches it. A plain path is a pointer, not an import: it costs nothing until the file
is opened.

| Before you | Read |
|---|---|
| add, move, or look for a file | `docs/agent/project-structure.md` |
| create or change a skill | `docs/agent/skill-md-workflow.md` |
| put platform specifics into shared code | `docs/agent/platform-agnostic-design.md` |
| edit a skill template | `docs/agent/writing-skill-templates.md` |
| write user-facing copy or a skill description | `docs/agent/writing-style-v1.md` |
| touch the browser layer | `docs/agent/browser-interaction.md` |
| run anything that resolves `browse` or `design` links | `docs/agent/dev-symlink-awareness.md` |
| read a slop finding or add a rule to the scanner | `docs/agent/slop-scan-ai-code-quality-not-ai-code-hiding.md` |
| review or merge a community PR | `docs/agent/community-pr-guardrails.md` |
| check out a PR from that account | `docs/agent/checking-out-prs-from-garrytan-agents.md` |
| bump the version or edit CHANGELOG | `docs/agent/changelog-version-style.md` |
| write prose, comments, or commit messages | `docs/agent/ai-effort-compression.md` |
| start a feature or a script from scratch | `docs/agent/search-before-building.md` |
| write a plan file | `docs/agent/local-plans.md` |
| explain an eval failure | `docs/agent/e2e-eval-failure-blame-protocol.md` |
| run an eval from an agent session | `docs/agent/running-evals-as-an-agent-always-detach-sigterm-proof.md` |
| add or change an E2E fixture | `docs/agent/e2e-test-fixtures-extract-don-t-copy.md` |
| publish a skill to ClawHub | `docs/agent/publishing-native-openclaw-skills-to-clawhub.md` |
| deploy to the skill in use | `docs/agent/deploying-to-the-active-skill.md` |
| decide which skill should handle a request | `docs/agent/skill-routing.md` |
| record or recall a decision across sessions | `docs/agent/cross-session-decision-memory.md` |
| use gbrain search | `docs/agent/gbrain-search-guidance-configured-by-sync-gbrain.md` |
