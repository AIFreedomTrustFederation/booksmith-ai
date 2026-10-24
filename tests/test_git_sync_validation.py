"""Regression tests for the manual sync validation gate, using disposable Git remotes."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts/git-sync-rebase-push.sh"


def run(*args, cwd=None, env=None, check=True):
    p = subprocess.run(args, cwd=cwd, env=env, text=True,
                       stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    if check and p.returncode:
        raise AssertionError(f"{args}: {p.returncode}\n{p.stdout}")
    return p


class SyncValidationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        root = Path(self.tmp.name)
        self.origin = root / "origin.git"
        seed = root / "seed"
        self.work = root / "work"
        run("git", "init", "--bare", "--initial-branch=main", str(self.origin))
        run("git", "init", "--initial-branch=main", str(seed))
        run("git", "config", "user.name", "Test", cwd=seed)
        run("git", "config", "user.email", "test@example.invalid", cwd=seed)
        (seed / "file.txt").write_text("baseline\n")
        run("git", "add", "file.txt", cwd=seed)
        run("git", "commit", "-m", "baseline", cwd=seed)
        run("git", "remote", "add", "origin", str(self.origin), cwd=seed)
        run("git", "push", "-u", "origin", "main", cwd=seed)
        run("git", "clone", str(self.origin), str(self.work))
        run("git", "config", "user.name", "Test", cwd=self.work)
        run("git", "config", "user.email", "test@example.invalid", cwd=self.work)
        (self.work / "file.txt").write_text("new local work\n")
        run("git", "add", "file.txt", cwd=self.work)
        run("git", "commit", "-m", "unpublished change", cwd=self.work)
        self.before = self.remote_head()
        self.local_head = run("git", "rev-parse", "HEAD", cwd=self.work).stdout.strip()
        self.bin = root / "bin"
        self.bin.mkdir()
        npm = self.bin / "npm"
        npm.write_text("#!/bin/sh\nprintf '%s\\n' \"$*\" >> \"$MOCK_NPM_LOG\"\n"
                       "if [ \"$2\" = \"$MOCK_NPM_FAIL\" ]; then exit 42; fi\nexit 0\n")
        npm.chmod(0o755)
        self.log = root / "npm.log"

    def remote_head(self):
        return run("git", "--git-dir", str(self.origin),
                   "rev-parse", "refs/heads/main").stdout.strip()

    def sync(self, failure=""):
        env = dict(os.environ, PATH=f"{self.bin}:{os.environ['PATH']}",
                   MOCK_NPM_LOG=str(self.log), MOCK_NPM_FAIL=failure)
        return run("bash", str(SCRIPT), cwd=self.work, env=env, check=False)

    def assert_failed_validation_blocks_publication(self, command):
        result = self.sync(command)
        self.assertNotEqual(result.returncode, 0, result.stdout)
        self.assertEqual(self.remote_head(), self.before,
                         f"validation {command} failed but main was published")
        self.assertNotIn("Push complete.", result.stdout)

    def test_library_validation_failure(self):
        self.assert_failed_validation_blocks_publication("validate:library")

    def test_proof_validation_failure(self):
        self.assert_failed_validation_blocks_publication("proof:v2:fhqcm")

    def test_json_validation_failure(self):
        self.assert_failed_validation_blocks_publication("json:validate")

    def test_successful_validation_publishes_commit(self):
        result = self.sync()
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertEqual(self.remote_head(), self.local_head)
        self.assertEqual(self.log.read_text().splitlines(),
                         ["run validate:library", "run proof:v2:fhqcm",
                          "run json:validate"])


if __name__ == "__main__":
    unittest.main()
