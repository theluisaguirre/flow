# Verify Checks

Used by `/flow:build`, `/flow:review`, `/flow:ship`. **Code that compiles is not evidence.**
Adapted from BAMA's `build-and-verify` (audit: `BAMA-AUDIT-2026-10-28.md`).

## Done means four things, not one

A task that changes a visible surface is `- [x]` only when:

1. **The build is clean** — no new warnings vs the phase baseline.
2. **You looked at it** — the surface was launched and seen, in **both light and dark**, at the sizes it ships at.
3. **It matches the task** — what you see is what the task said it would do, not merely "something rendered".
4. **Its proof tag passed** — see the tags in `plan.md` §5. `[test]` ran green, `[snap]` was compared, `[manual]` was actually tried by a person.

If the surface is invisible (parsing, DSP, file I/O, a CLI), 2–3 are replaced by its `[test]` tag.

## Three things agents reliably miss

Compiling never catches these. Look for them specifically:

- **A focus ring or highlight nobody asked for** — SwiftUI adds them by default on new controls.
- **A scroll bar with nothing to scroll** — a container sized wrong shows a track over static content.
- **An empty band under short content** — a view that fills its parent leaves dead space when content is small.

Add to the list as you find your own repeat offenders.

## What makes a screenshot worthless

- **The window isn't frontmost.** Gray traffic lights mean an inactive window: colours, vibrancy and
  focus states are all wrong. Not a valid review.
- **Screen Recording permission isn't granted.** Glass/vibrancy surfaces capture blank or black.
  Check the capture is real before trusting it.
- **It ran against a scratch store.** A snapshot of an empty `/tmp` database proves the empty state
  only. Say which store it used.
- **One appearance only.** Light-only or dark-only is half a check.

## Never verify against real data

Run against seed or test data, never the user's live library, vault, document set or client site.
A verify pass must not be able to damage anything. If a check genuinely needs real data, stop and ask.

**Profiling and traces:** instrument output (traces, logs, crash reports, heap dumps) can contain file
paths, document contents, tokens and customer data. Don't paste raw traces into notes, commits or the
vault. Quote the measurement, not the dump.

## Per-project commands

Fill this in per repo (in the project's `CLAUDE.md` or `.flow/STATE.md` under `### Verify`), so the
agent doesn't re-derive it each session:

| What | Command |
|---|---|
| Build | |
| Test | |
| Run / launch | |
| Snapshot | |
| Lint / warnings count | |
| Seed / test data path | |

Project specifics (real commands, known gotchas, weak spots) are **not** kept here.
They live either in that project's own `CLAUDE.md` under a `## Verify` heading, or in
`~/.claude/flow-local/verify-projects.md` if you keep a personal set outside the repo.

## Launching

Record the project's launch command in the table above so it isn't re-derived each session. If a
`run`-style skill is installed, use it rather than inventing a launch procedure per project.
