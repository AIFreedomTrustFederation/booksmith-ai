"""Regression tests for the FHQCM PDF export success contract.

No TeX installation or network access is required; a fake engine reports success
without producing output to reproduce the original false-positive.
"""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "build-fhqcm-export.sh"


class PdfExportFreshnessTests(unittest.TestCase):
    def run_export(self, mode: str, stale: bytes | None = None):
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            latex = root / "books" / "fhqcm" / "exports" / "latex"
            pdf = root / "books" / "fhqcm" / "exports" / "pdf"
            bin_dir = root / "bin"
            latex.mkdir(parents=True)
            pdf.mkdir(parents=True)
            bin_dir.mkdir()
            (latex / "main.tex").write_text("test fixture", encoding="utf-8")
            if stale is not None:
                (pdf / "main.pdf").write_bytes(stale)
                os.utime(pdf / "main.pdf", (1_600_000_000, 1_600_000_000))
            engine = bin_dir / "tectonic"
            engine.write_text(
                "#!/usr/bin/env bash\n"
                "set -eu\n"
                "[ \"$1\" = --outdir ]\n"
                "out=$2\n"
                "case \"$FAKE_TEX_MODE\" in\n"
                "  no_output) exit 0 ;;\n"
                "  empty) : > \"$out/main.pdf\" ;;\n"
                "  pdf) printf '%%PDF-1.4\\nnew proof\\n' > \"$out/main.pdf\" ;;\n"
                "  fail) exit 42 ;;\n"
                "esac\n",
                encoding="utf-8",
            )
            engine.chmod(0o755)
            env = os.environ.copy()
            env["PATH"] = str(bin_dir) + os.pathsep + env.get("PATH", "")
            env["FAKE_TEX_MODE"] = mode
            completed = subprocess.run(
                ["bash", str(SCRIPT), "fhqcm"],
                cwd=root, env=env, capture_output=True, text=True, timeout=20,
            )
            content = (pdf / "main.pdf").read_bytes() if (pdf / "main.pdf").exists() else None
            return completed, content

    def test_no_output_must_fail_even_if_engine_succeeds(self):
        result, pdf = self.run_export("no_output")
        self.assertNotEqual(result.returncode, 0, result.stdout)
        self.assertIsNone(pdf)

    def test_stale_pdf_must_not_count_as_new_build(self):
        old = b"%PDF-1.4\nold proof\n"
        result, pdf = self.run_export("no_output", stale=old)
        self.assertNotEqual(result.returncode, 0, result.stdout)
        self.assertEqual(pdf, old)

    def test_empty_pdf_must_fail(self):
        result, pdf = self.run_export("empty")
        self.assertNotEqual(result.returncode, 0, result.stdout)
        self.assertEqual(pdf, b"")

    def test_new_pdf_succeeds(self):
        result, pdf = self.run_export("pdf")
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
        self.assertTrue(pdf and pdf.startswith(b"%PDF-"))

    def test_engine_failure_remains_failure(self):
        result, _ = self.run_export("fail")
        self.assertNotEqual(result.returncode, 0, result.stdout)


if __name__ == "__main__":
    unittest.main()
