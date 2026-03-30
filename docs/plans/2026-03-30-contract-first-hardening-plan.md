# Contract-First Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `## Contract` sections to all 14 workflow files and rewrite all 11 command descriptions for agent routing.

**Architecture:** Pure markdown edits. Each workflow file gets a contract block inserted after the title. Each command file gets its description field replaced. No structural changes.

**Tech Stack:** Markdown files only. No code.

**Design doc:** `docs/plans/2026-03-30-contract-first-hardening-design.md`

---

### Task 1: Add contracts to infrastructure workflows

**Files:**
- Modify: `flow/workflows/_bootstrap.md:1-4` (insert after title)
- Modify: `flow/workflows/start.md:1-3` (insert after subtitle)
- Modify: `flow/workflows/status.md:1-3` (insert after title)

**Step 1: Add contract to `_bootstrap.md`**

Insert after line 1 (`# Flow Bootstrap (internal)`), before the existing `> **This skill runs...` blockquote:

```markdown

## Contract

**Triggers:** Runs automatically before every Flow skill invocation. Not user-callable.
**Inputs:** A `.flow/` directory may or may not exist. Git repo expected but not required.
**Outputs:** Valid `.flow/STATE.md` in canonical format; `### Handoff` consumed and displayed if present.
**Edge cases:**
- STATE.md exists but is malformed (missing `## Current:` line) → treat as missing, rebuild from git + `.planning/`
- No git repo → skip all git commands, set branch to "none", uncommitted to 0
- `.planning/` doesn't exist → skip GSD migration, build from git history only
- Detached HEAD → set branch to "detached ({short-sha})", warn user
```

**Step 2: Add contract to `start.md`**

Insert after line 3 (`Bootstrap .flow/...`), before `## Steps`:

```markdown

## Contract

**Triggers:** "set up flow", "init flow", "bootstrap flow", or first time using Flow in a project.
**Inputs:** A project directory with or without existing `.planning/` state or git history.
**Outputs:** `.flow/` directory with STATE.md, ROADMAP.md, `plans/`, `done/`. Summary printed showing project name, phase, task count, roadmap size.
**Edge cases:**
- `.flow/` already exists with valid state → run sync instead of rebuilding
- `.flow/` exists but STATE.md missing or corrupt → rebuild STATE.md, preserve other files
- No git repo, no `.planning/`, no CLAUDE.md → use directory basename as project name, start at Phase 1 with empty plan
- Structural issues detected during scan → note in summary, suggest `/flow:cleanup`
```

**Step 3: Add contract to `status.md`**

Insert after line 1 (`# Flow Status`), before `## 1 — Read State`:

```markdown

## Contract

**Triggers:** "what's the status", "where did I leave off", "what should I do next", or start of a new session.
**Inputs:** `.flow/STATE.md` must exist. If missing, outputs "Flow not initialized" and stops.
**Outputs:** 5-line summary to stdout — phase, mode, progress, branch state, recommended action.
**Edge cases:**
- STATE.md has `### Handoff` → display handoff context before summary, then remove section
- `git rev-list @{u}..HEAD` fails (no upstream) → show "?" for ahead count
- All tasks complete but mode still says "build" → recommend `/flow:review`
- Uncommitted files in non-vibe mode → append warning to action line
```

**Step 4: Commit**

```bash
git add flow/workflows/_bootstrap.md flow/workflows/start.md flow/workflows/status.md
git commit -m "feat: add contracts to infrastructure workflows (bootstrap, start, status)"
```

---

### Task 2: Add contracts to planning & design workflows

**Files:**
- Modify: `flow/workflows/plan.md:1` (insert after title)
- Modify: `flow/workflows/research.md:1-3` (insert after subtitle)
- Modify: `flow/workflows/brainstorm.md:1-3` (insert after subtitle)

**Step 1: Add contract to `plan.md`**

Insert after line 1 (`# Flow Plan`), before `## Steps`:

```markdown

## Contract

**Triggers:** "plan this", "let's plan", "design first", "write a plan", or starting a new phase that needs architecture decisions.
**Inputs:** `.flow/STATE.md` with a current phase. Optionally, existing research or brainstorm notes in `.flow/plans/`.
**Outputs:** `.flow/plans/{phase-name}.md` with sequenced task checklist. `### Plan` section in STATE.md populated. Mode set to `plan`.
**Edge cases:**
- Plan already exists for this phase → ask: revise existing or start new phase
- User wants to skip planning → suggest `/flow:vibe`
- Context lost mid-brainstorm (context window reset) → conversation history has the brainstorm notes, resume from there
- Phase name contains special characters → slugify for filename (spaces to hyphens, lowercase)
```

**Step 2: Add contract to `research.md`**

Insert after line 3 (`Investigate the domain...`), before `## When This Runs`:

```markdown

## Contract

**Triggers:** Called by `/flow:plan` before brainstorming. Also standalone when "I need to understand this first" or "what exists for this".
**Inputs:** User's description of the phase or feature. Optionally, existing codebase and git history.
**Outputs:** `.flow/plans/{phase-name}-research.md` with question/finding/implication format. Summary printed with key findings.
**Edge cases:**
- No web search available → skip ecosystem/external research, note the gap, rely on codebase and git only
- Task is trivial (bug fix, typo) → skip research entirely, say so, hand off to brainstorm
- Research question can't be answered with available tools → state "unknown" and move on, don't block
```

**Step 3: Add contract to `brainstorm.md`**

Insert after line 3 (`Explore the idea...`), before `## When This Runs`:

```markdown

## Contract

**Triggers:** Called by `/flow:plan` after research. Also standalone on "let's brainstorm", "explore options", or "what are the approaches".
**Inputs:** Research findings (if available), user's goal description, codebase context.
**Outputs:** Design summary with approach, key decisions, out-of-scope list, and open questions. Explicit user approval before proceeding.
**Edge cases:**
- Only one viable approach exists → present it with reasoning, don't invent bad alternatives
- User rejects all approaches → ask what's wrong, re-investigate, propose new options
- User wants to jump straight to building → confirm they're sure, suggest `/flow:vibe` if they want no ceremony
```

**Step 4: Commit**

```bash
git add flow/workflows/plan.md flow/workflows/research.md flow/workflows/brainstorm.md
git commit -m "feat: add contracts to planning workflows (plan, research, brainstorm)"
```

---

### Task 3: Add contracts to execution, verification & support workflows

**Files:**
- Modify: `flow/workflows/build.md:1` (insert after title)
- Modify: `flow/workflows/vibe.md:1` (insert after title)
- Modify: `flow/workflows/review.md:1` (insert after title)
- Modify: `flow/workflows/ship.md:1` (insert after title)
- Modify: `flow/workflows/debug.md:1` (insert after title)
- Modify: `flow/workflows/sync.md:1-3` (insert after subtitle)
- Modify: `flow/workflows/pause.md:1` (insert after title)
- Modify: `flow/workflows/cleanup.md:1-3` (insert after subtitle)

**Step 1: Add contract to `build.md`**

Insert after line 1 (`# Flow Build`), before `## Steps`:

```markdown

## Contract

**Triggers:** "let's build", "start building", "next task", or after plan is approved via `/flow:plan`.
**Inputs:** `.flow/STATE.md` with at least one unchecked task in `### Plan`. If no plan exists, stops and redirects.
**Outputs:** Completed tasks marked `[x]` in STATE.md. Git commits after each task. Mode set to `build`.
**Edge cases:**
- No plan exists → suggest `/flow:plan` or `/flow:vibe`, don't proceed
- User requests off-plan work → offer three choices: switch to vibe, add to plan, or do it and log as unplanned
- Test failure during TDD → switch to `/flow:debug`, return to build after fix
- All tasks already complete → skip to "all done" message, recommend `/flow:review`
- `.planning/dev-session.json` doesn't exist → skip session sync, don't error
```

**Step 2: Add contract to `vibe.md`**

Insert after line 1 (`# Vibe Skill`), before `## On Enter`:

```markdown

## Contract

**Triggers:** "just build it", "skip the process", "let me vibe", "free-form", or user wants to work without a plan.
**Inputs:** `.flow/STATE.md` with a current phase. No plan required.
**Outputs:** Entries appended to `### Vibed` in STATE.md after each commit. Entry SHA logged under `### Vibe Session` for later reconciliation. Mode set to `vibe`.
**Edge cases:**
- Switching out of vibe to any other mode → must run exit protocol first (diff from entry SHA, summarize, reconcile with plan if one exists)
- Entry SHA not found in git history (force-push, rebase) → use oldest available commit on branch, warn user
- User mentions ending their session → suggest `/flow:pause`, don't force it
- No commits made during vibe session → skip reconciliation on exit, remove `### Vibe Session` section cleanly
```

**Step 3: Add contract to `review.md`**

Insert after line 1 (`# Flow Review`), before `## Steps`:

```markdown

## Contract

**Triggers:** "review this", "is it ready", "check the work", or after all build tasks are complete.
**Inputs:** `.flow/STATE.md` with plan tasks and/or vibed entries. Git history since phase start.
**Outputs:** Review summary to stdout — planned vs built count, test results, build status, issue list, and pass/fail verdict. Mode set to `review`.
**Edge cases:**
- No test command exists for this project → skip test step, note "no test runner detected" in summary
- No build command exists → skip build step, note "no build step detected"
- Vibed entries exist but no plan → review is vibed-only, skip spec compliance stage
- Structural issues detected (orphaned files, state inconsistencies) → suggest `/flow:cleanup` before shipping
```

**Step 4: Add contract to `ship.md`**

Insert after line 1 (`# Ship`), before `## Steps`:

```markdown

## Contract

**Triggers:** "ship it", "push this", "create a PR", "we're done", or after review passes.
**Inputs:** `.flow/STATE.md` with current phase. Git repo with committed work.
**Outputs:** Git commit (if uncommitted changes), push to remote, PR via `gh pr create` (if on feature branch). Phase marked complete in ROADMAP.md. Plan archived to `.flow/done/`. Git tag `flow-phase-{N}-shipped` created as safety checkpoint.
**Edge cases:**
- `gh` CLI not installed → skip PR creation, tell user to install gh or create PR manually, continue with other ship steps
- On main branch with changes → warn "you're working directly on main", suggest creating a branch first
- Push fails (auth, remote) → diagnose error, suggest `/flow:debug`, don't retry blindly
- Review hasn't been run → suggest `/flow:review` first, let user skip if they choose
- PR creation fails → do not clear state or archive plan, stop and report the error
```

**Step 5: Add contract to `debug.md`**

Insert after line 1 (`# Flow Debug`), before `## On Enter`:

```markdown

## Contract

**Triggers:** "something broke", "test failing", "this isn't working", "there's a bug", or redirect from build/ship when tests fail.
**Inputs:** A symptom — error message, wrong behavior, or failing test. Current mode preserved.
**Outputs:** Root cause identified, minimal fix applied, commit with `fix:` prefix. `[debugging]` suffix removed from STATE.md mode line on exit.
**Edge cases:**
- Three hypotheses all fail → step back, re-examine assumptions, widen investigation scope
- Fix causes state drift (tasks completed out of order, unplanned files changed) → suggest `/flow:sync`
- User entered debug from vibe mode → `[debugging]` appends after vibe mode, e.g. `(vibe mode) [debugging]`
- No reproducible test case → work from logs and code reading, note that fix is unverified
```

**Step 6: Add contract to `sync.md`**

Insert after line 3 (`Reconcile .flow/STATE.md...`), before `## Steps`:

```markdown

## Contract

**Triggers:** "sync state", "state is out of date", or after vibing, force-pushes, reverts, or when STATE.md feels wrong.
**Inputs:** `.flow/STATE.md` (may be stale or missing). Git history as source of truth.
**Outputs:** Updated `.flow/STATE.md` — tasks reconciled against commits, new vibe entries logged, mode preserved. Sync report to stdout.
**Edge cases:**
- STATE.md missing entirely → reconstruct from git: infer phase from branch name, build plan from commits (all marked done), set mode to vibe
- Merge conflict in progress → warn "merge conflict detected, resolve before syncing", stop
- Git log since last STATE.md update returns nothing → report "no new commits, state unchanged"
- Task marked done but related files were reverted → uncheck the task, note in report
```

**Step 7: Add contract to `pause.md`**

Insert after line 1 (`# Flow Pause`), before `## Steps`:

```markdown

## Contract

**Triggers:** "I'm done for now", "save progress", "stepping away", "end session", or user mentions stopping.
**Inputs:** `.flow/STATE.md` with current phase and mode. Git state.
**Outputs:** `### Handoff` section appended to STATE.md with timestamp, mode, branch, uncommitted count, and plain-language context. Summary printed.
**Edge cases:**
- Uncommitted changes exist → ask if user wants to commit first, proceed either way
- Already has a `### Handoff` section (paused twice without resuming) → replace it, don't stack
- No meaningful work done since last pause → write handoff anyway with "no changes since last session"
```

**Step 8: Add contract to `cleanup.md`**

Insert after line 3 (`Audit and repair...`), before `## Archive Policy`:

```markdown

## Contract

**Triggers:** "clean up state", "fix the structure", "something's wrong with flow state", or suggested by other workflows when structural issues detected.
**Inputs:** `.flow/` directory and optionally `.planning/`. Git state.
**Outputs:** Numbered issue list, fixes applied (with user approval), corrected STATE.md + ROADMAP.md written. Archived files moved to `.flow/archive/` (never deleted). Summary with fix count and current state.
**Edge cases:**
- Ambiguous issue (two phases with same number, different content) → ask user which to keep, don't guess
- No issues found → report "project is clean", don't create unnecessary files
- User declines fixes → respect the choice, report what was found but not fixed
- `.flow/archive/` doesn't exist → create it when first archive is needed
```

**Step 9: Commit**

```bash
git add flow/workflows/build.md flow/workflows/vibe.md flow/workflows/review.md flow/workflows/ship.md flow/workflows/debug.md flow/workflows/sync.md flow/workflows/pause.md flow/workflows/cleanup.md
git commit -m "feat: add contracts to execution, verification, and support workflows"
```

---

### Task 4: Rewrite command descriptions

**Files:**
- Modify: `commands/flow/start.md:2` (description field)
- Modify: `commands/flow/status.md:2` (description field)
- Modify: `commands/flow/plan.md:2` (description field)
- Modify: `commands/flow/build.md:2` (description field)
- Modify: `commands/flow/vibe.md:2` (description field)
- Modify: `commands/flow/review.md:2` (description field)
- Modify: `commands/flow/ship.md:2` (description field)
- Modify: `commands/flow/debug.md:2` (description field)
- Modify: `commands/flow/sync.md:2` (description field)
- Modify: `commands/flow/pause.md:2` (description field)
- Modify: `commands/flow/cleanup.md:2` (description field)

**Step 1: Update each command file's description field**

Replace the `description:` line in each file's frontmatter:

| File | New description value |
|------|---------------------|
| `start.md` | `"Initialize Flow in a project — creates .flow/ with STATE.md and ROADMAP.md. Use on 'set up flow', 'init flow', 'bootstrap flow', or first time using Flow."` |
| `status.md` | `"Print a 5-line project summary — phase, mode, progress, branch state, and recommended next action. Use on 'what's the status', 'where did I leave off', or 'what should I do next'."` |
| `plan.md` | `"Research, brainstorm, and write a task checklist to .flow/plans/. Use on 'plan this', 'let's plan', 'design first', or 'write a plan'."` |
| `build.md` | `"Execute plan tasks one by one — TDD, commit after each, mark progress in STATE.md. Use on 'let's build', 'start building', 'next task', or after plan is approved."` |
| `vibe.md` | `"Work freely without a plan — commits tracked passively in STATE.md vibed log. Use on 'just build it', 'skip the process', 'let me vibe', or 'free-form'."` |
| `review.md` | `"Two-stage verification — spec compliance then code quality — produces a pass/fail review summary. Use on 'review this', 'is it ready', 'check the work', or after all tasks complete."` |
| `ship.md` | `"Commit, push, create PR, and archive the phase — produces a git tag and PR URL. Use on 'ship it', 'push this', 'create a PR', or 'we're done'."` |
| `debug.md` | `"Diagnose and fix a bug using hypothesis-test-fix cycle, commits with fix: prefix. Use on 'something broke', 'test failing', 'this isn't working', or when build/ship hits a failure."` |
| `sync.md` | `"Reconcile STATE.md against git history — checks/unchecks tasks, logs untracked commits. Use on 'sync state', 'state is out of date', or after vibing or force-pushes."` |
| `pause.md` | `"Write a handoff note to STATE.md so the next session resumes with full context. Use on 'I'm done for now', 'save progress', 'stepping away', or 'end session'."` |
| `cleanup.md` | `"Audit .flow/ for structural issues and repair them — archives broken files, rewrites corrected state. Use on 'clean up state', 'fix the structure', or when other workflows detect issues."` |

**Step 2: Commit**

```bash
git add commands/flow/*.md
git commit -m "feat: rewrite command descriptions for agent routing with trigger phrases and output artifacts"
```
