# Flow Bootstrap (internal)

> **This skill runs automatically before every Flow skill invocation.**
> Individual skills must NOT duplicate any pre-flight checks — bootstrap handles all of it.

## Gate

Check if `.flow/` exists with a valid `STATE.md`.

- If `.flow/STATE.md` exists and parses correctly → **check for handoff, then proceed with the invoked skill**
- If `.flow/` is missing OR `STATE.md` is missing/corrupt → **run full bootstrap below**

## Handoff Resume (runs every session, even when bootstrap is skipped)

Check `.flow/STATE.md` for a `### Handoff` section. If found:

1. **Print the handoff context** so the agent (and user) knows what was happening:
   ```
   Resuming from previous session:
     {Context line from handoff}
     Mode: {mode} | Branch: {branch} | Uncommitted: {N or "clean"}
   ```
2. **Remove the `### Handoff` section** from STATE.md — it's been consumed.
3. **Continue** with the invoked skill as normal.

**Debug mode suffix format:** When the session is in debug mode, append `[debugging]` in square brackets *after* the mode — e.g. `(build mode) [debugging]`. Do NOT use parentheses for the debug suffix; `(build mode (debugging))` will break the `({mode} mode)` parser.

## Bootstrap = Inventory + Create

This is NOT a silent mkdir. It's a full audit of existing project state.

### 1. Inventory

Scan everything available:

**Files:**
- `.planning/STATE.md` — phase, progress, tasks
- `.planning/ROADMAP.md` — milestones, phase list
- `.planning/PROJECT.md` — project name, description
- `.planning/phases/` — all phase directories, their plans, verifications
- `.planning/dev-session.json` — current step, debug state
- `CLAUDE.md` — project conventions, any embedded state

**Git:**
- `git log --oneline -20` — recent commits
- `git branch --show-current` — branch name
- `git status --porcelain` — dirty files
- `git log --all --oneline --grep="phase\|feat\|fix" -10` — phase-related history

**Derive:**
- Project name (PROJECT.md title → CLAUDE.md title → directory basename)
- All phases with their true status (check for VERIFICATION files, completed tasks, git evidence)
- Current phase number (dev-session.json → STATE.md → infer from branch/commits)
- Current mode (dev-session step → infer: has plan but no tasks done = plan, has tasks in progress = build, recent vibe: commits = vibe)
- Dirty file count
- Branch info (name, ahead/behind, is main)

### 2. Detect Issues

Run all checks from `~/.claude/flow/references/audit-checks.md`.

### 3. Report

Print what was found:

```
Flow bootstrap — inventoried project:
  Project: {name}
  Source: .planning/ (GSD format)
  Phases: {N} total, {N} complete, {N} in progress
  Branch: {branch} ({N} uncommitted)

  ⚠ Found {N} issues:
  1. {issue description}
  2. {issue description}

  Fixing automatically...
```

If no issues, just show the inventory without the issues section.

### 4. Fix Issues

Auto-fix all structural issues (renumber duplicates, close gaps, reconcile completion status). These are safe mechanical fixes — not content changes.

If an issue is ambiguous (e.g., two phases with same number but different content, unclear which should be kept), ask the user before proceeding.

### 5. Write .flow/

Create the directory structure and write corrected state:

```
.flow/
├── STATE.md      ← current phase, mode, tasks, vibed, decisions
├── ROADMAP.md    ← corrected phase list with true completion status
├── plans/        ← copy active plan files
├── done/         ← completed phase plans
└── archive/      ← anything removed or superseded goes here
```

Write STATE.md in canonical format:
```markdown
# Project: {name}
## Current: Phase {N} — {name} ({mode} mode)

### Plan
- [x] completed task
- [ ] pending task

### Vibed
- untracked work from git log

### Decisions
- carried over from .planning/ context
```

### 6. Archive Policy

**Never delete project files. Always archive.**

When fixing issues that involve removing or replacing files:
- Move orphaned plans → `.flow/archive/`
- Move superseded ROADMAP versions → `.flow/archive/`
- Move duplicate phase directories → `.flow/archive/`
- Prefix archived files with the date: `2026-03-08-phase-3-plan.md`

The user can manually delete from `.flow/archive/` if they want. Flow never does.

### 7. Sync dev-session.json

Update `.planning/dev-session.json` step to match the mode in STATE.md.

### 8. Continue

After bootstrap completes, **continue with the originally invoked skill**. Don't stop and ask the user to re-run it. The bootstrap is a prerequisite, not a destination.

---

## Recommended Next Step

After any Flow skill completes, consult `~/.claude/flow/references/transitions.md` for the recommended action and print it as the last line of output.
