# Refactor Checks

Used by `/flow:refactor`. Single source of truth for code-health checks. Language-agnostic; adapt the grep to the project's language.

## Principles

1. **One source for every style.** Colours, fonts, spacing, radii, icon sizes live in one tokens file. Nothing else writes a literal style.
2. **Features are modules.** Brushes, papers, fills, export, etc. each live in their own folder/package with a small public surface. The base app talks to the module through that surface only. Deleting a module breaks the module, not the app. **A module boundary counts only when tests cover its surface**; extracting a module without tests is folder-shuffling, so write or move the tests in the same step.
3. **Design it twice.** Before extracting a shared abstraction, sketch a second way of doing it. Pick the better one. The first idea is rarely the best, and an abstraction is expensive to undo.
4. **No duplicates, but no hasty abstractions.** Rule of three: merge on the third copy, not the second. Two similar blocks that differ in intent stay separate (Sandi Metz: duplication is cheaper than the wrong abstraction). Merge only when the shared version is simpler than both originals.
5. **No slop.** No dead code, no unused imports, no commented-out blocks, no leftover debug prints, no TODOs older than the current phase, no over-defensive wrappers around things that cannot fail.
6. **Nothing stays broken.** Build warnings, failing or skipped tests, and deprecated APIs get fixed or get a dated note in STATE.md saying why not.
7. **Behaviour does not change.** Refactor commits produce identical output. If a check needs a behaviour change, it becomes a plan task, not a refactor step.

## A. Style checks
- [ ] Literal colours (`Color(red:`, hex strings, `#RRGGBB`, `rgb(`) outside the tokens file
- [ ] Literal fonts / sizes (`.font(.system(size:`, `font-size:`, `fontSize:`) outside tokens
- [ ] Literal spacing / radii (`.padding(12)`, `cornerRadius(8)`, `margin: 8px`) outside tokens
- [ ] Same visual value defined in two token names
- [ ] Token file imports anything from a feature module (tokens must sit at the bottom)

## B. Module boundary checks
- [ ] Each feature (list them from the folder structure) has a single entry point / public API
- [ ] Base app references a feature's internals (count symbol uses per feature from app/canvas/shell code; anything over ~10 distinct internal symbols is a leak)
- [ ] Two feature modules import each other (cycle)
- [ ] A feature's data model is defined inside UI code
- [ ] Shared code (`Core`, `Shared`, `Utils`) imports feature code (dependency runs the wrong way)

## B2. Structural signals (added 2026-10-28)
- [ ] **Deletion test.** For each module: could you delete it and have the app still build, with only that feature gone? If not, the boundary is fiction.
- [ ] **Git hot spots.** `git log --format= --name-only | sort | uniq -c | sort -rn | head -20` — the most-churned files are where the design is wrong, not where the work is.
- [ ] **FIXLOG clusters.** 3+ `.flow/FIXLOG.md` entries against one file/module = structural finding.

## C. Duplication checks
- [ ] Functions / views / components with the same body modulo names (search for repeated 6+ line blocks)
- [ ] Multiple helpers that do the same thing (`formatDate`, `dateString`, `prettyDate`)
- [ ] Copy-pasted switch/if ladders that should be a table or a protocol
- [ ] Constants defined in more than one place

## D. Slop checks
- [ ] Unused imports, variables, functions, files (compiler warnings; `grep -rn` for symbols with one hit)
- [ ] Commented-out code blocks (3+ consecutive commented lines of code)
- [ ] Debug prints / console.log / print( left in non-debug code
- [ ] Empty catch blocks, `try?` that swallows errors silently in non-trivial paths
- [ ] Wrapper functions that only call another function with the same args
- [ ] Files over ~800 lines, functions over ~80 lines (candidates to split, not automatic)
- [ ] Stale TODO/FIXME/HACK older than the current phase (check `git blame`)
- [ ] Naming drift: same concept with two names (`colour` vs `color`, `brush` vs `pen`)

## E. Broken checks
- [ ] Build warnings (capture count before and after)
- [ ] Failing, skipped or disabled tests
- [ ] Deprecated API warnings
- [ ] Force unwraps / `!` / `as any` / `@ts-ignore` in non-test code
- [ ] Hard-coded paths, user names, machine-specific values
- [ ] **Profiling/trace output is not pasted anywhere.** Traces, logs and heap dumps can contain file paths, document contents and tokens. Quote the measurement, never the dump.

## Priority order

1. **E Broken** (fix first, these hide other problems)
2. **A Styles** (mechanical, high visibility, low risk)
3. **D Slop** (mechanical, low risk)
4. **C Duplication** (medium risk, needs tests around it)
5. **B Boundaries** (highest value, highest risk; do last and in the smallest steps)

## Safety rules

- Baseline first: run build + full tests, record warning count and test count. Commit or stash so the tree is clean.
- One check category per commit at most; one module move per commit always. Prefix `refactor:`.
- After every step: build + tests must match baseline (or improve). Any new failure → revert the step, record it, move on.
- Snapshot / golden tests exist → run them every step. They are the proof behaviour didn't change.
- Never delete files; move dead files to `.flow/archive/YYYY-MM-DD-{path}`.
- Never touch design: no visual change without the pen file (project design rule). Token consolidation must map 1:1 to the same rendered values.
- Stop and ask when a fix needs a behaviour or design decision. Write it as a plan task instead.
