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


test('manuscript read rejects a chapter symlink outside the selected book', (t) => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'booksmith-read-boundary-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'booksmith-private-'));
  t.after(() => { fs.rmSync(cwd, { recursive: true, force: true }); fs.rmSync(outside, { recursive: true, force: true }); });
  const chapters = path.join(cwd, 'books/demo/manuscript/chapters');
  fs.mkdirSync(chapters, { recursive: true });
  fs.writeFileSync(path.join(outside, 'intro.md'), 'Private content outside the book\\n');
  fs.symlinkSync(path.join(outside, 'intro.md'), path.join(chapters, 'intro.md'));
  const code = 'import { readManuscript } from ' + JSON.stringify(source)
    + '; await readManuscript("demo", "intro");';
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', code], {
    cwd, encoding: 'utf8', timeout: 10000,
  });
  assert.notEqual(result.status, 0, 'external symlink must not be readable');
  assert.match(result.stderr, /escapes the selected book/i);
});

test('manuscript save rejects a chapters-directory symlink outside the selected book', (t) => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'booksmith-save-boundary-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'booksmith-private-'));
  t.after(() => { fs.rmSync(cwd, { recursive: true, force: true }); fs.rmSync(outside, { recursive: true, force: true }); });
  const manuscript = path.join(cwd, 'books/demo/manuscript');
  fs.mkdirSync(manuscript, { recursive: true });
  fs.symlinkSync(outside, path.join(manuscript, 'chapters'), 'dir');
  const code = 'import { readManuscript, saveManuscript } from ' + JSON.stringify(source)
    + '; const current = await readManuscript("demo", "intro");'
    + ' await saveManuscript({ bookSlug: "demo", chapterSlug: "intro", draft: "New canon", expectedHash: current.hash });';
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', code], {
    cwd, encoding: 'utf8', timeout: 10000,
  });
  assert.notEqual(result.status, 0, 'external symlink must not be writable');
  assert.match(result.stderr, /escapes the selected book/i);
  assert.equal(fs.existsSync(path.join(outside, 'intro.md')), false);
});

test('in-book symlink to a chapters directory remains readable', (t) => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'booksmith-local-symlink-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const manuscript = path.join(cwd, 'books/demo/manuscript');
  const actual = path.join(manuscript, 'actual-chapters');
  fs.mkdirSync(actual, { recursive: true });
  fs.writeFileSync(path.join(actual, 'intro.md'), 'Approved canon');
  fs.symlinkSync(actual, path.join(manuscript, 'chapters'), 'dir');
  const code = 'import { readManuscript } from ' + JSON.stringify(source)
    + '; console.log((await readManuscript("demo", "intro")).text);';
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', code], {
    cwd, encoding: 'utf8', timeout: 10000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), 'Approved canon');
});
