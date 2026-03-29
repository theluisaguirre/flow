# Changelog

## 1.0.0 (2026-03-28)

Initial release.

### Commands
- `/flow:start` — initialize Flow in any project
- `/flow:status` — check where you are
- `/flow:plan` — design before building
- `/flow:build` — execute plan with TDD and checkpoints
- `/flow:vibe` — free-form execution, reconcile later
- `/flow:review` — two-stage verification (spec + quality)
- `/flow:ship` — commit, push, PR, complete phase
- `/flow:debug` — scientific method debugging
- `/flow:sync` — reconcile STATE.md with git
- `/flow:pause` — session handoff for next time
- `/flow:cleanup` — audit and repair structural issues

### Features
- Git-native state tracking via `.flow/STATE.md`
- First-class vibe mode — no ceremony when you don't want it
- Session handoff — pause/resume across conversations
- Startup hook — auto-displays status on session start
- Transition map — every command suggests what to do next
