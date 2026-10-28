# Flow Research

Investigate the domain before planning. Gather evidence so planning decisions are informed, not guessed.

## Contract

**Triggers:** Called by `/flow:plan` before brainstorming. Also standalone when "I need to understand this first" or "what exists for this".
**Inputs:** User's description of the phase or feature. Optionally, existing codebase and git history.
**Outputs:** `.flow/plans/{phase-name}-research.md` with question/finding/implication format. Summary printed with key findings.
**Edge cases:**
- No web search available → skip ecosystem/external research, note the gap, rely on codebase and git only
- Task is trivial (bug fix, typo) → skip research entirely, say so, hand off to brainstorm
- Research question can't be answered with available tools → state "unknown" and move on, don't block

## When This Runs

Called automatically by `/flow:plan` before brainstorming. Can also be run standalone when you need to understand a domain before committing to an approach.

## Process

### 1. Define what to investigate

**If the goal is vague, interview first** (`~/.claude/flow/references/interview.md`) — you can't
research "make it better". A few questions about what it is, who it's for and what it is *not*
usually collapses five research questions into two. Skip when the ask is already concrete.

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

Sources: the codebase (read files, grep patterns, existing implementations), git history (what was
tried and reverted), the web (docs, packages, GitHub), the file system (configs, lock files,
dependencies that constrain choices).

**Fan out when there are 3+ independent questions.** Launch one subagent per track, in a single
message so they run in parallel. Give each the same brief: the question, which sources to use, "tag
every claim `[V]`/`[K]`/`[U]`", and "return under 200 words". Tracks that depend on each other stay
sequential.

Spend no more than 2-3 minutes per question. The goal is informed planning, not exhaustive research.

### 3. Summarize findings

Write a concise research summary. For each question:

Tag every claim so the plan knows what it's standing on:

- **`[V]` Verified** — checked directly this session (ran it, read the file, fetched the page). Say where.
- **`[K]` Known** — standard knowledge, not checked here. Fine for background, not for load-bearing decisions.
- **`[U]` Unverified** — assumption, inference or something a source asserted but nobody confirmed.

```
### {Question}
**Finding:** {1-2 sentence answer} `[V]`
**Evidence:** {what you found and where}
**Implication:** {how this affects the plan}
```

**Every `[U]` a decision rests on becomes a spike question.** List them at the end under
`## Unverified — needs a spike`. Don't plan on top of an assumption; `/flow:spike` is cheaper than
building the wrong thing.

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
