# Contract-First Hardening

**Date:** 2026-03-30
**Status:** Approved
**Approach:** A (Contract-First) — add explicit contracts to all workflow files and rewrite command descriptions for agent routing.

## Problem

Flow's workflow files describe good processes but lack discoverability. An agent must read 50-80 lines to determine: when should this run, what does it need, what does it produce, and what can go wrong. The transcript analysis identified 6 gaps; this design addresses gaps 1 (descriptions), 2 (output contracts), 3 (edge cases), and 5 (examples via contract specificity).

## Design

### Contract Format

Every workflow file in `flow/workflows/` gets a `## Contract` section inserted immediately after the `# Title` line, before any existing content:

```markdown
## Contract

**Triggers:** {when this workflow activates — trigger phrases, conditions}
**Inputs:** {what must exist before this runs}
**Outputs:** {exact artifact(s) produced, format, location}
**Edge cases:**
- {condition} → {behavior}
```

Four fields. Each is one sentence to one short list. The contract is scannable without parsing the full workflow.

### Command Description Rewrites

Each command file in `commands/flow/` gets its `description` field rewritten to follow the pattern: **what it does** (action + artifact produced) + **when to use it** (trigger phrases). All on a single line.

### Scope

- 14 workflow files modified (contract added)
- 11 command files modified (description rewritten)
- No structural changes to workflows themselves
- No new files beyond this design doc

## Contracts by Workflow

### _bootstrap.md

**Triggers:** Runs automatically before every Flow skill invocation. Not user-callable.
**Inputs:** A `.flow/` directory may or may not exist. Git repo expected but not required.
**Outputs:** Valid `.flow/STATE.md` in canonical format; `### Handoff` consumed and displayed if present.
**Edge cases:**
- STATE.md exists but is malformed (missing `## Current:` line) → treat as missing, rebuild from git + `.planning/`
- No git repo → skip all git commands, set branch to "none", uncommitted to 0
- `.planning/` doesn't exist → skip GSD migration, build from git history only
- Detached HEAD → set branch to "detached ({short-sha})", warn user

### start.md

**Triggers:** "set up flow", "init flow", "bootstrap flow", or first time using Flow in a project.
**Inputs:** A project directory with or without existing `.planning/` state or git history.
**Outputs:** `.flow/` directory with STATE.md, ROADMAP.md, `plans/`, `done/`. Summary printed showing project name, phase, task count, roadmap size.
**Edge cases:**
- `.flow/` already exists with valid state → run sync instead of rebuilding
- `.flow/` exists but STATE.md missing or corrupt → rebuild STATE.md, preserve other files
- No git repo, no `.planning/`, no CLAUDE.md → use directory basename as project name, start at Phase 1 with empty plan
- Structural issues detected during scan → note in summary, suggest `/flow:cleanup`

### status.md

**Triggers:** "what's the status", "where did I leave off", "what should I do next", or start of a new session.
**Inputs:** `.flow/STATE.md` must exist. If missing, outputs "Flow not initialized" and stops.
**Outputs:** 5-line summary to stdout — phase, mode, progress, branch state, recommended action.
**Edge cases:**
- STATE.md has `### Handoff` → display handoff context before summary, then remove section
- `git rev-list @{u}..HEAD` fails (no upstream) → show "?" for ahead count
- All tasks complete but mode still says "build" → recommend `/flow:review`
- Uncommitted files in non-vibe mode → append warning to action line

### plan.md

**Triggers:** "plan this", "let's plan", "design first", "write a plan", or starting a new phase that needs architecture decisions.
**Inputs:** `.flow/STATE.md` with a current phase. Optionally, existing research or brainstorm notes in `.flow/plans/`.
**Outputs:** `.flow/plans/{phase-name}.md` with sequenced task checklist. `### Plan` section in STATE.md populated. Mode set to `plan`.
**Edge cases:**
- Plan already exists for this phase → ask: revise existing or start new phase
- User wants to skip planning → suggest `/flow:vibe`
- Context lost mid-brainstorm (context window reset) → conversation history has the brainstorm notes, resume from there
- Phase name contains special characters → slugify for filename (spaces to hyphens, lowercase)

### research.md

**Triggers:** Called by `/flow:plan` before brainstorming. Also standalone when "I need to understand this first" or "what exists for this".
**Inputs:** User's description of the phase or feature. Optionally, existing codebase and git history.
**Outputs:** `.flow/plans/{phase-name}-research.md` with question/finding/implication format. Summary printed with key findings.
**Edge cases:**
- No web search available → skip ecosystem/external research, note the gap, rely on codebase and git only
- Task is trivial (bug fix, typo) → skip research entirely, say so, hand off to brainstorm
- Research question can't be answered with available tools → state "unknown" and move on, don't block

### brainstorm.md

**Triggers:** Called by `/flow:plan` after research. Also standalone on "let's brainstorm", "explore options", or "what are the approaches".
**Inputs:** Research findings (if available), user's goal description, codebase context.
**Outputs:** Design summary with approach, key decisions, out-of-scope list, and open questions. Explicit user approval before proceeding.
**Edge cases:**
- Only one viable approach exists → present it with reasoning, don't invent bad alternatives
- User rejects all approaches → ask what's wrong, re-investigate, propose new options
- User wants to jump straight to building → confirm they're sure, suggest `/flow:vibe` if they want no ceremony

### build.md

**Triggers:** "let's build", "start building", "next task", or after plan is approved via `/flow:plan`.
**Inputs:** `.flow/STATE.md` with at least one unchecked task in `### Plan`. If no plan exists, stops and redirects.
**Outputs:** Completed tasks marked `[x]` in STATE.md. Git commits after each task. Mode set to `build`.
**Edge cases:**
- No plan exists → suggest `/flow:plan` or `/flow:vibe`, don't proceed
- User requests off-plan work → offer three choices: switch to vibe, add to plan, or do it and log as unplanned
- Test failure during TDD → switch to `/flow:debug`, return to build after fix
- All tasks already complete → skip to "all done" message, recommend `/flow:review`
- `.planning/dev-session.json` doesn't exist → skip session sync, don't error

### vibe.md

**Triggers:** "just build it", "skip the process", "let me vibe", "free-form", or user wants to work without a plan.
**Inputs:** `.flow/STATE.md` with a current phase. No plan required.
**Outputs:** Entries appended to `### Vibed` in STATE.md after each commit. Entry SHA logged under `### Vibe Session` for later reconciliation. Mode set to `vibe`.
**Edge cases:**
- Switching out of vibe to any other mode → must run exit protocol first (diff from entry SHA, summarize, reconcile with plan if one exists)
- Entry SHA not found in git history (force-push, rebase) → use oldest available commit on branch, warn user
- User mentions ending their session → suggest `/flow:pause`, don't force it
- No commits made during vibe session → skip reconciliation on exit, remove `### Vibe Session` section cleanly

### review.md

**Triggers:** "review this", "is it ready", "check the work", or after all build tasks are complete.
**Inputs:** `.flow/STATE.md` with plan tasks and/or vibed entries. Git history since phase start.
**Outputs:** Review summary to stdout — planned vs built count, test results, build status, issue list, and pass/fail verdict. Mode set to `review`.
**Edge cases:**
- No test command exists for this project → skip test step, note "no test runner detected" in summary
- No build command exists → skip build step, note "no build step detected"
- Vibed entries exist but no plan → review is vibed-only, skip spec compliance stage
- Structural issues detected (orphaned files, state inconsistencies) → suggest `/flow:cleanup` before shipping

### ship.md

**Triggers:** "ship it", "push this", "create a PR", "we're done", or after review passes.
**Inputs:** `.flow/STATE.md` with current phase. Git repo with committed work.
**Outputs:** Git commit (if uncommitted changes), push to remote, PR via `gh pr create` (if on feature branch). Phase marked complete in ROADMAP.md. Plan archived to `.flow/done/`. Git tag `flow-phase-{N}-shipped` created as safety checkpoint.
**Edge cases:**
- `gh` CLI not installed → skip PR creation, tell user to install gh or create PR manually, continue with other ship steps
- On main branch with changes → warn "you're working directly on main", suggest creating a branch first
- Push fails (auth, remote) → diagnose error, suggest `/flow:debug`, don't retry blindly
- Review hasn't been run → suggest `/flow:review` first, let user skip if they choose
- PR creation fails → do not clear state or archive plan, stop and report the error

### debug.md

**Triggers:** "something broke", "test failing", "this isn't working", "there's a bug", or redirect from build/ship when tests fail.
**Inputs:** A symptom — error message, wrong behavior, or failing test. Current mode preserved.
**Outputs:** Root cause identified, minimal fix applied, commit with `fix:` prefix. `[debugging]` suffix removed from STATE.md mode line on exit.
**Edge cases:**
- Three hypotheses all fail → step back, re-examine assumptions, widen investigation scope
- Fix causes state drift (tasks completed out of order, unplanned files changed) → suggest `/flow:sync`
- User entered debug from vibe mode → `[debugging]` appends after vibe mode, e.g. `(vibe mode) [debugging]`
- No reproducible test case → work from logs and code reading, note that fix is unverified

### sync.md

**Triggers:** "sync state", "state is out of date", or after vibing, force-pushes, reverts, or when STATE.md feels wrong.
**Inputs:** `.flow/STATE.md` (may be stale or missing). Git history as source of truth.
**Outputs:** Updated `.flow/STATE.md` — tasks reconciled against commits, new vibe entries logged, mode preserved. Sync report to stdout.
**Edge cases:**
- STATE.md missing entirely → reconstruct from git: infer phase from branch name, build plan from commits (all marked done), set mode to vibe
- Merge conflict in progress → warn "merge conflict detected, resolve before syncing", stop
- Git log since last STATE.md update returns nothing → report "no new commits, state unchanged"
- Task marked done but related files were reverted → uncheck the task, note in report

### pause.md

**Triggers:** "I'm done for now", "save progress", "stepping away", "end session", or user mentions stopping.
**Inputs:** `.flow/STATE.md` with current phase and mode. Git state.
**Outputs:** `### Handoff` section appended to STATE.md with timestamp, mode, branch, uncommitted count, and plain-language context. Summary printed.
**Edge cases:**
- Uncommitted changes exist → ask if user wants to commit first, proceed either way
- Already has a `### Handoff` section (paused twice without resuming) → replace it, don't stack
- No meaningful work done since last pause → write handoff anyway with "no changes since last session"

### cleanup.md

**Triggers:** "clean up state", "fix the structure", "something's wrong with flow state", or suggested by other workflows when structural issues detected.
**Inputs:** `.flow/` directory and optionally `.planning/`. Git state.
**Outputs:** Numbered issue list, fixes applied (with user approval), corrected STATE.md + ROADMAP.md written. Archived files moved to `.flow/archive/` (never deleted). Summary with fix count and current state.
**Edge cases:**
- Ambiguous issue (two phases with same number, different content) → ask user which to keep, don't guess
- No issues found → report "project is clean", don't create unnecessary files
- User declines fixes → respect the choice, report what was found but not fixed
- `.flow/archive/` doesn't exist → create it when first archive is needed

## Command Descriptions

| Command | Description |
|---------|-------------|
| start | Initialize Flow in a project — creates .flow/ with STATE.md and ROADMAP.md. Use on 'set up flow', 'init flow', 'bootstrap flow', or first time using Flow. |
| status | Print a 5-line project summary — phase, mode, progress, branch state, and recommended next action. Use on 'what's the status', 'where did I leave off', or 'what should I do next'. |
| plan | Research, brainstorm, and write a task checklist to .flow/plans/. Use on 'plan this', 'let's plan', 'design first', or 'write a plan'. |
| build | Execute plan tasks one by one — TDD, commit after each, mark progress in STATE.md. Use on 'let's build', 'start building', 'next task', or after plan is approved. |
| vibe | Work freely without a plan — commits tracked passively in STATE.md vibed log. Use on 'just build it', 'skip the process', 'let me vibe', or 'free-form'. |
| review | Two-stage verification — spec compliance then code quality — produces a pass/fail review summary. Use on 'review this', 'is it ready', 'check the work', or after all tasks complete. |
| ship | Commit, push, create PR, and archive the phase — produces a git tag and PR URL. Use on 'ship it', 'push this', 'create a PR', or 'we're done'. |
| debug | Diagnose and fix a bug using hypothesis-test-fix cycle, commits with fix: prefix. Use on 'something broke', 'test failing', 'this isn't working', or when build/ship hits a failure. |
| sync | Reconcile STATE.md against git history — checks/unchecks tasks, logs untracked commits. Use on 'sync state', 'state is out of date', or after vibing or force-pushes. |
| pause | Write a handoff note to STATE.md so the next session resumes with full context. Use on 'I'm done for now', 'save progress', 'stepping away', or 'end session'. |
| cleanup | Audit .flow/ for structural issues and repair them — archives broken files, rewrites corrected state. Use on 'clean up state', 'fix the structure', or when other workflows detect issues. |

## Deferred (Approaches B and C)

These gaps are acknowledged but not addressed in this pass:

- **Gap 4 (Test suite):** Contracts are the prerequisite. Once contracts define expected outputs, a test harness can verify them.
- **Gap 5 (Filled examples):** Contracts include enough specificity for agent pattern-matching. Full worked examples deferred.
- **Gap 6 (Tiering):** Commands could be tagged as core/methodology/escape-hatch for onboarding. Deferred to a README pass.
