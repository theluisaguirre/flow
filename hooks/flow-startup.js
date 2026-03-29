#!/usr/bin/env node

// Flow startup hook — runs once per session on first tool call.
// Checks for .flow/STATE.md, displays status, consumes handoff notes.
// Exits silently if Flow is not initialized in the current project.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout: 5000 }).trim();
  } catch {
    return '';
  }
}

function main() {
  const cwd = process.cwd();
  const statePath = path.join(cwd, '.flow', 'STATE.md');

  if (!fs.existsSync(statePath)) {
    // Flow not initialized here — exit silently
    process.exit(0);
  }

  const state = fs.readFileSync(statePath, 'utf-8');

  // Parse current phase line
  const currentMatch = state.match(/^## Current:\s*(.+)$/m);
  const current = currentMatch ? currentMatch[1] : 'unknown';

  // Count tasks
  const done = (state.match(/^- \[x\]/gm) || []).length;
  const total = (state.match(/^- \[[ x]\]/gm) || []).length;

  // Count vibed entries
  const vibeSection = state.match(/### Vibed\n([\s\S]*?)(?=\n###|\n## |$)/);
  const vibeEntries = vibeSection
    ? (vibeSection[1].match(/^- /gm) || []).length
    : 0;

  // Git info
  const branch = run('git rev-parse --abbrev-ref HEAD') || 'no-repo';
  const uncommitted = run('git status --porcelain').split('\n').filter(Boolean).length;
  const lastCommit = run("git log -1 --format='%ar'") || 'never';

  // Check for handoff
  const handoffMatch = state.match(/### Handoff\n([\s\S]*?)(?=\n### |\n## |$)/);

  if (handoffMatch) {
    const contextMatch = handoffMatch[1].match(/\*\*Context\*\*:\s*(.+)/);
    const context = contextMatch ? contextMatch[1] : 'see STATE.md';

    // Print handoff to stderr (visible to user, not captured as tool output)
    process.stderr.write(`\nResuming: ${context}\n`);

    // Remove handoff section from STATE.md
    const cleaned = state.replace(/\n### Handoff\n[\s\S]*?(?=\n### |\n## |$)/, '');
    fs.writeFileSync(statePath, cleaned);
  }

  // Print compact status to stderr
  const taskStr = total > 0 ? `${done}/${total} tasks` : 'no tasks';
  const vibeStr = vibeEntries > 0 ? ` | ${vibeEntries} vibed` : '';
  const dirtyStr = uncommitted > 0 ? ` | ${uncommitted} uncommitted` : '';

  process.stderr.write(
    `Flow: ${current} — ${taskStr}${vibeStr} — ${branch}${dirtyStr} — ${lastCommit}\n`
  );
}

main();
