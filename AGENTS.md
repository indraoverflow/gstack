# gstack — AI Engineering Workflow

gstack is a collection of SKILL.md files that give AI agents structured roles for
software development. Each skill is a specialist: CEO reviewer, eng manager,
designer, QA lead, release engineer, debugger, and more.

## Available skills

Skills live in `.agents/skills/` (or `~/.claude/skills/gstack/` on Claude Code). Invoke by name, e.g. `/office-hours`.
One line per skill, with what it does, is in `docs/agent/skill-catalog.md`.

**Plan-mode reviews**: `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/plan-devex-review`, `/plan-tune`, `/autoplan`, `/design-consultation`, `/spec`

**Implementation + review**: `/review`, `/deslop-shared-libs`, `/write-skill`, `/test-audit`, `/codex`, `/claude-code`, `/investigate`, `/verify`, `/design-review`, `/design-shotgun`, `/design-html`, `/design-motion`, `/devex-review`, `/qa`, `/qa-only`, `/scrape`, `/skillify`

**Release + deploy**: `/ship`, `/land-and-deploy`, `/modernize`, `/canary`, `/landing-report`, `/document-release`, `/document-generate`, `/setup-deploy`, `/gstack-upgrade`

**Operational + memory**: `/context-save`, `/context-restore`, `/learn`, `/retro`, `/health`, `/captain`, `/benchmark`, `/ubicloud`, `/runaway-stopper`, `/benchmark-models`, `/eval-plan`, `/cso`, `/setup-gbrain`, `/sync-gbrain`

**Browser + agent integration**: `/browse`, `/open-gstack-browser`, `/setup-browser-cookies`, `/pair-agent`

**iOS QA — drive real iPhones over USB or Tailscale (v1.43.0.0+)**: `/ios-qa`, `/ios-fix`, `/ios-design-review`, `/ios-clean`, `/ios-sync`

**Safety + scoping**: `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/make-pdf`, `/diagram`
## Build commands

```bash
bun install              # install dependencies
bun run typecheck        # strict tsc over product code; must report zero errors
bun run typecheck:test   # test-code type-debt ratchet (new diagnostics fail; --write-baseline locks in fixes)
bun run format:cso       # format lib/cso/*.ts (format:cso:check is the CI gate)
bun run test:quick       # fast measured free subset for edit feedback (not acceptance)
bun run test             # complete free suite via the strict shard runner (no API spend)
bun run eval:bg:pr       # changed live probes + selected judges; dispatches CI when HEAD is clean and pushed, else runs locally
bun run eval:bg:release  # fresh complete gate + periodic live coverage (same backend choice)
bun run test:health      # audit success metrics and weekly health from CI history (free; needs gh)
bun run build            # generate docs + compile binaries
bun run gen:skill-docs   # regenerate SKILL.md files from templates
bun run skill:check      # health dashboard for all skills
```

Every other test and eval command (Ubicloud, the Windows subset, one paid tier
or case, branch validation in CI, pass rates, plan previews), with its cost and
prerequisites, is in [Which command do I run?](CONTRIBUTING.md#which-command-do-i-run).
Agents poll `eval:bg:*` logs for the `### gstack-detach EXIT=<code> ###` sentinel
([CLAUDE.md](docs/agent/running-evals-as-an-agent-always-detach-sigterm-proof.md)).

## Key conventions

- SKILL.md files are **generated** from `.tmpl` templates. Edit the template, not the output.
- Run `bun run gen:skill-docs --host codex` to regenerate Codex-specific output.
- Browser steps in skills are `aside repl` scripts per `scripts/resolvers/aside.ts` (Aside first), each with a `$B` equivalent for the fallback engine — `$B <command>` is the browse binary and is a legitimate tool when the Aside probe does not print `READY`. Local HTML renders through `bin/gstack-render.ts`, which picks the same way.
- Safety skills (careful, freeze, guard) use inline advisory prose — always confirm before destructive operations.
- State paths resolve through one chain owned by `lib/state-root.ts` and its sourced bash twin `bin/gstack-state-root.sh` (`GSTACK_STATE_ROOT` → `GSTACK_HOME` → `GSTACK_STATE_DIR` → gstack's `CLAUDE_PLUGIN_DATA` → `~/.gstack`; see docs/state-root.md). Skill prose uses `GSTACK_STATE_ROOT=$(bin/gstack-paths --get GSTACK_STATE_ROOT)` with its `${GSTACK_STATE_ROOT:?…}` guard (worktree-isolated Claude Code sessions refuse eval); `test/state-root-ratchet.test.ts` rejects hand-rolled chains.
- Browse daemon HTTP routes are entries in `browse/src/routes/table.ts` (its header shows how to add one); never dispatch on `url.pathname` in `server.ts`.
- Both test lanes run shards through `scripts/lib/shard-engine.ts`; the free and paid runners hold lane policy only. PTY harness code lives in `test/helpers/pty/*` behind the `claude-pty-runner.ts` barrel.
- Outside-voice failure prose (auth, timeout, empty, fallback) comes only from `outsideVoiceFailurePolicy()` in `scripts/resolvers/outside-voice.ts`.
- Every env-var-host fence starts with the shared prelude from `scripts/resolvers/runtime-root.ts` (inserted by its post-render pass); never resolve gstack's root by hand in a template.
- Every Codex run's verdict goes through `lib/outside-review-result.ts`; its reason codes live in `lib/gate-outcomes.ts`, each with a `docs/troubleshooting.md` anchor.
- `test/module-size-ratchet.test.ts` keeps refactored owner modules at or under 800 lines (150 per function) and residual files from growing.
- The `claude` CLI binary resolves via `lib/claude-bin.ts` (re-exported from `browse/src/claude-bin.ts` for browse internals; `Bun.which()` + `GSTACK_CLAUDE_BIN` override). Set `GSTACK_CLAUDE_BIN=wsl` plus `GSTACK_CLAUDE_BIN_ARGS='["claude"]'` to run Claude through WSL on Windows.
- Every Bun gstack starts ignores the working directory's `.env` files and `bunfig.toml`: bun shebangs are `#!/usr/bin/env -S bun --no-env-file --config=/dev/null`, skill prose passes `bun --no-env-file --config=/dev/null`, shipped shell files define `GSTACK_BUN_CONFIG` with the line in `test/bun-entry-isolation.test.ts` (`NUL` when `OSTYPE` is `msys` or `cygwin` and `cygpath` is on `PATH`, where native Bun cannot open `/dev/null`, #3415) and pass `bun --no-env-file --config="${GSTACK_BUN_CONFIG:-/dev/null}"`, TypeScript spawns use `bunIsolationArgs()` from `lib/bun-isolation.ts`, and `bun build --compile` adds `--no-compile-autoload-dotenv --no-compile-autoload-bunfig`. `test/bun-entry-isolation.test.ts` enforces all four.

## Validation in one rule

Before `/ship`, diagnose before changing code, reproduce with the smallest relevant test, and do not
manufacture a pass by lowering thresholds, skipping cases, or rejudging a failure. The full four-step
protocol, with the fixture and evidence rules, is in `docs/agent/validation-discipline.md`.

## Reference: read on demand

| Before you | Read |
|---|---|
| work on validation discipline | `docs/agent/validation-discipline.md` |
| work on platform support | `docs/agent/platform-support.md` |
