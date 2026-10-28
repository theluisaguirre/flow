# Flow Plan

## Contract

**Triggers:** "plan this", "let's plan", "design first", "write a plan", or starting a new phase that needs architecture decisions.
**Inputs:** `.flow/STATE.md` with a current phase. Optionally, existing research or brainstorm notes in `.flow/plans/` and spike notes in `.flow/spikes/`.
**Outputs:** `.flow/plans/{phase-name}.md` with sequenced task checklist. `### Plan` section in STATE.md populated. Mode set to `plan`.
**Edge cases:**
- Plan already exists for this phase → ask: revise existing or start new phase
- User wants to skip planning → suggest `/flow:vibe`
- Design depends on something unproven → suggest `/flow:spike` first, then resume
- Context lost mid-brainstorm (context window reset) → conversation history has the brainstorm notes, resume from there
- Phase name contains special characters → slugify for filename (spaces to hyphens, lowercase)

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

**Deferred refactor items.** Check the latest `.flow/refactor/*-audit.md` for findings marked deferred and `.flow/STATE.md` for `refactor:` tasks. Offer them as candidate tasks for this phase: "The last refactor deferred {N} items ({top 2}). Include any in this phase?" Include what the user picks; leave the rest deferred.

Wait for answer before continuing.

**Revising is not a shortcut.** A revision still runs steps 4b–4c for anything the plan adds or changes that is not yet spiked or mocked. A task that says "master first", "mock", or "sign off on the comp" is a sign the mock belongs in step 4c now, not in the task list.

### 3. Research (if needed)

Follow `~/.claude/flow/workflows/research.md`.

Investigate the domain — ecosystem, prior art, codebase context, constraints. Skip if the task is well-understood and doesn't need investigation (simple bug fix, UI tweak, etc.). When in doubt, ask:
> This seems straightforward — skip research and go straight to design?

Research findings are saved to `.flow/plans/{phase-name}-research.md`.

### 4. Brainstorm the design

Follow `~/.claude/flow/workflows/brainstorm.md`.

Explore the idea collaboratively — clarify goals, propose 2-3 approaches with trade-offs, refine with the user, lock a design direction. Get explicit approval before writing the plan.

**Checkpoint:** Confirm the user approves the design direction before writing the plan file. If context is lost, the brainstorm notes in conversation history serve as recovery.

### 4b. Spike (optional)

If the approved direction hinges on an unknown you can't settle by reading code ("will it work?", "is it fast enough?", "does it feel right?"), offer a spike before writing tasks:
> This plan assumes {X}. Want a quick throwaway spike to check before we commit? (`/flow:spike`)

Also read any existing notes in `.flow/spikes/` that touch this phase and fold their "What this means for the plan" lines into the design. Skip this step for bug fixes, refactors and anything already proven.

### 4c. UI design (optional)

If the work adds or changes screens, get the layout approved before writing tasks: mock it in whatever design tool the project uses (Figma, Pencil, a sketch — or a dedicated redesign skill if one is installed), show it, and record the approval in the design summary. Rough is fine; the point is agreeing on what gets built. Skip for backend work, bug fixes and changes with no visible surface.

### 5. Write the implementation plan

Break the approved design into a sequenced task checklist. Each task should be:
- Small enough to complete and commit in one step
- Specific enough that success is obvious
- Ordered by dependency (foundations first)
- **Tagged with how it will be checked** — every task ends with one of:
  `[test]` an automated test proves it · `[snap]` a screenshot is compared · `[manual]` a person must try it · `[none]` no visible surface and nothing to assert (rare; justify it).
  "Works well" is not checkable. **If nothing can check it, it's a decision, not a task** — settle it in the design step instead.

Save to `.flow/plans/{phase-name}.md` using checklist format:

```markdown
# Phase {N}: {name}

## Tasks
- [ ] Task 1: {description} `[test]`
- [ ] Task 2: {description} `[snap]`
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
