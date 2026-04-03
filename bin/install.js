#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const COMMANDS_DEST = path.join(CLAUDE_DIR, 'commands', 'flow');
const FLOW_DEST = path.join(CLAUDE_DIR, 'flow');
const HOOKS_DEST = CLAUDE_DIR;
const SETTINGS_PATH = path.join(CLAUDE_DIR, 'settings.json');

const PKG_ROOT = path.resolve(__dirname, '..');
const COMMANDS_SRC = path.join(PKG_ROOT, 'commands', 'flow');
const FLOW_SRC = path.join(PKG_ROOT, 'flow');
const HOOK_SRC = path.join(PKG_ROOT, 'hooks', 'flow-startup.js');
const VIBE_GUARD_SRC = path.join(PKG_ROOT, 'hooks', 'flow-vibe-guard.js');
const SYNC_GUARD_SRC = path.join(PKG_ROOT, 'hooks', 'flow-sync-guard.js');

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

function log(msg) { console.log(msg); }
function success(msg) { log(`${GREEN}${BOLD}  [ok]${RESET} ${msg}`); }
function warn(msg) { log(`${YELLOW}  [!!]${RESET} ${msg}`); }
function info(msg) { log(`${DIM}       ${msg}${RESET}`); }

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function countFiles(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

function registerHook(settingsPath) {
  let settings = {};
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  } catch {}

  if (!settings.hooks) settings.hooks = {};
  if (!settings.hooks.PreToolUse) settings.hooks.PreToolUse = [];

  const startupEntry = {
    matcher: 'Bash',
    hooks: [{
      type: 'command',
      command: `node ${path.join(HOOKS_DEST, 'hooks', 'flow-startup.js')}`,
      run_on: 'first_call_only'
    }]
  };

  const vibeGuardEntry = {
    matcher: 'Skill',
    hooks: [{
      type: 'command',
      command: `node ${path.join(HOOKS_DEST, 'hooks', 'flow-vibe-guard.js')}`
    }]
  };

  const syncGuardEntry = {
    matcher: 'Skill',
    hooks: [{
      type: 'command',
      command: `node ${path.join(HOOKS_DEST, 'hooks', 'flow-sync-guard.js')}`
    }]
  };

  const hasStartup = settings.hooks.PreToolUse.find(
    h => h.hooks?.some(hh => hh.command?.includes('flow-startup.js'))
  );
  const hasVibeGuard = settings.hooks.PreToolUse.find(
    h => h.hooks?.some(hh => hh.command?.includes('flow-vibe-guard.js'))
  );
  const hasSyncGuard = settings.hooks.PreToolUse.find(
    h => h.hooks?.some(hh => hh.command?.includes('flow-sync-guard.js'))
  );

  let added = false;
  if (!hasStartup) { settings.hooks.PreToolUse.push(startupEntry); added = true; }
  if (!hasVibeGuard) { settings.hooks.PreToolUse.push(vibeGuardEntry); added = true; }
  if (!hasSyncGuard) { settings.hooks.PreToolUse.push(syncGuardEntry); added = true; }

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  return added;
}

function getVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf-8'));
    return pkg.version;
  } catch {
    return '?.?.?';
  }
}

function isUpdate() {
  return fs.existsSync(COMMANDS_DEST) || fs.existsSync(FLOW_DEST);
}

function uninstall() {
  let removed = 0;
  if (fs.existsSync(COMMANDS_DEST)) {
    fs.rmSync(COMMANDS_DEST, { recursive: true });
    removed++;
  }
  if (fs.existsSync(FLOW_DEST)) {
    fs.rmSync(FLOW_DEST, { recursive: true });
    removed++;
  }

  const hooksDir = path.join(HOOKS_DEST, 'hooks');
  for (const hookFile of ['flow-startup.js', 'flow-vibe-guard.js', 'flow-sync-guard.js']) {
    const p = path.join(hooksDir, hookFile);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      removed++;
    }
  }

  // Remove hooks from settings
  try {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
    if (settings.hooks?.PreToolUse) {
      settings.hooks.PreToolUse = settings.hooks.PreToolUse.filter(
        h => !h.hooks?.some(hh =>
          hh.command?.includes('flow-startup.js') ||
          hh.command?.includes('flow-vibe-guard.js') ||
          hh.command?.includes('flow-sync-guard.js')
        )
      );
      if (settings.hooks.PreToolUse.length === 0) delete settings.hooks.PreToolUse;
      if (Object.keys(settings.hooks).length === 0) delete settings.hooks;
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
    }
  } catch {}

  return removed;
}

// --- Main ---

const args = process.argv.slice(2);

if (args.includes('--uninstall')) {
  log('');
  log(`${BOLD}  Flow — Uninstall${RESET}`);
  log('');
  const removed = uninstall();
  if (removed > 0) {
    success('Flow removed from ~/.claude/');
  } else {
    info('Flow was not installed.');
  }
  log('');
  process.exit(0);
}

const updating = isUpdate();
const version = getVersion();

log('');
log(`${BOLD}  Flow v${version}${RESET} ${DIM}— git-native development workflow${RESET}`);
log('');

// 1. Commands
copyDirSync(COMMANDS_SRC, COMMANDS_DEST);
const cmdCount = fs.readdirSync(COMMANDS_DEST).filter(f => f.endsWith('.md')).length;
success(`${cmdCount} commands → ~/.claude/commands/flow/`);

// 2. Workflows, references, templates
copyDirSync(FLOW_SRC, FLOW_DEST);
const flowCount = countFiles(FLOW_DEST);
success(`${flowCount} workflow files → ~/.claude/flow/`);

// 3. Hook
const hooksDestDir = path.join(HOOKS_DEST, 'hooks');
fs.mkdirSync(hooksDestDir, { recursive: true });
fs.copyFileSync(HOOK_SRC, path.join(hooksDestDir, 'flow-startup.js'));
fs.copyFileSync(VIBE_GUARD_SRC, path.join(hooksDestDir, 'flow-vibe-guard.js'));
fs.copyFileSync(SYNC_GUARD_SRC, path.join(hooksDestDir, 'flow-sync-guard.js'));
success('Hooks → ~/.claude/hooks/ (startup, vibe-guard, sync-guard)');

// 4. Register hook in settings
const hookRegistered = registerHook(SETTINGS_PATH);
if (hookRegistered) {
  success('Hook registered in ~/.claude/settings.json');
} else {
  info('Hook already registered in settings.json');
}

log('');
if (updating) {
  log(`${GREEN}${BOLD}  Updated!${RESET} Flow v${version} is ready.`);
} else {
  log(`${GREEN}${BOLD}  Installed!${RESET} Flow v${version} is ready.`);
}
log('');
log(`${CYAN}  Quick start:${RESET}`);
log(`    /flow:start     ${DIM}— initialize Flow in any project${RESET}`);
log(`    /flow:status    ${DIM}— see where you are${RESET}`);
log(`    /flow:vibe      ${DIM}— just start building${RESET}`);
log('');
log(`${DIM}  All commands: /flow:help or see README${RESET}`);
log(`${DIM}  Uninstall:    npx flow-dev --uninstall${RESET}`);
log('');
