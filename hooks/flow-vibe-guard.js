#!/usr/bin/env node

// Flow vibe guard — fires before any Skill tool call.
// If the skill is not a flow: skill and STATE.md mode is build or plan,
// injects a warning prompting the user to activate /flow:vibe first.

const fs = require('fs');
const path = require('path');

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

    // Only guard non-flow skills
    if (!skill || skill.startsWith('flow:') || skill.startsWith('gsd:')) {
      process.exit(0);
    }

    const statePath = findStateFile(process.cwd());
    if (!statePath) process.exit(0);

    const state = fs.readFileSync(statePath, 'utf-8');
    const mode = parseMode(state);

    if (mode !== 'build' && mode !== 'plan') process.exit(0);

    const out = {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        additionalContext: `Flow guardrail: you're in ${mode} mode and about to run a non-Flow skill ("${skill}"). If this work is off-plan, activate /flow:vibe first so it gets tracked. Tell the user this before invoking the skill.`
      }
    };

    process.stdout.write(JSON.stringify(out));
    process.exit(0);
  });
}

main();
