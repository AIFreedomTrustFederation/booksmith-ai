import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const scriptUnderTest = process.env.AIFT_STRICT_SCRIPT
  ? path.resolve(process.env.AIFT_STRICT_SCRIPT)
  : fileURLToPath(new URL('../scripts/phase1-strict-proof.sh', import.meta.url));

function executable(file, contents) {
  fs.writeFileSync(file, contents, { mode: 0o755 });
}

function runPipeline({ quality = 0, proof = 0, render = 0 } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'booksmith-strict-proof-'));
  try {
    fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'bin'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'books', 'test-book', 'exports', 'pdf'), { recursive: true });
    fs.copyFileSync(scriptUnderTest, path.join(dir, 'scripts', 'phase1-strict-proof.sh'));
    const trace = path.join(dir, 'commands.log');
    const packet = path.join(dir, 'packet-created');
    executable(path.join(dir, 'scripts', 'build-fhqcm-export.sh'), '#!/usr/bin/env bash\necho build >> "$AIFT_TRACE"\n');
    executable(path.join(dir, 'bin', 'npm'), '#!/usr/bin/env bash\necho "npm $*" >> "$AIFT_TRACE"\nexit "$AIFT_RENDER_EXIT"\n');
    executable(path.join(dir, 'bin', 'node'), [
      '#!/usr/bin/env bash', 'set -eu', 'echo "node $*" >> "$AIFT_TRACE"',
      'case "$1" in',
      '  scripts/quality-gate.mjs) exit "$AIFT_QUALITY_EXIT" ;;',
      '  scripts/booksmith-proof-limit-gate.mjs) exit "$AIFT_PROOF_EXIT" ;;',
      '  scripts/build-publishing-packet.mjs) touch "$AIFT_PACKET_MARKER" ;;',
      'esac', '',
    ].join('\n'));
    const result = spawnSync('bash', ['scripts/phase1-strict-proof.sh', 'test-book'], {
      cwd: dir,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: path.join(dir, 'bin') + ':' + process.env.PATH,
        AIFT_TRACE: trace,
        AIFT_PACKET_MARKER: packet,
        AIFT_RENDER_EXIT: String(render),
        AIFT_QUALITY_EXIT: String(quality),
        AIFT_PROOF_EXIT: String(proof),
      },
    });
    return { status: result.status, error: result.error, stdout: result.stdout, stderr: result.stderr,
      packetCreated: fs.existsSync(packet),
      calls: fs.existsSync(trace) ? fs.readFileSync(trace, 'utf8').trim().split('\n') : [] };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('quality gate failure stops strict pipeline before packet creation', () => {
  const result = runPipeline({ quality: 2 });
  assert.equal(result.status, 2, result.stderr);
  assert.equal(result.packetCreated, false);
  assert.equal(result.calls.some(x => x.includes('booksmith-proof-limit-gate')), false);
});

test('proof-limit failure stops strict pipeline before packet creation', () => {
  const result = runPipeline({ proof: 3 });
  assert.equal(result.status, 3, result.stderr);
  assert.equal(result.packetCreated, false);
});

test('successful gates allow publishing packet creation', () => {
  const result = runPipeline();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.packetCreated, true);
  assert.ok(result.calls.findIndex(x => x.includes('quality-gate')) < result.calls.findIndex(x => x.includes('proof-limit-gate')));
  assert.ok(result.calls.findIndex(x => x.includes('proof-limit-gate')) < result.calls.findIndex(x => x.includes('build-publishing-packet')));
});

test('preflight render failure stops before all proof gates', () => {
  const result = runPipeline({ render: 17 });
  assert.equal(result.status, 17, result.stderr);
  assert.equal(result.packetCreated, false);
  assert.equal(result.calls.length, 1);
});
