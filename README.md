# Flow

**Git-native development workflow for Claude Code.**

Lightweight state tracking with first-class vibe mode. Plan when you want structure. Vibe when you don't. Flow tracks everything either way.

```bash
npx flow-dev@latest
```

---

## Why Flow

Claude Code is powerful but stateless between sessions. You lose context on what you were building, which tasks are done, and what's next. Flow fixes that with a `.flow/` directory that survives across conversations.

**What it replaces:** Manually writing handoff notes, re-explaining project state every session, losing track of what you vibed vs. planned.

**What it doesn't replace:** Your judgment. Flow is a lightweight system, not a heavyweight process. Skip anything that doesn't help.

---

## How It Works

Flow tracks your project state in `.flow/STATE.md` — a simple markdown file that Claude reads and updates as you work.

### The Core Loop

```
/flow:start    →  Initialize in any project (scans existing context)
/flow:plan     →  Design before building (optional — skip to vibe)
/flow:build    →  Execute plan tasks with TDD and commit checkpoints
/flow:vibe     →  Free-form execution — no ceremony, reconcile later
/flow:review   →  Verify work (spec compliance + code quality)
/flow:ship     →  Commit, push, PR, complete phase
/flow:pause    →  Save session handoff for next time
```

### Supporting Commands

```
/flow:status   →  Where am I? What's next?
/flow:sync     →  Reconcile STATE.md with git after vibing
/flow:debug    →  Scientific method debugging with state awareness
/flow:cleanup  →  Fix structural issues (duplicates, orphaned files)
```

### Vibe Mode

Start with `/flow:vibe` and just build. Flow tracks your commits passively. When you're ready for structure, `/flow:sync` reconciles what you vibed against your plan.

No gatekeeping. No "is this in the plan?" prompts. Execute first, organize later.

### Session Handoff

Run `/flow:pause` before ending a session. Flow writes a handoff note to STATE.md. Next session, the startup hook displays it automatically — Claude picks up exactly where you left off.

---

## Installation

### One Command (recommended)

```bash
npx github:theluisaguirre/flow
```

This copies Flow commands and workflows to `~/.claude/` and registers a startup hook.

### Update

Run the same command again — it overwrites with the latest version.

```bash
npx github:theluisaguirre/flow
```

### Manual / Dev Install

```bash
git clone https://github.com/theluisaguirre/flow.git
cd flow
node bin/install.js
```

### Uninstall

```bash
npx github:theluisaguirre/flow --uninstall
```

---

## What Gets Installed

```
~/.claude/
├── commands/flow/       # 11 slash commands (/flow:start, /flow:build, etc.)
├── flow/
│   ├── workflows/       # Full workflow logic for each command
│   ├── references/      # Transition map, audit checks
│   └── templates/       # STATE.md and ROADMAP.md starters
└── hooks/
    └── flow-startup.js  # Auto-displays status on session start
```

Nothing touches your project files until you run `/flow:start`.

---

## Project State

Flow creates a `.flow/` directory in your project root:

```
.flow/
├── STATE.md    # Current phase, mode, tasks, vibed entries, decisions
├── ROADMAP.md  # Phase list with completion status
├── plans/      # Active plan files
└── done/       # Completed plans (archived)
```

**STATE.md** is the single source of truth. Every command reads and writes it. It's plain markdown — you can edit it by hand if needed.

---

## Commands Reference

| Command | Mode | Purpose |
|---------|------|---------|
| `/flow:start` | — | Initialize Flow, scan existing project context |
| `/flow:status` | — | 5-line status summary + suggested next action |
| `/flow:plan` | Plan | Brainstorm design, write task checklist |
| `/flow:build` | Build | Execute tasks sequentially, TDD, commit checkpoints |
| `/flow:vibe` | Vibe | Free-form execution, passive tracking |
| `/flow:review` | Review | Spec compliance + code quality verification |
| `/flow:ship` | Ship | Commit, push, PR, complete phase |
| `/flow:debug` | (overlay) | Scientific method debugging, any mode |
| `/flow:sync` | — | Reconcile STATE.md with git history |
| `/flow:pause` | — | Write session handoff note |
| `/flow:cleanup` | — | Audit and repair structural issues |

---

## Requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI
- Node.js >= 18
- Git

---

## License

MIT
