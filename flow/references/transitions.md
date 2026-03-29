# Flow Skill Transitions

Every skill must print a `→ Recommended:` line at completion. Use this map to determine valid next actions.

## Transition Map

### /flow:start
| Outcome | Next |
|---------|------|
| Project has no plan | `/flow:plan` |
| Project has active plan | `/flow:build` or `/flow:status` |
| Structural issues found | `/flow:cleanup` |
| User wants free-form | `/flow:vibe` |

### /flow:plan
| Outcome | Next |
|---------|------|
| Plan approved | `/flow:build` |
| User wants to skip planning | `/flow:vibe` |
| User wants to revise | Stay in `/flow:plan` |

### /flow:build
| Outcome | Next |
|---------|------|
| All tasks complete | `/flow:review` |
| Tests fail during TDD | `/flow:debug` |
| User requests off-plan work | `/flow:vibe` (option a) or add to plan (option b) |
| Session ending | `/flow:pause` |
| No plan exists | `/flow:plan` or `/flow:vibe` |

### /flow:vibe
| Outcome | Next |
|---------|------|
| User switches to structured work | `/flow:build` (runs vibe exit first) |
| Wants to reconcile state | `/flow:sync` |
| Session ending | `/flow:pause` |
| Ready to ship | `/flow:review` |

### /flow:review
| Outcome | Next |
|---------|------|
| Review passed | `/flow:ship` |
| Issues found | `/flow:build` (fix, then re-review) |
| Structural issues found | `/flow:cleanup` |

### /flow:ship
| Outcome | Next |
|---------|------|
| Phase shipped | `/flow:plan` (next phase) |
| Milestone complete | `/flow:status` |
| Tests/build fail | `/flow:debug` |
| Push fails | `/flow:debug` or retry |

### /flow:debug
| Outcome | Next |
|---------|------|
| Bug fixed | Return to previous mode |
| State drift after fix | `/flow:sync` |

### /flow:pause
| Outcome | Next |
|---------|------|
| Session paused | `/flow:status` (next session) |

### /flow:sync
| Outcome | Next |
|---------|------|
| State reconciled | `/flow:status` |
| Issues found | `/flow:cleanup` |

### /flow:cleanup
| Outcome | Next |
|---------|------|
| Issues fixed | `/flow:status` |
| No issues | `/flow:status` |

### /flow:status
| Outcome | Next |
|---------|------|
| Has handoff | Display it, suggest resuming current mode |
| Plan mode, no tasks | `/flow:plan` |
| Build mode, tasks pending | `/flow:build` |
| Build mode, all done | `/flow:review` |
| Vibe mode | `/flow:sync` when ready |
| Review mode | `/flow:ship` when satisfied |

## Skill Exit Protocol

When switching FROM one skill TO another, the outgoing skill's exit logic runs first:

1. **Vibe → anything**: Run vibe's "On Exit" (diff from entry SHA, summarize, reconcile with plan)
2. **Debug → anything**: Remove `[debugging]` from STATE.md mode line
3. **All others**: No exit logic needed — just transition

The INCOMING skill does NOT run pre-flight if the outgoing skill already updated STATE.md.
