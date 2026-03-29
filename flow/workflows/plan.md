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

### 3. Research (if needed)

Follow `~/.claude/flow/workflows/research.md`.

Investigate the domain — ecosystem, prior art, codebase context, constraints. Skip if the task is well-understood and doesn't need investigation (simple bug fix, UI tweak, etc.). When in doubt, ask:
> This seems straightforward — skip research and go straight to design?

Research findings are saved to `.flow/plans/{phase-name}-research.md`.

### 4. Brainstorm the design

Follow `~/.claude/flow/workflows/brainstorm.md`.

Explore the idea collaboratively — clarify goals, propose 2-3 approaches with trade-offs, refine with the user, lock a design direction. Get explicit approval before writing the plan.

**Checkpoint:** Confirm the user approves the design direction before writing the plan file. If context is lost, the brainstorm notes in conversation history serve as recovery.

### 5. Write the implementation plan

Break the approved design into a sequenced task checklist. Each task should be:
- Small enough to complete and commit in one step
- Specific enough that success is obvious
- Ordered by dependency (foundations first)

Save to `.flow/plans/{phase-name}.md` using checklist format:

```markdown
# Phase {N}: {name}

## Tasks
- [ ] Task 1: {description}
- [ ] Task 2: {description}
...
```

### 6. Update STATE.md

Copy the task checklist into `### Plan` under the current phase. Clear `### Vibed`.

```markdown
### Plan
- [ ] Task 1: {description}
- [ ] Task 2: {description}

### Vibed
```

### 7. Hand off

Tell the user:
> "Plan saved. Click Build or `/flow:build` when ready."

## Recommended Next Step

Consult `~/.claude/flow/references/transitions.md` and print the recommended action as the last line of output.
