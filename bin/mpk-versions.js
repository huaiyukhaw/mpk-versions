#!/usr/bin/env node
/**
 * mpk-versions — List widget names and versions from Mendix .mpk files.
 *
 * Usage:
 *   npx mpk-versions [widgets_dir]
 *   npx mpk-versions widgets/               (relative to cwd)
 *   npx mpk-versions C:\MendixProjects\MyApp\widgets
 *
 * widgets_dir defaults to ~/widgets
 */

const fs   = require("fs");
const os   = require("os");
const path = require("path");
const AdmZip = require("adm-zip");
const { XMLParser } = require("fast-xml-parser");

// ── Resolve target directory ──────────────────────────────────────────────────

const widgetsDir = path.resolve(
  process.argv[2] ?? path.join(os.homedir(), "widgets")
);

if (!fs.existsSync(widgetsDir) || !fs.statSync(widgetsDir).isDirectory()) {
  console.error(`ERROR: Directory not found: ${widgetsDir}`);
  process.exit(1);
}

// ── Scan .mpk files ───────────────────────────────────────────────────────────

const mpkFiles = fs
  .readdirSync(widgetsDir)
  .filter((f) => f.toLowerCase().endsWith(".mpk"))
  .sort();

if (mpkFiles.length === 0) {
  console.log(`No .mpk files found in: ${widgetsDir}`);
  process.exit(0);
}

// ── Parse each widget ─────────────────────────────────────────────────────────

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

const results = mpkFiles.map((file) => {
  const filePath = path.join(widgetsDir, file);
  const stem = path.basename(file, ".mpk");
  try {
    const zip   = new AdmZip(filePath);
    const entry = zip.getEntry("package.xml");
    if (!entry) return { file, name: stem, version: "? (no package.xml)" };

    const parsed       = parser.parse(entry.getData().toString("utf-8"));
    const clientModule = parsed?.package?.clientModule;
    const name         = clientModule?.["@_name"]    ?? stem;
    const version      = clientModule?.["@_version"] ?? "?";
    return { file, name, version };
  } catch (err) {
    return { file, name: stem, version: `ERROR: ${err.message}` };
  }
});

results.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

// ── Render table ──────────────────────────────────────────────────────────────

const pad = (str, len) => str.padEnd(len);
const colName = Math.max("Widget Name".length, ...results.map((r) => r.name.length));
const colVer  = Math.max("Version".length,     ...results.map((r) => r.version.length));
const colFile = Math.max("File".length,         ...results.map((r) => r.file.length));

const header  = `${pad("Widget Name", colName)}  ${pad("Version", colVer)}  ${pad("File", colFile)}`;
const divider = "-".repeat(header.length);

console.log(`\nScanning: ${widgetsDir}`);
console.log(`Found ${results.length} widget(s)\n`);
console.log(header);
console.log(divider);
for (const { file, name, version } of results) {
  console.log(`${pad(name, colName)}  ${pad(version, colVer)}  ${file}`);
}
console.log();
