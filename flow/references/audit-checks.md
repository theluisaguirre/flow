# Shared Audit Checks

Used by both `_bootstrap` and `/flow:cleanup`. Single source of truth for structural validation.

## ROADMAP Checks

- [ ] Duplicate phase numbers (two entries with same phase N)
- [ ] Gaps in phase numbering (1, 2, 4 — missing 3)
- [ ] Phases marked complete but missing verification evidence
- [ ] Phases marked incomplete but all tasks done in plan

## STATE.md Checks

- [ ] Current phase references a phase not in roadmap
- [ ] Mode doesn't match state (says "build" but no plan exists)
- [ ] Tasks don't match any plan file
- [ ] Stale decisions referencing deleted phases
- [ ] `.flow/STATE.md` and `.planning/STATE.md` disagree (if both exist)

## Plan File Checks

- [ ] Orphaned plans (phase removed but plan file remains)
- [ ] All tasks checked but phase not marked complete
- [ ] Multiple plan files for the same phase

## dev-session.json Checks

- [ ] `step` doesn't match `.flow/STATE.md` mode
- [ ] Debug state inconsistency

## Git State Checks

- [ ] Uncommitted changes
- [ ] Detached HEAD
- [ ] Branches referencing phases no longer in roadmap

## Auto-Fix Rules

Safe mechanical fixes (apply automatically):
- Renumber duplicates (keep content, fix numbers)
- Close numbering gaps
- Sync dev-session.json step to STATE.md mode
- Mark phase complete when all tasks checked

Ambiguous fixes (ask user):
- Two phases with same number but different content
- Phase completion vs. incomplete task mismatch with unclear intent
- Conflicting state between `.flow/` and `.planning/`
