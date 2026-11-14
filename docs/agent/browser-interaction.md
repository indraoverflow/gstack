# Browser interaction

gstack drives the Aside AI browser (macOS 15+) first and falls back to its own
browser engine when Aside is absent. When you need to interact with a browser
(QA, dogfooding, inspecting a page), use the `/browse` skill: it probes Aside
and, on `READY`, drives it — the user's real browser with their real sessions —
through `aside repl` scripts that follow the contract in
`scripts/resolvers/aside.ts` (`{{ASIDE_SETUP}}`). Every browser skill (`/qa`,
`/qa-only`, `/design-review`, `/canary`, `/benchmark`, `/scrape`) does the same,
and web research in skills runs through Aside's agent (`{{ASIDE_RESEARCH}}`)
before the WebSearch tool. When the probe says `NEEDS_ASIDE` or
`ASIDE_NOT_RUNNING` (Linux, Windows, a closed Aside app), the skill resolves
`$B` per `{{BROWSE_FALLBACK}}` and runs the browse binary instead — `$B <command>`
is a legitimate tool in that context, and cookie import, GStack Browser headed
mode, `/pair-agent`, and browser-skills/`/skillify` belong to it. Local HTML a
skill generated itself (make-pdf, diagram, design previews) renders through
`bin/gstack-render.ts` / `lib/aside-render.ts`, which serve the file on
loopback and print or screenshot it in Aside, or in the engine when Aside is
absent — never point the renderer at a site. NEVER use
`mcp__claude-in-chrome__*` tools — they are slow, unreliable, and not what this
project uses.

**Server / sidebar / extension internals:** before editing `browse/src/server.ts`,
`extension/`, the sidebar PTY, any SSE endpoint, or CDP session code, read
[docs/BROWSER_INTERNALS.md](docs/BROWSER_INTERNALS.md) — sidebar message flow,
WebSocket auth, tunnel dual-listener rules, Unicode sanitization at egress,
SSE/CDP helpers, setup symlink hardening, and the sidebar security stack all
live there, each pinned by a CI tripwire.

**Egress receipts at every off-machine sink** (v1.63.0.0+). Every gstack-initiated
send off the machine MUST write a receipt BEFORE the send: TypeScript callers use
`writeReceipt` from `lib/egress-receipt.ts`; shell scripts source
`bin/gstack-egress-lib.sh` and use `_receipted_curl` / `_receipted_git`.
`test/egress-receipt-wiring.test.ts` fails CI on an unreceipted new sink.
Failure polarity, scanner exemptions and the `_aside_exec` wrapper:
[docs/CONTRIBUTOR_REFERENCE.md](docs/CONTRIBUTOR_REFERENCE.md#egress-receipts).
