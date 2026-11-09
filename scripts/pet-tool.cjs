#!/usr/bin/env node
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

const PLUGIN_ROOT = path.resolve(__dirname, "..");
const BUNDLED_DIR = path.join(PLUGIN_ROOT, "assets", "pet", "q-dou");
const PETS_DIR = path.join(os.homedir(), ".petdex", "pets");
const USAGE = `Q豆 desktop pet tool

Usage:
  node scripts/pet-tool.cjs check            Validate the bundled pet package
  node scripts/pet-tool.cjs install          Install Q豆 into ~/.petdex/pets/q-dou
  node scripts/pet-tool.cjs install --force  Replace an existing Q豆 installation
  node scripts/pet-tool.cjs verify           Validate the installed Q豆 package
  node scripts/pet-tool.cjs list             List installed Petdex-compatible pets
  node scripts/pet-tool.cjs help             Show this help
`;

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function readPngSize(buffer) {
  if (buffer.length < 24) return null;
  const signature = "89504e470d0a1a0a";
  if (buffer.subarray(0, 8).toString("hex") !== signature) return null;
  if (buffer.toString("ascii", 12, 16) !== "IHDR") return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    format: "png",
  };
}

function readWebpSize(buffer) {
  if (buffer.length < 30) return null;
  if (buffer.toString("ascii", 0, 4) !== "RIFF") return null;
  if (buffer.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
      format: "webp",
    };
  }
  if (chunk === "VP8L") {
    if (buffer[20] !== 0x2f) return null;
    const bits = buffer.readUInt32LE(21);
    return {
      width: 1 + (bits & 0x3fff),
      height: 1 + ((bits >> 14) & 0x3fff),
      format: "webp",
    };
  }
  if (chunk === "VP8 ") {
    if (buffer[23] !== 0x9d || buffer[24] !== 0x01 || buffer[25] !== 0x2a) return null;
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
      format: "webp",
    };
  }
  return null;
}

function imageSize(file) {
  const buffer = fs.readFileSync(file);
  const size = readPngSize(buffer) || readWebpSize(buffer);
  if (!size) fail(`unsupported or invalid spritesheet: ${file} (expected PNG or WebP)`);
  return size;
}

function normalizePet(raw, dir, label) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    fail(`${label}: pet.json must contain a JSON object`);
  }
  for (const field of ["id", "displayName", "description", "spritesheetPath"]) {
    if (typeof raw[field] !== "string" || raw[field].trim() === "") {
      fail(`${label}: pet.json is missing a non-empty "${field}"`);
    }
  }
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(raw.id)) {
    fail(`${label}: pet.json "id" must be lowercase kebab-case`);
  }
  if (path.basename(raw.spritesheetPath) !== raw.spritesheetPath) {
    fail(`${label}: spritesheetPath must be a plain file name`);
  }
  const spritePath = path.join(dir, raw.spritesheetPath);
  if (!fs.existsSync(spritePath) || !fs.statSync(spritePath).isFile()) {
    fail(`${label}: missing spritesheet ${spritePath}`);
  }
  const size = imageSize(spritePath);
  const isV1 = size.width === 1536 && size.height === 1872;
  const isV2 = size.width === 1536 && size.height === 2288;
  if (!isV1 && !isV2) {
    fail(
      `${label}: spritesheet is ${size.width}x${size.height}; expected 1536x1872 (8x9) or 1536x2288 (8x11)`
    );
  }
  if (size.width % 8 !== 0) fail(`${label}: spritesheet width must divide into 8 columns`);
  const rows = isV1 ? 9 : 11;
  if (size.height % rows !== 0) fail(`${label}: spritesheet height must divide into ${rows} rows`);
  if (size.width / 8 !== 192 || size.height / rows !== 208) {
    fail(`${label}: frame size must be 192x208`);
  }
  return {
    pet: raw,
    spritePath,
    size,
    grid: `${isV1 ? "8x9" : "8x11"} (${size.width}x${size.height}, 192x208 frames)`,
  };
}

function loadAndValidate(dir, label) {
  const petJson = path.join(dir, "pet.json");
  if (!fs.existsSync(petJson)) fail(`${label}: pet.json not found in ${dir}`);
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(petJson, "utf8"));
  } catch (error) {
    fail(`${label}: invalid pet.json (${error.message})`);
  }
  return normalizePet(raw, dir, label);
}

function checkBundled() {
  const result = loadAndValidate(BUNDLED_DIR, "bundled Q豆");
  console.log(`Bundled pet: ${result.pet.displayName} (${result.pet.id})`);
  console.log(`Path: ${BUNDLED_DIR}`);
  console.log(`Spritesheet: ${result.spritePath}`);
  console.log(`Grid: ${result.grid}`);
  console.log("Bundled package is valid.");
}

function install(force) {
  const result = loadAndValidate(BUNDLED_DIR, "bundled Q豆");
  const target = path.join(PETS_DIR, result.pet.id);
  if (fs.existsSync(target) && !force) {
    console.error(`Q豆 is already installed at ${target}`);
    console.error("Refusing to overwrite. Ask the user for confirmation, then run: install --force");
    process.exit(2);
  }
  fs.mkdirSync(PETS_DIR, { recursive: true });
  const tmp = path.join(PETS_DIR, `.${result.pet.id}.tmp-${process.pid}`);
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  try {
    fs.copyFileSync(path.join(BUNDLED_DIR, "pet.json"), path.join(tmp, "pet.json"));
    fs.copyFileSync(result.spritePath, path.join(tmp, result.pet.spritesheetPath));
    loadAndValidate(tmp, "staged Q豆");
    fs.rmSync(target, { recursive: true, force: true });
    fs.renameSync(tmp, target);
  } catch (error) {
    fs.rmSync(tmp, { recursive: true, force: true });
    fail(`install failed: ${error.message}`);
  }
  console.log(`Installed ${result.pet.displayName} (${result.pet.id})`);
  console.log(`Target: ${target}`);
  console.log(`Grid: ${result.grid}`);
  console.log("");
  console.log("Next steps:");
  console.log("1. Open Qoder desktop-pet settings.");
  console.log("2. Refresh the installed pet list.");
  console.log("3. Select \"Q豆 · 代码史莱姆\" to replace the default pet.");
}

function verify() {
  const target = path.join(PETS_DIR, "q-dou");
  const result = loadAndValidate(target, "installed Q豆");
  console.log(`Installed pet: ${result.pet.displayName} (${result.pet.id})`);
  console.log(`Path: ${target}`);
  console.log(`Spritesheet: ${result.spritePath}`);
  console.log(`Grid: ${result.grid}`);
  console.log("Installed package is valid.");
}

function listPets() {
  if (!fs.existsSync(PETS_DIR)) {
    console.log(`No pets directory found at ${PETS_DIR}`);
    return;
  }
  const entries = fs
    .readdirSync(PETS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .sort((a, b) => a.name.localeCompare(b.name));
  let count = 0;
  for (const entry of entries) {
    const dir = path.join(PETS_DIR, entry.name);
    const petJson = path.join(dir, "pet.json");
    if (!fs.existsSync(petJson)) continue;
    count += 1;
    try {
      const raw = JSON.parse(fs.readFileSync(petJson, "utf8"));
      const displayName = raw.displayName || entry.name;
      const sprite = typeof raw.spritesheetPath === "string" ? path.join(dir, raw.spritesheetPath) : "";
      const status = sprite && fs.existsSync(sprite) ? "ok" : "missing spritesheet";
      console.log(`- ${displayName} (${raw.id || entry.name}) [${status}] ${dir}`);
    } catch (error) {
      console.log(`- ${entry.name} [invalid pet.json: ${error.message}] ${dir}`);
    }
  }
  if (count === 0) console.log(`No Petdex-compatible pets found in ${PETS_DIR}`);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";
  const force = args.includes("--force");
  switch (command) {
    case "check":
      checkBundled();
      break;
    case "install":
      install(force);
      break;
    case "verify":
      verify();
      break;
    case "list":
      listPets();
      break;
    case "help":
    case "--help":
    case "-h":
      console.log(USAGE);
      break;
    default:
      console.error(`Unknown command: ${command}\n`);
      console.log(USAGE);
      process.exit(1);
  }
}

main();
