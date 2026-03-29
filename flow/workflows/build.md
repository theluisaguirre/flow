# Flow Build

## Steps

1. **Enter Build mode.** Update `.flow/STATE.md` header to `## Current: Phase {N} — {name} (build mode)`.
   Also update `.planning/dev-session.json`: set `step` to `"build"`.

2. **Find next task.** Read the `### Plan` section in `.flow/STATE.md`. Locate the first unchecked (`- [ ]`) task. If no plan exists, respond:
   > No plan found. `/flow:plan` first, or `/flow:vibe` to work without one.
   Then stop.

3. **Execute tasks sequentially.** For each unchecked task:
   - Announce: `> Building: {task description}`
   - Implement the task. Use TDD when appropriate (write test, make it pass, refactor). If tests fail repeatedly, switch to `/flow:debug` to investigate systematically.
   - Mark the task `- [x]` in `.flow/STATE.md`.
   - **Commit checkpoint:** After completing each task (or when changed files pile up), ask:
     > Checkpoint — commit these changes? Suggest a descriptive message summarizing what was built.
   - **Rollback:** If a task implementation breaks existing functionality, run `git stash` to save work, `git checkout .` to restore, then investigate before retrying.

4. **Off-plan guard.** If the user requests something not listed in the plan, offer three choices:
   > That's not in the current plan. How do you want to handle it?
   > a) **Switch to Vibe mode** — track it separately (`/flow:vibe`)
   > b) **Add to plan** — append it and do it in order
   > c) **Just do it** — implement now, log as unplanned in STATE.md

5. **All tasks complete.** When every task in the plan is checked, respond:
   > All done! /flow:review to verify, /flow:ship to ship, /flow:vibe to keep tinkering, or /flow:pause to save progress and stop.

## Recommended Next Step

Consult `~/.claude/flow/references/transitions.md` and print the recommended action as the last line of output.
