# Flow — Shareable Claude Code Workflow System

**Date:** 2026-03-28
**Status:** Design approved — ready to implement

---

## What This Is

Package the Flow development workflow system (currently a local Claude Code plugin at `~/.claude/plugins/flow/`) as a standalone GitHub repo that anyone can install with one command.

**Install command:** `npx flow-dev@latest`
**GitHub:** `github.com/theluisaguirre/flow`
**Slash commands:** `/flow:start`, `/flow:status`, `/flow:plan`, `/flow:build`, `/flow:vibe`, `/flow:review`, `/flow:ship`, `/flow:debug`, `/flow:sync`, `/flow:pause`, `/flow:cleanup`

---

## Repo Structure

```
flow/
├── bin/
│   └── install.js              # npx entry point — copies commands + flow/ to ~/.claude/
├── commands/
│   └── flow/
│       ├── start.md            # /flow:start
│       ├── status.md           # /flow:status
│       ├── plan.md             # /flow:plan
│       ├── build.md            # /flow:build
│       ├── vibe.md             # /flow:vibe
│       ├── review.md           # /flow:review
│       ├── ship.md             # /flow:ship
│       ├── debug.md            # /flow:debug
│       ├── sync.md             # /flow:sync
│       ├── pause.md            # /flow:pause
│       └── cleanup.md          # /flow:cleanup
├── flow/
│   ├── workflows/
│   │   ├── _bootstrap.md       # Pre-flight logic (hook calls this)
│   │   ├── start.md
│   │   ├── status.md
│   │   ├── plan.md
│   │   ├── build.md
│   │   ├── vibe.md
│   │   ├── review.md
│   │   ├── ship.md
│   │   ├── debug.md
│   │   ├── sync.md
│   │   ├── pause.md
│   │   └── cleanup.md
│   ├── references/
│   │   ├── transitions.md
│   │   └── audit-checks.md
│   └── templates/
│       ├── state.md
│       └── roadmap.md
├── hooks/
│   └── flow-startup.js         # Session-start hook: auto-bootstrap + status
├── package.json                # npm package metadata + bin entry
├── LICENSE                     # MIT
├── README.md
└── CHANGELOG.md
```

## How Install Works

`npx flow-dev@latest` runs `bin/install.js` which:

1. Copies `commands/flow/` → `~/.claude/commands/flow/`
2. Copies `flow/` → `~/.claude/flow/` (workflows, references, templates)
3. Copies `hooks/flow-startup.js` → `~/.claude/hooks/flow-startup.js`
4. Registers the hook in `~/.claude/settings.json` if not already present
5. Prints install confirmation with quick-start instructions

Uninstall: remove the copied directories + hook registration.

## Command → Workflow Split

Each command file (`commands/flow/*.md`) is a thin entry point:
- Frontmatter with description (shown in `/help`)
- Body loads the corresponding workflow from `~/.claude/flow/workflows/`
- Workflow file contains the full step-by-step logic

This keeps commands lightweight (fast to parse) while workflows can be as detailed as needed.

## Hooks

### flow-startup.js
- Triggers: on session start (PreToolUse or similar)
- Behavior: checks for `.flow/STATE.md`, displays status summary, consumes handoff notes
- Replaces: the manual CLAUDE.md hook template

## Content Migration

All skill content stays the same — it's a restructure, not a rewrite:
- `skills/*/SKILL.md` content → `flow/workflows/*.md`
- `skills/_bootstrap/SKILL.md` → `flow/workflows/_bootstrap.md`
- `skills/references/*` → `flow/references/*`
- `skills/start/hook-template.md` → superseded by real hook

## Package Identity

- **npm name:** `flow-dev` (or `@theluisaguirre/flow` if scoped)
- **Version:** `1.0.0`
- **License:** MIT
- **Keywords:** claude-code, workflow, development, git, vibe-coding
