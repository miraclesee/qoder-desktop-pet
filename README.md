# Qoder Desktop Pet · Q豆

An unofficial Qoder plugin that installs **Q豆 · 代码史莱姆** (Q-Dou, the code slime)
as a desktop pet. Q豆 is a translucent mint-green companion with a Q-shaped antenna,
glowing eyes, and a calm coding-sidekick personality.

![Q豆 expression preview](assets/preview.png)

> This is a community project, not an official Qoder product. Qoder and its marks
> belong to their respective owners.

## What it does

- Installs a Petdex-compatible pet package into `~/.petdex/pets/q-dou/`.
- Ships nine animation states used by Qoder's pet renderer:
  `idle`, `running-right`, `running-left`, `waving`, `jumping`, `failed`,
  `waiting`, `running`, `review`.
- Provides a validation-first installer that refuses to overwrite an existing
  installation unless explicitly forced.
- Provides `/pet` commands for install, verify, list, and check.
- Works offline. No connector, MCP server, token, or third-party CLI is required.

## Requirements

- Qoder with desktop-pet support.
- Node.js 18+ (Qoder already includes a Node runtime).

## Install the plugin

From this directory:

```bash
qodercli plugin install --scope user /absolute/path/to/qoder-desktop-pet
```

Or add the directory through Qoder's plugin management UI, then enable
`qoder-desktop-pet@local`.

After enabling, the plugin contributes:

- Skill: `desktop-pet`
- Command: `/pet`

## Install Q豆

In a Qoder session:

```text
/pet install
```

Or run the bundled tool directly:

```bash
node scripts/pet-tool.cjs check
node scripts/pet-tool.cjs install
node scripts/pet-tool.cjs verify
```

The tool writes only:

```text
~/.petdex/pets/q-dou/
├── pet.json
└── spritesheet.png
```

### Replace the default pet

The plugin cannot change Qoder's active pet by itself. After installing:

1. Open Qoder's desktop-pet settings.
2. Refresh the installed pet list.
3. Select **Q豆 · 代码史莱姆**.

This replaces the default pet (including 达鸭) for the local user.

## Commands

| Command | Description |
| --- | --- |
| `/pet install` | Install the bundled Q豆 package |
| `/pet verify` | Validate the installed package and print its path/grid |
| `/pet list` | List Petdex-compatible pets found under `~/.petdex/pets` |
| `/pet check` | Validate the bundled package without installing |

If `q-dou` already exists, the installer stops and asks for confirmation. Re-run
with `install --force` only after you explicitly agree to replace it.

## Pet package format

Qoder reads the same sprite atlas shape used by Petdex:

- `pet.json`
  - `id`, `displayName`, `description`, `spritesheetPath`
- `spritesheet.png` or `spritesheet.webp`
  - v1: 1536x1872, 8x9 grid
  - v2: 1536x2288, 8x11 grid
  - frame size: 192x208

The bundled Q豆 atlas is v1 (8x9). Rows follow the standard state order:
`idle`, `running-right`, `running-left`, `waving`, `jumping`, `failed`,
`waiting`, `running`, `review`.

## Project structure

```text
qoder-desktop-pet/
├── .qoder-plugin/plugin.json
├── assets/
│   ├── logo.png
│   ├── preview.png
│   └── pet/q-dou/
│       ├── pet.json
│       └── spritesheet.png
├── commands/pet.md
├── scripts/pet-tool.cjs
├── skills/desktop-pet/SKILL.md
├── LICENSE
└── README.md
```

## Design provenance

Q豆 was created from the project author's concept board: a translucent code slime
with a Q-shaped antenna, mint-green and sky-blue palette, glowing eyes, and a set
of expressive poses. The bundled sprites were derived from that board and composed
into the Qoder/Petdex animation grid. No third-party character artwork is bundled.

## Validation

```bash
node scripts/pet-tool.cjs check
qodercli plugin validate .
```

`check` verifies the manifest-facing pet files, the spritesheet dimensions, and the
192x208 frame grid.

## License

Code and bundled Q豆 artwork are released under the MIT License. See `LICENSE`.
Publish or redistribute the artwork only if you hold the necessary rights.
