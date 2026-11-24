import { spawn } from "node:child_process";

const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function waitForServer(url, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      // keep polling
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

async function main() {
  const server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(PORT), "-H", "127.0.0.1"],
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env },
    }
  );

  server.stderr?.on("data", (d) => process.stderr.write(d));

  let exitCode = 1;
  try {
    await waitForServer(BASE_URL);

    exitCode = await new Promise((resolve) => {
      const pw = spawn(
        process.execPath,
        ["node_modules/@playwright/test/cli.js", "test", ...process.argv.slice(2)],
        {
          stdio: "inherit",
          env: { ...process.env, PW_EXTERNAL_SERVER: "1" },
        }
      );
      pw.on("exit", (code) => resolve(code ?? 1));
    });
  } finally {
    try {
      server.kill("SIGKILL");
    } catch {
      // ignore
    }
  }

  process.exit(exitCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
