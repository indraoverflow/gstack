# Running evals as an agent: always detach (SIGTERM-proof)

Never run a long eval as a plain backgrounded Bash task: a turn-boundary SIGTERM
kills it mid-flight. Run paid evals in the background with `bun run eval:bg:pr`
(diff-selected PR gate) or `bun run eval:bg:release` (full gate + periodic);
`eval:bg:gate` and `eval:bg:periodic` run one tier. All four run
`scripts/eval-bg.ts`, which prints `[eval-bg] backend=<dispatch|local> …` and
`gstack-detach LOG <path>`, then returns immediately.

- **Dispatch backend** (default when HEAD is clean and pushed to garrytan/gstack
  and `gh` can dispatch): CI runs the lane on the pushed revision (`evals.yml`
  and/or `evals-periodic.yml`, verified by `expected_sha`); the local log follows
  the run and names its URL. Dispatched runs are validation runs: fresh, never
  writing PR receipts. Commit and push first; uncommitted files or unpushed
  commits fall back to local and the log says why.
- **Local backend** (dirty tree, unpushed commits, a fork, no `gh`, or `--local`):
  the sharded runner on this machine, capped at ceil(1.5 × planned serial seconds
  / EVALS_JOBS) + 20 min, at most 4 h (`--timeout SECS` overrides). Export
  `ANTHROPIC_API_KEY` first (never pass keys in argv).
- **Forcing**: `--dispatch` refuses with the fix ("commit and push, or rerun with
  --local") instead of falling back; `--local` or `GSTACK_EVAL_BG_MODE=local`
  always runs here.
- **Waiting**: poll the log until `### gstack-detach EXIT=<code> ###` (0 passed,
  1 failed, 130 cancelled, 2 other); silence is not success. Keep checking until
  it appears or the user tells you to stop, and report progress at each check.
  `bun run scripts/eval-bg.ts status <log-or-run-id>` prints running, passed,
  failed, cancelled or incomplete (died without a sentinel).
- Both backends hold the machine-wide `gstack-evals` lock, so concurrent
  worktrees queue instead of saturating the API; logs live under
  `~/.gstack-dev/eval-runs/`. A second `eval:bg:<lane>` for the same revision and
  base follows the queued, running or green dispatch instead of dispatching again.

Humans running evals in their own terminal don't need this. Backends, caps and
knobs: [docs/TESTING_INTERNALS.md](docs/TESTING_INTERNALS.md#running-evals-as-an-agent-detach).
