# Ship

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

## Steps

### 1. Enter Ship Mode

Update `STATE.md` current phase line to ship mode:
```
## Current: Phase {N} — {name} (ship mode)
```

Also update `.planning/dev-session.json`: set `step` to `"ship"`.

### 2. Pre-Ship Check

Run these checks and report results in plain language:

- **Unsaved changes?** — Run `git status`. If changes exist, list them: "You have unsaved changes in these files: …"
- **On a feature branch?** — If on `main`, warn: "You're working directly on the main codebase. Consider creating a separate branch first." If on a feature branch, confirm: "You're on branch {name} — good to go."
- **Tests pass?** — Run the project's test command. Report pass/fail.
- **Build clean?** — Run the project's build command. Report pass/fail.

**Review gate:** Check if `/flow:review` has been run for this phase (look for review evidence in STATE.md or git log). If not, suggest: "Review hasn't run yet. `/flow:review` first, or skip and ship anyway?"

If tests or build fail, stop and suggest: "Tests/build failed. Try `/flow:debug` to diagnose, or fix manually."

### 3. Save Changes (commit)

- Stage all changed files.
- Generate a descriptive commit message from the diff and `STATE.md` context.
- Show the message to the user: "I'd like to save these changes with this description: '{message}'. Sound good?"
- Wait for approval before committing.

### 4. Back Up to GitHub (push)

**Checkpoint:** Commit before pushing. If push fails (auth, remote issues), diagnose the error — don't retry blindly. Try `/flow:debug` if stuck.

- Check if there are saved changes not yet backed up (`git status` vs remote).
- If ahead, tell the user: "You have {N} saved change(s) not yet backed up to GitHub."
- Push: "Backing up to GitHub…"
- Confirm: "Backed up successfully."

### 5. Create a Pull Request

Only if on a feature branch:

- Generate a PR title and summary from commit history and `STATE.md` plan/vibed sections.
- Show the user: "I'll create a pull request for review with this title and summary: …"
- Wait for approval.
- Run `gh pr create --title "…" --body "…"`.
- Report the PR URL.

### 6. Post-Ship Cleanup

**Safety:** Create a git checkpoint (`git tag flow-phase-{N}-shipped`) before clearing plan/vibed sections, so state can be recovered if the phase advance was premature.

Only proceed with cleanup AFTER confirming the PR was created successfully (or push completed if on main). If PR creation fails, do not clear state — stop and report the error.

After confirmed success:

- Mark the current phase complete in `ROADMAP.md`.
- Clear the `### Plan` and `### Vibed` sections in `STATE.md` (leave headings, remove content).
- Move the plan file: `.flow/plans/{phase}.md` → `.flow/done/{phase}.md` (create `.flow/done/` if needed).
- Advance `STATE.md` to the next phase, or note "milestone complete" if no phases remain.
- Final report:

> Shipped! PR: {url}. Phase {N} done. Next: {next phase name, or "milestone complete"}.

## Language Guide

Always use these plain-language phrases, with the technical term in parentheses:

| Say this | Technical term |
|---|---|
| Save these changes | commit |
| Back up to GitHub | push |
| Create a pull request for review | open a PR |
| Merge into the main codebase | merge to main |

## Recommended Next Step

Consult `~/.claude/flow/references/transitions.md` and print the recommended action as the last line of output.
