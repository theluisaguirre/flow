# Flow Debug

## On Enter

Update `.flow/STATE.md`: append `[debugging]` to the current mode line.
The format becomes: `## Current: Phase {N} — {name} ({mode} mode) [debugging]`
Do NOT change mode — you can debug in any mode (Build, Vibe, etc.).

## Process

### 1. Symptoms

Ask the user to describe what's wrong. Gather:
- What happened (error message, wrong behavior, crash)
- What was expected
- When it started (after which change, commit, or action)
- Can it be reproduced consistently?

### 2. Investigate

Before forming any hypothesis, gather evidence:
- Read error logs/output
- Check `git log --oneline -5` — what changed recently?
- Check `git diff` — any uncommitted changes that might cause it?
- Read the relevant source files
- If test failure: run the specific test with verbose output

### 3. Hypothesize

Form 1-3 specific hypotheses. For each:
- State the hypothesis clearly
- Describe what evidence would confirm or refute it
- Rank by likelihood

Present to user: "I think the most likely cause is X because Y. Let me verify."

### 4. Test

Test the top hypothesis:
- Write a minimal reproduction if possible
- Add a targeted log/assertion
- Run the specific failing test or trigger the behavior
- Check if evidence confirms or refutes

If refuted: move to next hypothesis. If all exhausted, widen investigation.

### 5. Fix

Once root cause confirmed:
- Implement the minimal fix
- Run the failing test/scenario to verify
- Run broader test suite to check for regressions
- Commit with prefix: `fix: <description of what was wrong and why>`

### 6. Update State

Remove `[debugging]` from STATE.md mode line.
If the fix touched planned tasks, update their status.
If the fix caused state drift (tasks completed out of order, files changed that don't match plan), suggest `/flow:sync` to reconcile.

## Rules

- **No shotgun debugging.** Don't change multiple things hoping one works.
- **Evidence first.** Read the code before guessing what's wrong.
- **Minimal fixes.** Fix the root cause, not the symptom.
- **3-strike rule.** If 3 hypotheses fail, step back and re-examine assumptions.
- **Git checkpoint.** If the codebase works now, commit before experimenting.

## Integration

Works alongside any Flow mode. Debug doesn't replace your current mode — it's a temporary overlay. When done, you're back where you were.

## Recommended Next Step

Consult `~/.claude/flow/references/transitions.md` and print the recommended action as the last line of output.
