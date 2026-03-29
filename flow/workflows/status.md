# Flow Status

## 1 — Read State

Read `.flow/STATE.md`. If missing: output `Flow not initialized. Run /flow:start` and stop.

Parse the `## Current:` line for phase number, name, and mode.
Count `[x]` (done) and total checkboxes under `### Plan`.
Count entries under `### Vibed`.

**Handoff check:** If STATE.md contains a `### Handoff` section, display the handoff context prominently before the status summary:
```
Resuming from previous session:
  {Context line}
  Mode: {mode} | Branch: {branch} | Uncommitted: {N or 'clean'}
```
Then remove the `### Handoff` section (it's been consumed).

## 2 — Git State

```bash
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "no-repo")
ahead=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo "?")
uncommitted=$(git status --porcelain | wc -l | tr -d ' ')
last_commit=$(git log -1 --format='%ar' 2>/dev/null || echo "never")
```

## 3 — Suggested Action

| Mode | Condition | Action |
|------|-----------|--------|
| Plan | total=0 | "Write the plan — define tasks" |
| Plan | total>0 | "Finalize plan, then /flow:build" |
| Build | done<total | "Continue building — next task pending" |
| Build | done=total | "All tasks done — /flow:review" |
| Vibe | — | "Vibing freely. /flow:sync when ready" |
| Review | — | "Verify work, /flow:ship when satisfied" |
| Ship | — | "Push, create PR, close phase" |
| Any | Has ### Handoff | "Resuming — pick up {working on} or /flow:status for full overview" |

## 4 — Warnings

Append to the `→` line:
- uncommitted>0 and mode≠Vibe: `⚠ {N} uncommitted`
- branch is main/master + uncommitted>0: `⚠ on main with changes`

## 5 — Output

```
Phase {N} — {name}
Mode: {mode}
Progress: {done}/{total} tasks | {vibe_count} vibed
Branch: {branch} ({ahead} ahead, {uncommitted} uncommitted) · {last_commit}
→ {action}
```

## Recommended Next Step

Consult `~/.claude/flow/references/transitions.md` and print the recommended action as the last line of output.
