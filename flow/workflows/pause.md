# Flow Pause

## Contract

**Triggers:** "I'm done for now", "save progress", "stepping away", "end session", or user mentions stopping.
**Inputs:** `.flow/STATE.md` with current phase and mode. Git state.
**Outputs:** `### Handoff` section appended to STATE.md with timestamp, mode, branch, uncommitted count, and plain-language context. Summary printed.
**Edge cases:**
- Uncommitted changes exist → ask if user wants to commit first, proceed either way
- Already has a `### Handoff` section (paused twice without resuming) → replace it, don't stack
- No meaningful work done since last pause → write handoff anyway with "no changes since last session"

## Steps

### 1. Gather current state

Read:
- `.flow/STATE.md` — current phase, mode, tasks, vibed entries
- `git status --porcelain` — uncommitted files
- `git log --oneline -5` — recent commits
- `git branch --show-current` — branch name
- `git stash list` — any stashed work

### 2. Prompt commit if dirty

If there are uncommitted changes:
> You have {N} uncommitted files. Want to commit before pausing?
> - **Yes** — suggest a commit message, wait for approval, commit
> - **No** — note them in the handoff (they'll still be there next session)

### 3. Write handoff note

Add or replace a `### Handoff` section at the end of `.flow/STATE.md`:

```markdown
### Handoff
- **Paused**: {timestamp}
- **Mode**: {current mode}
- **Working on**: {current task or "free-form vibing"}
- **Branch**: {branch name}
- **Uncommitted**: {N files or "clean"}
- **Last commit**: {short hash} — {message}
- **Context**: {1-2 sentence summary of what was happening when session ended}
```

The `Context` line is the most important — it's what the next session reads to understand where you were. Write it in plain language: what you were doing, what's next, any gotchas.

### 4. Update dev-session.json

Write `lastAction` timestamp to `.planning/dev-session.json` so the toolbar knows when you last worked.

### 5. Print summary

```
Session paused.
  Phase: {N} — {name} ({mode} mode)
  Progress: {done}/{total} tasks
  Branch: {branch}
  Uncommitted: {N files or "clean"}

  Handoff written to .flow/STATE.md
  Next session: /flow:status to pick up where you left off.
```

## Resume Behavior

When `/flow:status` or any Flow skill runs bootstrap and finds a `### Handoff` section in STATE.md, it displays the context and removes the section.

1. Print the handoff context so the agent has session continuity
2. Remove the `### Handoff` section (it's been consumed)
3. Continue with the invoked skill

## Recommended Next Step

Consult `~/.claude/flow/references/transitions.md` and print the recommended action as the last line of output.
