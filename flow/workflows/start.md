# Flow Start

Bootstrap `.flow/` in the current project by scanning existing context.

## Contract

**Triggers:** "set up flow", "init flow", "bootstrap flow", or first time using Flow in a project.
**Inputs:** A project directory with or without existing `.planning/` state or git history.
**Outputs:** `.flow/` directory with STATE.md, ROADMAP.md, `plans/`, `done/`. Summary printed showing project name, phase, task count, roadmap size.
**Edge cases:**
- `.flow/` already exists with valid state → run sync instead of rebuilding
- `.flow/` exists but STATE.md missing or corrupt → rebuild STATE.md, preserve other files
- No git repo, no `.planning/`, no CLAUDE.md → use directory basename as project name, start at Phase 1 with empty plan
- Structural issues detected during scan → note in summary, suggest `/flow:cleanup`

## Steps

1. **Check for existing .flow/**

If `.flow/` already exists with a valid STATE.md:
> `.flow/` already exists. Running sync to refresh state from git.

Then run the sync logic (same as `/flow:sync`). Don't stop — the user invoked start because they want Flow working.

If `.flow/` exists but STATE.md is missing or corrupt, continue with step 2 to rebuild it.

If structural issues are detected during scan (duplicate phases, orphaned files), note them in the summary and suggest `/flow:cleanup`.

2. **Scan existing context**

Read if they exist (skip silently if missing):
- `.planning/STATE.md` — current phase, progress
- `.planning/ROADMAP.md` — milestones, phase list
- `.planning/PROJECT.md` — project name, description
- `.planning/phases/` — phase directories, their contents
- `.planning/dev-session.json` — current step, debug state
- `CLAUDE.md` — project conventions
- `git log --oneline -20` — recent activity
- `git branch --show-current` — current branch
- `git status --porcelain` — uncommitted changes

Extract:
- **Project name**: from PROJECT.md title, CLAUDE.md title, or directory basename
- **Current phase**: from STATE.md, dev-session.json, or infer from branch name / recent commits
- **Mode**: from dev-session.json step, or default to `plan` for new projects, `build` if active tasks found
- **Tasks**: from STATE.md plan section or phase plan files or empty
- **Milestones/phases**: from ROADMAP.md or minimal starter
- **Decisions**: from STATE.md accumulated context or empty

3. **Create .flow/ structure**

```
.flow/
├── STATE.md
├── ROADMAP.md
├── plans/
└── done/
```

4. **Write STATE.md**

Use this exact format (all Flow skills parse the `## Current:` line):

```markdown
# Project: {name}
## Current: Phase {N} — {name} ({mode} mode)

### Plan
- [ ] {task from context or "Define initial tasks"}

### Vibed

### Decisions
- {decision from context or empty}
```

5. **Write ROADMAP.md**

From existing roadmap:
```markdown
# Roadmap
## {Milestone}
- [x] Phase N: Completed phase
- [ ] Phase N: Pending phase
```

No existing roadmap — minimal starter:
```markdown
# Roadmap
## v1
- [ ] Phase 1: Initial work
```

6. **Sync dev-session.json**

If `.planning/dev-session.json` exists, update its `step` field to match the mode in STATE.md:
- plan mode → step: "plan"
- build mode → step: "build"
- vibe mode → step: "vibe"
- review mode → step: "review"

This keeps the Dev Mode toolbar in sync.

7. **Print summary**

```
Flow initialized:
  Project: {name}
  Phase: {N} — {name} ({mode} mode)
  Tasks: {count} planned
  Roadmap: {milestone_count} milestones, {phase_count} phases

Use /flow:status anytime.
```

## Recommended Next Step

Consult `~/.claude/flow/references/transitions.md` and print the recommended action as the last line of output.
