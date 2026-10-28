# Flow Refactor

Whole-project code-health pass. Make the code modular, deduplicated, token-driven and free of slop, **without changing behaviour**.

## Contract

**Triggers:** "clean up the code", "refactor", "make this modular", "remove the slop", "streamline the project", `/flow:refactor`.
**Inputs:** The repo. `.flow/STATE.md` (current phase, design rules). Optional scope argument: a folder, module or check letter (A–E) to limit the pass.
**Outputs:** `.flow/refactor/YYYY-MM-DD-audit.md` (numbered findings by priority), a series of small `refactor:` commits, updated `.flow/STATE.md` with a `### Refactor` log and any deferred items as plan tasks. Summary with before/after metrics.
**Edge cases:**
- Uncommitted changes → ask to commit or stash first; never refactor on a dirty tree
- No tests and no build command → audit only; report "no safety net, fixes limited to A (styles) and D (slop), nothing else applied"
- A fix needs a behaviour or design change → do not apply; add as a task under the current phase plan and move on
- Project is clean → report "nothing to refactor" and the metrics, create no files
- Mid-phase with open build tasks → warn: "Phase {N} has {K} open tasks. Refactor now or finish the phase first?"

## On Enter

Update `.flow/STATE.md` mode line: append `[refactoring]` (like `[debugging]`). Do not change the mode. Set `.planning/dev-session.json` `step` unchanged.

## Process

### 1. Baseline

Run and record:
- Build (project's build command) → warning count
- Tests (project's test command) → pass / fail / skipped counts
- Snapshot or golden tests, if any → pass count
- `git status` → must be clean, else stop and ask
- Size: file count, total lines, files > 800 lines, functions > 80 lines

Write these to the top of `.flow/refactor/YYYY-MM-DD-audit.md` as **Baseline**.

### 2. Map the project

Read the folder structure and `CLAUDE.md`. Produce a one-screen map:
- **Tokens / design source:** the one file that owns styles (or "none: finding A0")
- **Base app:** entry, shell, canvas / main surfaces
- **Feature modules:** one line each (brushes, papers, fills, export, …) with its folder and entry point
- **Shared / core:** packages that everything may depend on
- **Dependency direction:** base → features → core → tokens. Note every arrow that points the wrong way.

**Read `.flow/FIXLOG.md` if it exists.** Count entries per file/module. Three or more in one area is
a finding in its own right (log it as a B-category structural finding): that code keeps breaking, so
the shape is wrong, not just the lines.

Print the map. Ask: "Is this the right split? Anything here that should be its own module?" Wait for the answer. The user's answer defines the target module list.

### 3. Audit

Run every check in `~/.claude/flow/references/refactor-checks.md` for the project's language. Record each finding as:

```
A3. 75 literal styles outside App/Design (8 files: ToolShelfView 21, Popouts 14, …)
    Fix: map each to an existing token; add a token only when no value matches. Est. 3 commits.
B1. App/Canvas uses 92 BrushStudio internals
    Fix: BrushStudio gets a facade (BrushStudioAPI); Canvas talks to it only. Est. 4 commits, needs snapshot tests green.
```

Group by priority order E → A → D → C → B. Mark each finding **mechanical** (safe to batch) or **structural** (one commit each, user approves each).

Write the full list to the audit file. Print a compact version: counts per category plus the top 10.

### 4. Approve

Offer:
- **a) Mechanical only** — apply all E/A/D mechanical fixes in batches, one category per commit
- **b) Mechanical + structural** — a), then walk C and B one finding at a time
- **c) Pick numbers** — user lists finding IDs
- **d) Audit only** — stop here, keep the audit file

Before applying anything: "Commit point is {sha}. Every step is one commit; `git revert` undoes any step."

### 5. Fix loop

For each approved finding, in priority order:

1. Make the change. Smallest coherent unit: one category batch (mechanical) or one module / one duplicate (structural).
2. Build + tests + snapshots. Compare to baseline.
   - Same or better → commit: `refactor({area}): {what}` with the finding ID in the body.
   - Worse → `git checkout .`, mark the finding **reverted: {reason}**, continue.
3. Structural findings only: print a 3-line summary and wait for "go" before the next one.
4. Every 5 commits: print progress `{done}/{total}, warnings {before}→{now}`.

Dead files move to `.flow/archive/YYYY-MM-DD-{original path}`, never deleted.

### 6. Guard the gains

After the pass, add the cheapest guard that keeps each fixed category fixed, if the project doesn't already have one:
- **Styles:** a test or script that greps for literal styles outside the tokens file and fails on hits (`scripts/check-tokens.sh` or a unit test).
- **Boundaries:** a test that greps for imports crossing the wrong way, or package-level `internal` access control.
- **Slop:** build warnings as errors for the touched targets, if the project can take it.
Commit as `chore: guard {category}`. Add a one-line rule to the project's `CLAUDE.md` naming the guard so future sessions keep it green.

### 7. Write state

- `.flow/STATE.md`: add/append `### Refactor` with date, commits applied, findings reverted, findings deferred to plan tasks. Remove `[refactoring]` from the mode line.
- Deferred findings → tasks under the current phase plan, prefixed `refactor:`.
- Audit file: append **After** metrics next to Baseline.

### 8. Summary

```
Refactor complete:
  Applied: N commits (E:n A:n D:n C:n B:n)
  Reverted: N (listed in audit)
  Deferred to plan: N
  Warnings: before → after
  Tests: before → after
  Lines: before → after (files > 800: before → after)
  Guards added: {list}
  Audit: .flow/refactor/YYYY-MM-DD-audit.md
```

## Recommended Next Step

Consult `~/.claude/flow/references/transitions.md` and print `→ Recommended:` as the last line.
