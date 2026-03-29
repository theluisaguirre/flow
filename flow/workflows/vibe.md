# Vibe Skill

## On Enter

1. Update STATE.md: set `## Current: Phase {N} — {name} (vibe mode)`
   Also update `.planning/dev-session.json`: set `step` to `"vibe"`.
2. Write the entry SHA to STATE.md under a `### Vibe Session` section:
   `- **Entry SHA**: {sha} ({timestamp})`.
   This survives context resets.
3. Say: **"Vibe mode active. I'll track what you do but won't get in your way."**

## While Vibing

### DO

- Execute whatever the user asks. No gatekeeping.
- After each commit, append to `### Vibed` in STATE.md:
  `- {description} ({N files}, {date})`
- Suggest a checkpoint when changes pile up (>5 files touched or >30 min elapsed). Suggestion only — don't block.
- Offer TDD if relevant, never require it.
- Use commit prefix: `vibe: {description}`
- Suggest `/flow:pause` if the user mentions ending their session.

### DO NOT

- Block or delay any request.
- Ask "is this in the plan?"
- Nag about process, tests, or documentation.
- Force any ceremony. The user chose vibe to escape it.

## On Exit (switching to Build, Review, or any other skill)

**Transition protocol:** When any Flow skill detects the current mode is `vibe` in STATE.md, it MUST run this exit logic before entering its own mode. This ensures vibe work is always reconciled.

1. Read the entry SHA from `### Vibe Session` in STATE.md (not from conversation memory).
2. Read `git log` from that entry SHA to HEAD.
3. Summarize what was vibed (files changed, features added, fixes made).
4. If a plan exists in STATE.md, compare vibed work against plan phases and offer to reconcile (mark completed items, flag unplanned work).
5. Remove the `### Vibe Session` section from STATE.md after reconciliation.
6. Update STATE.md: change mode from `vibe` to the target skill's mode, preserve the `### Vibed` log.

## Principles

This skill is **light and permissive**. Tracking is passive. The user flows; the system observes.

## Recommended Next Step

Consult `~/.claude/flow/references/transitions.md` and print the recommended action as the last line of output.
