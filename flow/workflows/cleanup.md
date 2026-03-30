# Flow Cleanup

Audit and repair project state. Fix structural issues that confuse agents.

## Contract

**Triggers:** "clean up state", "fix the structure", "something's wrong with flow state", or suggested by other workflows when structural issues detected.
**Inputs:** `.flow/` directory and optionally `.planning/`. Git state.
**Outputs:** Numbered issue list, fixes applied (with user approval), corrected STATE.md + ROADMAP.md written. Archived files moved to `.flow/archive/` (never deleted). Summary with fix count and current state.
**Edge cases:**
- Ambiguous issue (two phases with same number, different content) → ask user which to keep, don't guess
- No issues found → report "project is clean", don't create unnecessary files
- User declines fixes → respect the choice, report what was found but not fixed
- `.flow/archive/` doesn't exist → create it when first archive is needed

## Archive Policy

**Flow never deletes project files.** All removals are moves to `.flow/archive/`:
- Orphaned plans → `.flow/archive/YYYY-MM-DD-{original-name}`
- Superseded state files → `.flow/archive/`
- Duplicate phase directories → `.flow/archive/`

The user decides when to delete from archive. Flow only archives.

## Process

### 1. Audit

Run all checks from `~/.claude/flow/references/audit-checks.md`. Report every issue found.

**ROADMAP**
**STATE**
**Plans**
**dev-session**
**Git**

### 2. Report

Print a numbered list of every issue found:

```
Cleanup Audit — found N issues:

1. ROADMAP: Duplicate phase 4 — "Phase 4: Inbox" and "Phase 4: Integration"
2. STATE: Current phase is 6 but roadmap only has 5 phases
3. PLANS: Orphaned plan file "phase-3.md" — phase 3 already complete
4. SESSION: dev-session.json step is "plan" but STATE.md says build mode
5. GIT: 5 uncommitted files
```

If no issues: "Project is clean. No issues found."

### 3. Fix

**Safety checkpoint:** Before applying any fixes, suggest committing current state: "About to apply {N} fixes. Commit current work first? This creates a restore point." If user agrees, commit. If not, proceed (their choice).

Offer two modes:
- **Option A — Fix all at once**: Apply all fixes, show what changed, write updated state
- **Option B — Step through each**: Propose each fix individually, user approves

For each fix, explain what will change and why.

When a fix involves removing a file or directory, **archive it** to `.flow/archive/` instead of deleting. Prefix with today's date.

### 4. Write Corrected State (MANDATORY)

After fixes are applied, **always write the reconciled truth** to `.flow/`:

1. **Write `.flow/STATE.md`** — updated current phase, mode, tasks, vibed entries, decisions
2. **Write `.flow/ROADMAP.md`** — corrected phase numbering, completion status
3. **Update `.planning/dev-session.json`** — sync step and debug state to match `.flow/STATE.md`

This is the critical step. The audit is only useful if the corrected state is persisted.
`.flow/STATE.md` is the **single source of truth** after cleanup runs.

### 5. Summary

```
Cleanup complete:
  Fixed: N issues
  Skipped: N issues
  Archived: N files → .flow/archive/
  State written: .flow/STATE.md, .flow/ROADMAP.md

Current state:
  Phase: {N} — {name} ({mode} mode)
  Tasks: {done}/{total} complete
  Branch: {branch}
```

## Common Issues This Fixes

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| Agent keeps going to wrong phase | Duplicate phase numbers | Renumber duplicates, archive old |
| "Phase not found" errors | Gap in numbering | Renumber to close gaps |
| Resume shows wrong progress | STATE.md stale | Reconcile from roadmap + git |
| Agent ignores completed work | Tasks checked but phase not marked done | Mark phase complete |
| Leftover files from abandoned work | Orphaned plan files | Archive to .flow/archive/ |
| dev-session.json out of sync | Toolbar shows wrong step | Sync from STATE.md |

## Recommended Next Step

Consult `~/.claude/flow/references/transitions.md` and print the recommended action as the last line of output.
