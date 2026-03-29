# Flow Research

Investigate the domain before planning. Gather evidence so planning decisions are informed, not guessed.

## When This Runs

Called automatically by `/flow:plan` before brainstorming. Can also be run standalone when you need to understand a domain before committing to an approach.

## Process

### 1. Define what to investigate

From the user's description of the phase or feature, identify 3-5 research questions. These typically fall into:

- **Ecosystem:** What libraries, tools, or APIs exist for this? What do others use?
- **Prior art:** Has this been solved before? What patterns are common?
- **Codebase:** What exists in the current project that's relevant? What can be reused?
- **Constraints:** What technical limits, compatibility requirements, or dependencies matter?
- **Unknowns:** What does the user not know yet that would change the approach?

Present the questions to the user:
> Before planning, I'd like to investigate:
> 1. {question}
> 2. {question}
> ...
> Anything to add or skip?

### 2. Investigate

For each question, use the tools available:

- **Codebase:** Read relevant files, grep for patterns, check existing implementations
- **Git history:** What's been tried before? Any reverted approaches?
- **Web search:** Check documentation, npm/PyPI packages, Stack Overflow, GitHub repos
- **File system:** Check for config files, lock files, existing dependencies that constrain choices

Spend no more than 2-3 minutes per question. The goal is informed planning, not exhaustive research.

### 3. Summarize findings

Write a concise research summary. For each question:

```
### {Question}
**Finding:** {1-2 sentence answer}
**Evidence:** {what you found and where}
**Implication:** {how this affects the plan}
```

### 4. Save research

Write findings to `.flow/plans/{phase-name}-research.md`. This persists across sessions and informs the plan.

### 5. Hand off to brainstorm

Present the summary to the user:
> Research complete. Key findings:
> - {finding 1}
> - {finding 2}
> - {finding 3}
>
> Ready to brainstorm the design with this context.

Then proceed to the brainstorm step.

## Principles

- **Evidence over opinion.** Link to what you found, don't just assert.
- **Surprises first.** Lead with findings that change assumptions.
- **Short and useful.** A research doc nobody reads is wasted work. Keep it scannable.
- **Know when to stop.** If a question can't be answered with available tools, say so and move on.
