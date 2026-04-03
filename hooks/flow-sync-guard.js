#!/usr/bin/env node

// Flow sync guard — fires before any Skill tool call.
// If the skill is flow:build, flow:review, flow:ship, or flow:pause
// and STATE.md mode is vibe, injects a warning to run /flow:sync first.

const fs = require('fs');
const path = require('path');

const SYNC_REQUIRED_BEFORE = new Set([
  'flow:build',
  'flow:review',
  'flow:ship',
  'flow:pause',
]);

function findStateFile(startDir) {
  let dir = startDir;
  while (true) {
    const candidate = path.join(dir, '.flow', 'STATE.md');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function parseMode(state) {
  const match = state.match(/^## Current:.*\((\w+) mode\)/m);
  return match ? match[1].toLowerCase() : null;
}

function main() {
  let input = '';
  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    let payload;
    try {
      payload = JSON.parse(input);
    } catch {
      process.exit(0);
    }

    const skill = payload?.tool_input?.skill || '';

    if (!SYNC_REQUIRED_BEFORE.has(skill)) process.exit(0);

    const statePath = findStateFile(process.cwd());
    if (!statePath) process.exit(0);

    const state = fs.readFileSync(statePath, 'utf-8');
    const mode = parseMode(state);

    if (mode !== 'vibe') process.exit(0);

    const out = {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        additionalContext: `Flow guardrail: you're still in vibe mode and about to run "${skill}". Run /flow:sync first to capture your vibe work into STATE.md before switching modes. Tell the user this before invoking the skill.`
      }
    };

    process.stdout.write(JSON.stringify(out));
    process.exit(0);
  });
}

main();
