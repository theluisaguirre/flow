# Flow Plan

## Steps

### 1. Set mode to plan

Update `.flow/STATE.md` — change the `## Current:` line to set mode to `plan`:
```
## Current: Phase {N} — {name} (plan mode)
```

Also update `.planning/dev-session.json`: set `step` to `"plan"`.

### 2. Check for existing plan

Read `.flow/plans/{phase-name}.md`. If it exists, ask:
> "A plan already exists for this phase. Revise the existing plan, or start a new phase?"

If the user prefers free-form work without planning, suggest `/flow:vibe` as an alternative.

Wait for answer before continuing.

### 3. Brainstorm the design

**REQUIRED SUB-SKILL:** Use superpowers:brainstorming to explore the idea.

- Ask questions one at a time
- Propose 2-3 approaches with trade-offs
- Get user approval on the design before proceeding

**Checkpoint:** Confirm the user approves the design direction before writing the plan file. If context is lost, the brainstorm notes in conversation history serve as recovery.

### 4. Write the implementation plan

**REQUIRED SUB-SKILL:** Use superpowers:writing-plans to create the plan.

Save to `.flow/plans/{phase-name}.md` using checklist format:

```markdown
# Phase {N}: {name}

## Tasks
- [ ] Task 1: {description}
- [ ] Task 2: {description}
...
```

### 5. Update STATE.md

Copy the task checklist into `### Plan` under the current phase. Clear `### Vibed`.

```markdown
### Plan
- [ ] Task 1: {description}
- [ ] Task 2: {description}

### Vibed
```

### 6. Hand off

Tell the user:
> "Plan saved. Click Build or `/flow:build` when ready."

## Recommended Next Step

Consult `~/.claude/flow/references/transitions.md` and print the recommended action as the last line of output.
