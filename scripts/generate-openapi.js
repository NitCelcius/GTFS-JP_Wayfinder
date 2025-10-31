import { execSync, spawnSync } from "child_process";
import { resolve, join, dirname } from "path";
import { existsSync, writeFileSync } from "fs";
import { createClient } from "@hey-api/openapi-ts";
import config, { baseConfig } from "../web/openapi-ts.config.ts";

try {
  const repoRoot = resolve(dirname("."), ".");

  const apiDir = join(repoRoot, "api");
  const webDir = join(repoRoot, "web");
  if (!existsSync(apiDir) || !existsSync(webDir)) {
    throw new Error(
      "You must run this script from root directory of this repo. Try changing working dir to where api/ and web/ directory exists.",
    );
  }
  const py = `import json; from src.gtfs_jp_wayfinder.main import app; print(json.dumps(app.openapi()))
  `;

  const res = spawnSync("uv", ["run", "python", "-c", py], {
    cwd: apiDir,
    encoding: "utf8",
  });
  if (res.error) {
    throw res.error;
  }
  if (res.status !== 0) {
    console.error("uv/python exited with non-zero status", res.status);
    console.error("stderr:", res.stderr);
    throw new Error("uv python command failed");
  }

  const openapiJson = (res.stdout || "").trim();
  if (!openapiJson) {
    console.error("No output from uv/python command. stderr:", res.stderr);
    throw new Error("OpenAPI JSON generation produced no output");
  }

  const outPath = join(webDir, "openapi.json");
  writeFileSync(outPath, openapiJson, { encoding: "utf8" });
  console.log(`Wrote OpenAPI JSON to ${outPath}`);

  process.chdir(webDir);
  const resolvedInput = resolve(webDir, baseConfig.input);
  const resolvedOutput = resolve(webDir, baseConfig.output);
  console.log(`Generating schema`);
  console.log(`Input: ${resolvedInput}`);
  console.log(`Output: ${resolvedOutput}`);

  if (!existsSync(resolvedInput)) {
    throw new Error(`OpenAPI input file not found: ${resolvedInput}`);
  }

  createClient(config)
    .then(() => {
      process.exit(0);
    })
    .catch((e) => {
      console.error("createClient failed:", e && e.message ? e.message : e);
      process.exit(2);
    });
} catch (err) {
  console.error(err && err.message ? err.message : err);
  process.exit(2);
}
