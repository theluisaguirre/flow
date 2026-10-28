# Interview

Used by `/flow:brainstorm` (step 1) and `/flow:research` (step 1). How to get enough out of the user to
design the right thing, without an interrogation.

The failure this prevents: building a careful, well-tested version of the wrong thing because
"make a vault app" sounded clear enough to start.

## Rules

- **One question per message.** Wait for the answer. Never a numbered list of six.
- **Offer choices.** "A, B, or something else?" is easier to answer than "what do you want?"
- **Lead with your best guess.** "I'd assume X — right?" People correct faster than they specify.
- **Stop when you can state the thing back.** Usually 3–6 questions. If you can write the one-liner
  and the user would agree with it, stop asking.
- **Don't ask what the repo already answers.** Read `CLAUDE.md`, `.flow/STATE.md`, the roadmap and
  existing code first. Asking something that's already written down wastes the user's time.
- **Record the answers**, in the design summary or the brief. An answer you don't write down gets
  asked again next session.
- **Separate *what* from *how*.** First pass: what it is, who it's for, what done means. Only once
  that's settled, implementation choices. Mixing them leaves both vague.
- **Challenge vague words.** "fast", "good", "simple", "probably", "I think" on anything
  load-bearing — ask what it means before moving on. Never let one into the brief.
- **Annotate the choices with what exists.** "Cards (reuses the existing card view)" beats "Cards".
  People choose better when the cost is visible.
- **If the user says "let me explain", stop offering choices.** Plain question, wait for prose, resume after.
- **Park scope creep, don't argue it.** "That's its own thing — noting it as deferred." Write it to a
  Deferred list in the brief, then return to the question.

## Rounds

Rotate the angle instead of walking a checklist — each angle finds a different blind spot.
Four to six rounds, 1–3 questions each:

1. **Researcher** — "What are you doing today that this replaces?" What exists, what's the delta?
2. **Simplifier** — "If you had to cut 50%, what's the irreducible core?"
3. **Boundary keeper** — "What explicitly will NOT be done? What's tempting to solve but shouldn't be?"
4. **Failure analyst** — "What does a broken version of this look like?"
5. **Closer** — "Anything you'd regret not deciding before I start building?"

## What to cover

Not a script. Pick the ones that are actually unknown.

**The thing itself**
- One sentence: what does it do, for whom?
- Who is it for — the user alone, clients, or the public? (Changes everything downstream.)
- What does the user do first, in the first 30 seconds?

**The edges** — these are where scope hides
- What is it explicitly *not*? Name two things it won't do.
- What's version 1 vs later? What would you cut to ship a week sooner?
- Is there an existing thing it replaces, or sits beside?

**Done**
- How will we know it works? (This becomes the proof tags in `plan.md` §5.)
- What would make you abandon it?

**Constraints**
- Platform and minimum OS. Does it need to run on iPad too?
- Anything that must not change — a file format, an existing project, a shipped behaviour?
- Any account, key or paid service involved? (If yes: the user supplies it; never log in unasked.)

**Design** (visible surfaces only)
- Is there an approved design master (Figma, Pencil `.pen`, a comp) already, or does this start one?
- Anything you've seen that gets the feel right? *Reference for feel — never a look-alike.*

## Ending it

Four things must be clear to stop: **goal** (specific — not "improve X"), **scope** (in and out, both
named), **constraints**, **done** (a check that resolves pass/fail). Every "done" line must be
falsifiable: *current → target → how we'd check*. If you can't write the check, it's still vague.

If one is still soft after six rounds, stop digging — write the brief and mark that line
`⚠ assumption — unverified`. A flagged gap is recoverable; a silent one isn't.

Write the result back in the user's words, not yours:

```
So: {one sentence}. For {who}. v1 does {A, B}; not {C, D}.
Done when {check}. Must not break {constraint}.
```

Then: **"Right?"** One line. If they correct it, update and move on — don't re-interview.

## When to skip

- A bug fix, or a task with an obvious shape.
- The user has already written the brief or the spec.
- `/flow:vibe` — vibe exists to escape ceremony. Don't interview in vibe mode.
