# Flow Review

## Contract

**Triggers:** "review this", "is it ready", "check the work", or after all build tasks are complete.
**Inputs:** `.flow/STATE.md` with plan tasks and/or vibed entries. Git history since phase start.
**Outputs:** Review summary to stdout — planned vs built count, test results, build status, issue list, and pass/fail verdict. Mode set to `review`.
**Edge cases:**
- No test command exists for this project → skip test step, note "no test runner detected" in summary
- No build command exists → skip build step, note "no build step detected"
- Vibed entries exist but no plan → review is vibed-only, skip spec compliance stage
- Structural issues detected (orphaned files, state inconsistencies) → suggest `/flow:cleanup` before shipping

## Steps

1. **Enter Review mode.** Update `.flow/STATE.md` header to `## Current: Phase {N} — {name} (review mode)`.
   Also update `.planning/dev-session.json`: set `step` to `"review"`.

2. **Gather what was built.** Read `.flow/STATE.md` — collect all `### Plan` tasks and `### Vibed` entries. Run `git log` since phase start and `git diff main...HEAD --stat` to see the full scope of changes.

3. **Stage 1 — Spec compliance.** Compare planned tasks against what was built:
   - Which tasks are done (`- [x]`)?
   - Which are missing (`- [ ]`)?
   - Any unplanned additions from Vibed?
   - Does the work achieve the phase goal?
   - **Did each done task meet its own proof tag?** `[test]` ran green, `[snap]` was compared, `[manual]` was actually tried. A ticked task with an unmet tag is not done.

   If tasks are missing, ask:
   > {N} planned tasks incomplete. Skip them and proceed, or go back to Build?

4. **Stage 2 — Code quality.** Run tests, verify the build compiles cleanly, and check for obvious issues (dead code, missing error handling, broken imports). Confirm output of each verification command before reporting results. For any visible surface changed this phase, review it against `~/.claude/flow/references/verify-checks.md` (light + dark, the three commonly-missed defects, valid-snapshot traps).

   **Health check (phase diff only).** Run the mechanical checks from `~/.claude/flow/references/refactor-checks.md` (A styles, D slop, E broken) against the files changed this phase, plus a B boundary count for any feature module touched. Report one line per category: `Styles: 3 literal values outside tokens · Slop: 1 debug print · Boundaries: Canvas→BrushStudio 92 symbols`. Fix small items in Build now; anything structural or project-wide goes to `/flow:refactor` after ship.

5. **Summary report.** Print:
   ```
   Review Summary
   Planned: N tasks (M complete, K skipped)
   Vibed: N changes
   Tests: pass/fail
   Build: clean/errors
   Issues: list or "none"
   Structural: clean / issues found
   Code health: clean / N items (styles n, slop n, boundaries n)
   Visual: N surfaces reviewed (light+dark) / not applicable
   → Ready to ship / Needs fixes
   ```

   If structural issues detected (orphaned files, state inconsistencies): suggest `/flow:cleanup` before shipping.
   If code health has any boundary leak or more than ~10 mechanical items: write `Refactor recommended: {summary}` into `.flow/STATE.md` under `### Decisions`, so Ship can recommend `/flow:refactor` next.

6. **Next step.** If ready:
   > Looking good. `/flow:ship` when ready.

   If issues found:
   > Found {N} issues. Fix in Build, then re-review.

## Recommended Next Step

Consult `~/.claude/flow/references/transitions.md` and print the recommended action as the last line of output.
