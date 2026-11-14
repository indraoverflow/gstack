# CHANGELOG + VERSION style

**Choose versions autonomously; default to PATCH.** Garry delegates release
version decisions to the agent. Do not ask him to choose or approve a version,
including when an already-approved version collides with another PR. This policy
overrides generic version-approval prompts in `/ship` and `/document-release`.

Prefer **PATCH (X.Y.Z+1.0)** for ordinary releases, including fixes, additions,
refactors, test infrastructure and coordinated multi-file work. Diff size alone
is not a reason to choose MINOR. Choose **MINOR (X.Y+1.0.0)** or **MAJOR
(X+1.0.0.0)** only when calling the release a patch would be plainly misleading
("ridiculous"), such as an incompatible public-interface change or a genuinely
new product-scale release. Make that judgment without another approval question.

gstack's policy sets `changelog_fragments` (#3654), so a branch never writes a
version and never checks `bin/gstack-next-version` for a slot. The merge
train's stamp (`train land`) assigns base + PATCH at merge. To ask for more,
open the branch's fragment with `bump: minor` (or `major`) front matter. A
higher base version does not itself require a MINOR bump. Keep the PR READY for
the merge train; autonomous version decisions do not authorize merging,
deploying or skipping required validation.

**The CHANGELOG entry is a branch fragment.** Each shipping branch writes one
entry at `/ship` time as `changelog.d/<branch-slug>.md` (entry text only, no
`## [x]` heading) that describes what THIS branch adds versus main, for users,
with no branch-internal versions or development narrative. A branch never edits
VERSION, package.json or a released CHANGELOG.md section: the merge stamp folds
the fragment into CHANGELOG.md under its version, keeps VERSION 4-digit and
writes package.json's 3-digit npm translation through `bin/gstack-version-bump`
([changelog fragments](docs/ship-policy.md#changelog-fragments)). Read
[docs/CHANGELOG_STYLE.md](docs/CHANGELOG_STYLE.md) BEFORE writing an entry: it
holds the versioning invariant, the merge-main checks, what stays out and the
entry format. Always credit community contributions with
`Contributed by @username`.
