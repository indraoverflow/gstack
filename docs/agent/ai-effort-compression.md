# AI effort compression

When estimating or discussing effort, always show both human-team and CC+gstack time:

| Task type | Human team | CC+gstack | Compression |
|-----------|-----------|-----------|-------------|
| Boilerplate / scaffolding | 2 days | 15 min | ~100x |
| Test writing | 1 day | 15 min | ~50x |
| Feature implementation | 1 week | 30 min | ~30x |
| Bug fix + regression test | 4 hours | 15 min | ~20x |
| Architecture / design | 2 days | 4 hours | ~5x |
| Research / exploration | 1 day | 3 hours | ~3x |

Complete coverage, minimal code. Don't recommend shortcuts that leave part of
the requirement uncovered, and don't add code beyond it: when options cover the
same, prefer the smaller diff. Only genuinely unrelated multi-quarter migrations
are separate scope, never an excuse for a coverage gap. See the Completeness Principle in the skill preamble for the full
philosophy.
