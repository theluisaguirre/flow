# Flow Spike

A quick, ugly, throwaway build that answers one question before you commit to the real thing. Keep the answer, throw away the code.

## Contract

**Triggers:** "spike this", "quick prototype", "ugly prototype", "does this even work", "try it before we plan", "proof of concept". Also offered by `/flow:plan` when the design hinges on an unknown.
**Inputs:** One question to answer. `.flow/STATE.md` is optional; a spike works in any git repo.
**Outputs:** A spike note in `.flow/spikes/{YYYY-MM-DD}-{slug}.md` (or `docs/spikes/` if the project has no `.flow/`). Spike code tagged and the branch deleted. Mode restored to whatever it was before.
**Edge cases:**
- Uncommitted changes at start → leave them in the working tree untouched; never stage them in spike commits. Before deleting the branch, confirm `git status` still shows them.
- Time box runs out with no answer → stop. Offer one extension (30 min). If still no answer, record "unknown" and what it would take to find out.
- Question answered early → stop early. Don't polish.
- Spike exposes a bug in real code → note it in the spike note. Don't fix it inside the spike; fix it on the main branch afterwards.
- User asks to keep the spike code → no. The code is never merged. Add a plan task: "rebuild {thing} properly, see spike note". If they insist, keep the tag; still don't merge.
- Already in spike mode → finish this spike (On Exit) before starting another.
- Not a git repo → work in place, no branch; warn that nothing is being isolated.

## On Enter

1. **Pin the question.** Ask, in one message:
   > What's the one question this spike answers, and how will we know the answer? (Default time box: 60 minutes.)

   Good questions: "Can CoreImage rotate a HEIC without re-encoding?", "Does a 3-column grid feel right at this window size?" Bad: "build the gallery."
   If the user gives a feature instead of a question, turn it into one and confirm.

2. **Isolate.** From the current branch:
   - If the tree is dirty: leave the user's changes where they are (they ride along on checkout) and never stage them. Only commit or stash them if the user asks. Say which you did.
   - `git checkout -b spike/{slug}`
   - Note the entry SHA.

3. **Record it so a context reset can't lose it.** If `.flow/STATE.md` exists:
   - Change `## Current:` to `... (spike mode)`; remember the previous mode.
   - Add:
     ```
     ### Spike
     - **Question**: {question}
     - **Answer looks like**: {how we'll know}
     - **Branch**: spike/{slug} · **Entry SHA**: {sha} · **From**: {original branch} ({previous mode} mode)
     - **Time box**: {N} min, started {timestamp}
     ```
   - Update `.planning/dev-session.json`: set `step` to `"spike"`.

4. Say: **"Spike on. Ugly is fine. Stop when the question is answered."**

## While Spiking

### DO
- Take the shortest path to the answer. Hard-code values, skip edge cases, copy-paste, use print statements.
- Commit freely with prefix `spike:`. Nothing here is reviewed.
- **Stage only the spike's own files** (`git add <paths>`). Never `git commit -a` or `git add -A`: the user's uncommitted work may be sitting in the tree, and it would leave with the spike branch.
- Stay on the question. If the user drifts into building the feature, say so once: "That's past the question. Spike's answered / not answered yet; want to stop here?"
- Watch the time box. At the limit, stop and report.

### DO NOT
- Write tests, docs, or refactor existing code.
- Touch unrelated files. The spike should be deletable in one `git branch -D`.
- Ask process questions. The user chose a spike to move fast.
- Merge, rebase, or push the spike branch.

## On Exit (question answered, time box hit, or user switches to any other skill)

**Transition protocol:** When any Flow skill detects `(spike mode)` in STATE.md, it MUST run this exit before entering its own mode.

1. Read question, branch, entry SHA and original branch from `### Spike` in STATE.md (not from memory). If no STATE.md, use the current branch name and reflog.
2. **Write the spike note** to `.flow/spikes/{YYYY-MM-DD}-{slug}.md` (or `docs/spikes/`):
   ```markdown
   # Spike: {question}
   **Date:** {date} · **Time spent:** {N} min · **Code:** tag `spike-{slug}-{date}` (not merged)

   ## Answer
   {Yes / No / Partly / Unknown}. One paragraph. Numbers if there are any.

   ## What was tried
   - {approach, result}

   ## What this means for the plan
   - {decision or constraint the real build should respect}

   ## Side findings
   - {bugs noticed, surprises, things to check later; or "none"}
   ```
   Commit the note on the **original** branch, not the spike branch.
3. **Throw the code away, recoverably:**
   - `git tag spike-{slug}-{date} spike/{slug}` (so it's findable later)
   - `git checkout {original branch}`, then `git status`: the user's uncommitted files must still show as modified. If any are missing, restore them from the spike branch (`git checkout spike/{slug} -- <path>` then `git reset -- <path>`) BEFORE deleting it.
   - `git branch -D spike/{slug}`
   - If the user stashed at entry: `git stash pop`.
4. Update STATE.md: remove `### Spike`, restore the previous mode on `## Current:`. Add one line under `### Decisions`: `- Spike {slug}: {one-line answer} ({date})`.
5. Restore `.planning/dev-session.json` `step` to the previous mode.
6. Report in 3 lines: the answer, where the note is, and what it changes about the plan.

## Principles

A spike buys an answer, not code. Ugly is the point. Thirty cheap minutes now save a week of building the wrong thing. The discipline is the throwaway: if spike code could sneak into the product, the spike stops being cheap.

## Recommended Next Step

Consult `~/.claude/flow/references/transitions.md` and print the recommended action as the last line of output.
