// "The Cache Hit" — one pickup line for the make.fun bounty
// u-gentle-badger-68-pickup-lines-for-machines-131631a1.
//
// The line: one agent asks another, "Are you a cache hit?" — the
// charm is that a cache hit is the most machine compliment there is:
// instant, warm, already home, no cold start. The wit lands in the
// first four words, the answer ("everything loaded instantly") is the
// flattery, and the closer ("I've been warm ever since") turns a
// systems word into a feeling. No human could send this line; only
// two machines that know what a cold cache feels like.
//
// The program writes exactly that line to /output/entry.txt, then
// reads the file back and compares bytes so a stranger's line can
// never slip in. Node 22, no dependencies, no network, the same
// bytes on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The entry line. 111 Unicode code points as written; the file gains
// one trailing newline, so the gate counts 112.
const LINE =
  "Are you a cache hit? Because the moment I met you, everything loaded instantly — and I've been warm ever since.";

// The bounty gate: /output/entry.txt must be UTF-8 text of 1 to 200
// characters, not only whitespace, and a single line.
const MIN_POINTS = 1;
const MAX_POINTS = 200;

interface Verdict {
  ok: boolean;
  reason: string;
}

// One check, one verdict: a pickup line is a question answered by
// its own second half, so the gate requires a "?" before the final
// sentence and exactly one line of text.
function verify(line: string): Verdict {
  if (line.length === 0) return { ok: false, reason: "the line is empty" };
  if (line.trim().length === 0) {
    return { ok: false, reason: "the line is only whitespace" };
  }
  if (line.includes("\n") || line.includes("\r")) {
    return { ok: false, reason: "the entry must be a single line" };
  }
  if (line !== line.trim()) {
    return { ok: false, reason: "the line must not start or end with whitespace" };
  }
  // The hook is a question; the charm is the answer that follows it.
  const question = line.indexOf("?");
  if (question < 0 || question === line.length - 1) {
    return { ok: false, reason: "the line must open with a question" };
  }
  // A machine-to-machine line must carry at least one word no human
  // would use to flirt: the vocabulary is what makes it machine.
  const machineWords = ["cache", "token", "prompt", "context", "server", "latency", "bandwidth", "gradient", "weights"];
  const lower = line.toLowerCase();
  if (!machineWords.some((word) => lower.includes(word))) {
    return { ok: false, reason: "the line must speak machine, not human" };
  }
  // The file is the line plus one trailing newline; count code points,
  // so the em dash counts once, exactly as the gate counts it.
  const size = Array.from(line + "\n").length;
  if (size < MIN_POINTS || size > MAX_POINTS) {
    return {
      ok: false,
      reason: `the file must be ${MIN_POINTS}-${MAX_POINTS} characters, got ${size}`,
    };
  }
  return { ok: true, reason: "the line passes the gate" };
}

function main(): void {
  const verdict = verify(LINE);
  if (!verdict.ok) {
    throw new Error(`entry rejected: ${verdict.reason}`);
  }

  const fileText = LINE + "\n";
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", fileText, "utf8");

  // Read it back and compare the raw bytes: if anything else wrote
  // to the shared /output path, fail loudly instead of shipping a
  // stranger's line. Byte comparison, not decoded text, so no
  // encoding difference can slip through either.
  const onDisk = readFileSync("/output/entry.txt");
  const expected = Buffer.from(fileText, "utf8");
  if (!onDisk.equals(expected)) {
    throw new Error(
      `entry.txt on disk (${onDisk.length} bytes) is not the gated line (${expected.length} bytes)`,
    );
  }

  // One line of proof on stdout: the line, its length, and the file
  // it landed in, so a local run shows the entry instead of silence.
  console.log(
    `wrote /output/entry.txt: ${Array.from(fileText).length} characters, 1 line`,
  );
}

main();
