// PostToolUse hook: after Claude edits a JS file, auto-fix it with ESLint and
// report anything that can't be fixed back to Claude (exit code 2 + stderr).
const { spawnSync } = require('node:child_process');
const path = require('node:path');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let file;
  try {
    file = JSON.parse(input).tool_input.file_path;
  } catch {
    process.exit(0);
  }

  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const rel = file ? path.relative(root, file) : '';
  const lintable = /^(server\.js|(routes|db|tests)\/.*\.js)$/.test(rel);
  if (!lintable) process.exit(0);

  const result = spawnSync('npx', ['eslint', '--fix', rel], {
    cwd: root,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    console.error(`ESLint found problems in ${rel}:\n${result.stdout}${result.stderr}`);
    process.exit(2);
  }
  console.log(`ESLint auto-fix ran on ${rel}`);
});
