---
name: desktop-pet
version: 0.1.0
description: Install, validate, list, and troubleshoot the bundled Q豆 code-slime desktop pet for Qoder. Use when the user asks to install or reinstall a Qoder desktop pet, verify a pet package, list installed pets, or replace the default pet with Q豆.
description_zh: 安装、校验、查看和排查内置的 Q豆·代码史莱姆 Qoder 桌宠。用户要求安装/重装桌宠、检查宠物包、列出已安装宠物或替换默认桌宠时使用。
user-invocable: true
argument-hint: install | verify | list | check
---

# Q豆 Desktop Pet

## Overview

This plugin bundles **Q豆 · 代码史莱姆**, a translucent mint-green code-slime companion
based on the project's concept design. The plugin installs the pet package into the
local Petdex-compatible directory that Qoder reads, then guides the user through
selecting it in Qoder.

The pet has nine animation states (`idle`, `running-right`, `running-left`, `waving`,
`jumping`, `failed`, `waiting`, `running`, `review`) and eight visual expressions
drawn from the design board.

## Bundled package

- Pet ID: `q-dou`
- Display name: `Q豆 · 代码史莱姆`
- Package: `assets/pet/q-dou/`
- Spritesheet: `assets/pet/q-dou/spritesheet.png`
- Format: 1536x1872, 8x9 grid, 192x208 per frame (v1)
- Install target: `~/.petdex/pets/q-dou/`

## Run the bundled tool

Resolve the plugin root from the loaded skill directory. When the Qoder runtime
exposes `QODER_PLUGIN_ROOT`, use it; otherwise the plugin root is two directories
above this `SKILL.md`.

```bash
node "${QODER_PLUGIN_ROOT}/scripts/pet-tool.cjs" <command>
```

Commands:

| Command | Purpose |
| --- | --- |
| `check` | Validate the bundled pet package without installing |
| `install` | Copy the bundled pet to `~/.petdex/pets/q-dou` |
| `install --force` | Replace an existing `q-dou` installation after explicit confirmation |
| `verify` | Validate the installed `q-dou` package |
| `list` | List Petdex-compatible pets under `~/.petdex/pets` |
| `help` | Show usage |

## Install workflow

1. Run `check` to confirm the bundled package is valid.
2. Run `install`.
3. If the tool exits with code 2 because `q-dou` already exists, stop and ask the
   user whether to replace it. Run `install --force` only after an explicit yes.
4. Run `verify`.
5. Tell the user to open Qoder's desktop-pet settings, refresh the list, and select
   `Q豆 · 代码史莱姆`. The plugin cannot select or switch the active pet for them.

## Verification contract

The tool accepts only:

- `pet.json` with non-empty `id`, `displayName`, `description`, and `spritesheetPath`;
- a PNG or WebP spritesheet of exactly 1536x1872 or 1536x2288;
- 192x208 frames, with 8 columns and 9 or 11 rows.

Report the exact path, pet name, and grid on success. If validation fails, report
the actual error and do not claim the pet is installed or ready.

## Safety boundaries

- Only write under `~/.petdex/pets/q-dou`.
- Never overwrite a different pet, and never delete user pets or unrelated files.
- Do not download assets or run third-party CLI packages for this bundled pet.
- Do not edit Qoder application settings to force a pet selection.
- Do not claim the default pet was replaced; selection happens in Qoder's UI.
- Keep the bundled artwork intact and do not copy assets from other Petdex pets.

## Troubleshooting

- **Pet does not appear:** confirm `~/.petdex/pets/q-dou/pet.json` and
  `spritesheet.png` exist, then refresh Qoder's desktop-pet list.
- **Installed package invalid:** run `verify`; reinstall with `install --force` after
  user confirmation.
- **Wrong sprite geometry:** regenerate the atlas as 1536x1872 with 192x208 frames.
- **Other pets listed:** `list` is read-only; do not modify them.
