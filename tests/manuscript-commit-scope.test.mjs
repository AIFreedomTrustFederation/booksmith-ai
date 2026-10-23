import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const source = new URL('../scripts/runtime/manuscript-store.mjs', import.meta.url).href;
const chapter = 'books/demo/manuscript/chapters/intro.md';
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

for (const newChapter of [false, true]) {
  test(newChapter ? 'new chapter commit preserves unrelated staging' : 'existing chapter commit preserves unrelated staging', (t) => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'booksmith-commit-'));
    t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
    fs.mkdirSync(path.join(cwd, path.dirname(chapter)), { recursive: true });
    fs.writeFileSync(path.join(cwd, chapter), 'Original chapter\n');
    fs.writeFileSync(path.join(cwd, 'unrelated.txt'), 'Original unrelated\n');
    git(cwd, 'init', '-q');
    git(cwd, 'config', 'user.name', 'Booksmith Test');
    git(cwd, 'config', 'user.email', 'booksmith-test@example.invalid');
    git(cwd, 'add', '.');
    git(cwd, 'commit', '-qm', 'Initial fixture');
    fs.writeFileSync(path.join(cwd, 'unrelated.txt'), 'Staged unrelated edit\n');
    git(cwd, 'add', 'unrelated.txt');

    const slug = newChapter ? 'new-chapter' : 'intro';
    const expected = 'books/demo/manuscript/chapters/' + slug + '.md';
    const code = 'import { readManuscript, saveManuscript } from ' + JSON.stringify(source) + ';\n'
      + 'const current = await readManuscript("demo", ' + JSON.stringify(slug) + ');\n'
      + 'const result = await saveManuscript({ bookSlug: "demo", chapterSlug: ' + JSON.stringify(slug)
      + ', draft: "Approved revision\\n", expectedHash: current.hash, commit: true });\n'
      + 'console.log(JSON.stringify(result));\n';
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', code], {
      cwd, encoding: 'utf8', timeout: 10000,
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout.trim()).git.committed, true);
    assert.equal(git(cwd, 'diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD'), expected);
    assert.equal(git(cwd, 'diff', '--cached', '--name-only'), 'unrelated.txt');
    assert.equal(git(cwd, 'show', 'HEAD:unrelated.txt'), 'Original unrelated');
  });
}
