---
description: Install, verify, or list the bundled Q豆 desktop pet
description_zh: 安装、校验或查看内置 Q豆 桌宠
argument-hint: install | verify | list | check
---

# Q豆 Desktop Pet

Use the `desktop-pet` Skill in this plugin. If it is not loaded, read
`${QODER_PLUGIN_ROOT}/skills/desktop-pet/SKILL.md` first.

User input: $ARGUMENTS

Routing:

- `install` or no args with no installed pet: run
  `node "${QODER_PLUGIN_ROOT}/scripts/pet-tool.cjs" install`.
- `verify`: run `verify` and report the installed path and grid.
- `list`: run `list` and show the result.
- `check`: run `check`.
- Unknown input: run `help` and ask which action the user wants.

Rules:

- Never treat this command as authorization to overwrite an existing `q-dou`
  installation. If the tool exits with code 2, ask for explicit confirmation, then
  use `install --force`.
- Do not edit Qoder settings or claim that the active pet was switched. After a
  successful install, tell the user to refresh and select `Q豆 · 代码史莱姆` in
  Qoder's desktop-pet settings.
