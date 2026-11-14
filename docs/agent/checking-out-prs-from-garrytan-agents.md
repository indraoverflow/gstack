# Checking out PRs from garrytan-agents

Fork PRs (for example from `garrytan-agents/gstack`) get no base-repo secrets,
so eval CI fails with empty-env auth. Unless the user says to leave it as a fork
PR, push the branch to `garrytan/gstack` and re-target the PR from there:
[docs/CONTRIBUTOR_REFERENCE.md](docs/CONTRIBUTOR_REFERENCE.md#checking-out-prs-from-garrytan-agents).
