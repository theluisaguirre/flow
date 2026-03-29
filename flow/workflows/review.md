# Flow Review

## Steps

1. **Enter Review mode.** Update `.flow/STATE.md` header to `## Current: Phase {N} — {name} (review mode)`.
   Also update `.planning/dev-session.json`: set `step` to `"review"`.

2. **Gather what was built.** Read `.flow/STATE.md` — collect all `### Plan` tasks and `### Vibed` entries. Run `git log` since phase start and `git diff main...HEAD --stat` to see the full scope of changes.

3. **Stage 1 — Spec compliance.** Compare planned tasks against what was built:
   - Which tasks are done (`- [x]`)?
   - Which are missing (`- [ ]`)?
   - Any unplanned additions from Vibed?
   - Does the work achieve the phase goal?

   If tasks are missing, ask:
   > {N} planned tasks incomplete. Skip them and proceed, or go back to Build?

4. **Stage 2 — Code quality.** Run tests, verify the build compiles cleanly, and check for obvious issues (dead code, missing error handling, broken imports). Confirm output of each verification command before reporting results.

5. **Summary report.** Print:
   ```
   Review Summary
   Planned: N tasks (M complete, K skipped)
   Vibed: N changes
   Tests: pass/fail
   Build: clean/errors
   Issues: list or "none"
   Structural: clean / issues found
   → Ready to ship / Needs fixes
   ```

   If structural issues detected (orphaned files, state inconsistencies): suggest `/flow:cleanup` before shipping.

6. **Next step.** If ready:
   > Looking good. `/flow:ship` when ready.

   If issues found:
   > Found {N} issues. Fix in Build, then re-review.

## Recommended Next Step

Consult `~/.claude/flow/references/transitions.md` and print the recommended action as the last line of output.
