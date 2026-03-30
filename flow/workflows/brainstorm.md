# Flow Brainstorm

Explore the idea collaboratively before committing to a plan. Turn a vague goal into a concrete design through focused conversation.

## Contract

**Triggers:** Called by `/flow:plan` after research. Also standalone on "let's brainstorm", "explore options", or "what are the approaches".
**Inputs:** Research findings (if available), user's goal description, codebase context.
**Outputs:** Design summary with approach, key decisions, out-of-scope list, and open questions. Explicit user approval before proceeding.
**Edge cases:**
- Only one viable approach exists → present it with reasoning, don't invent bad alternatives
- User rejects all approaches → ask what's wrong, re-investigate, propose new options
- User wants to jump straight to building → confirm they're sure, suggest `/flow:vibe` if they want no ceremony

## When This Runs

Called automatically by `/flow:plan` after research (if research ran) or directly if no research is needed. The goal is a validated design direction before writing tasks.

## Process

### 1. Understand the goal

Start with what's known — research findings (if available), user's description, existing code context. Then ask clarifying questions to fill gaps.

**Rules for questions:**
- One question at a time. Don't overwhelm.
- Prefer multiple choice when possible — easier to answer than open-ended.
- Focus on: purpose, constraints, success criteria, scope boundaries.
- Stop asking when you have enough to propose approaches (usually 2-4 questions).

### 2. Propose approaches

Present 2-3 different ways to solve the problem:

```
## Approaches

### A: {name}
{2-3 sentences explaining the approach}
**Pros:** {why this works}
**Cons:** {what you give up}

### B: {name}
...

### Recommended: {A or B or C}
{Why this one — reference research findings if available}
```

If only one approach makes sense, say so and explain why alternatives don't work. Don't invent bad options for the sake of having three.

### 3. Refine with the user

The user picks an approach or pushes back. Iterate:
- If they pick one: flesh out the details
- If they push back: adjust and repropose
- If they want to combine: merge the best parts

This is a conversation, not a presentation. Follow their energy.

### 4. Lock the design

When the user approves the direction, confirm the design in a compact summary:

```
## Design Summary

**Approach:** {name}
**Key decisions:**
- {decision 1}
- {decision 2}
- {decision 3}

**Out of scope:**
- {thing we're not doing}

**Open questions (resolve during build):**
- {thing we'll figure out later}
```

Get explicit approval:
> Does this look right? I'll write the implementation plan from this.

### 5. Hand off to plan writing

Once approved, proceed to writing the task checklist. The design summary becomes the basis for breaking work into tasks.

## Principles

- **YAGNI ruthlessly.** Remove anything that isn't needed for the stated goal.
- **Design can be short.** A simple feature needs a simple design — a few sentences, not a document.
- **Scale to complexity.** A database migration gets 2 questions and 1 approach. A new architecture gets 5 questions and 3 approaches.
- **No implementation during brainstorm.** Don't write code, don't create files. Design only.
- **Capture the "why."** Decisions without rationale are forgotten. The rationale is more valuable than the decision.
