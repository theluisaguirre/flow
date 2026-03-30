# Sync

Reconcile `.flow/STATE.md` with git history.

## Contract

**Triggers:** "sync state", "state is out of date", or after vibing, force-pushes, reverts, or when STATE.md feels wrong.
**Inputs:** `.flow/STATE.md` (may be stale or missing). Git history as source of truth.
**Outputs:** Updated `.flow/STATE.md` — tasks reconciled against commits, new vibe entries logged, mode preserved. Sync report to stdout.
**Edge cases:**
- STATE.md missing entirely → reconstruct from git: infer phase from branch name, build plan from commits (all marked done), set mode to vibe
- Merge conflict in progress → warn "merge conflict detected, resolve before syncing", stop
- Git log since last STATE.md update returns nothing → report "no new commits, state unchanged"
- Task marked done but related files were reverted → uncheck the task, note in report

## Steps

### 1. Read current STATE.md

Read `.flow/STATE.md`. Extract:
- Current phase number, name, and mode from `## Current: Phase {N} — {name} ({mode} mode)`
- All tasks under `### Plan` with their checkbox state
- All entries under `### Vibed`

If STATE.md is **missing** (even after bootstrap), skip to Step 5.

### 2. Read git reality

Run these commands:
- `git log --oneline --since="$(git log -1 --format=%ci .flow/STATE.md 2>/dev/null || echo '7 days ago')"` — commits since last STATE.md update
- `git diff main...HEAD --stat` — files changed on this branch
- `git status --short` — uncommitted work
- `git branch --show-current` — current branch

### 3. Compare and reconcile

For each task under `### Plan`:
- Search git log messages and diff stat for files/keywords related to the task.
- If commits provide evidence the task is done, mark `[x]`.
- If the task was previously `[x]` but related files were reverted or removed, mark `[ ]`.

For each commit **not** matching any planned task:
- Add an entry under `### Vibed` with format: `- {short description} ({date})`

### 4. Write updated state and report

**Write the updated `.flow/STATE.md`** — this is mandatory, not optional.

Also update `.planning/dev-session.json` if it exists, to keep the toolbar in sync.

If issues were found during reconciliation (structural problems beyond simple task state), suggest `/flow:cleanup` for a full audit.

```
Sync Report
Checked: {N} tasks now marked done
Unchecked: {N} tasks reverted
New vibe entries: {N} commits logged
Uncommitted: {N} files
→ STATE.md updated
```

### 5. Reconstruct from git (missing STATE.md only)

If STATE.md was missing:
- Infer phase from branch name (e.g. `feat/auth` → "Auth").
- Build `### Plan` from commit messages — one task per commit, marked `[x]`.
- Set mode to `vibe`.
- Write the reconstructed STATE.md.
- Tell the user: "STATE.md was missing — reconstructed from git. Please review."

## Recommended Next Step

Consult `~/.claude/flow/references/transitions.md` and print the recommended action as the last line of output.
