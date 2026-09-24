# Aurora

A dreamy third-person space-maze game. Guide a small astronaut across floating crystal islands beneath the northern lights. In each level you collect three star shards to wake the portal, dodge drones, lasers, spike traps and crumbling tiles, and hunt for hidden relics.

## Play

Play it free in your browser, exclusively on **[Unpaused](https://unpaused.online/aurora/)**, or download **Aurora-Setup.exe** from [Releases](../../releases) and run it. It installs Aurora with a desktop shortcut, and running a newer one updates your game in place.

> Windows may show "Windows protected your PC" because the game isn't code-signed. Click **More info → Run anyway**.

## Features

- Chapter 1: 7 levels: The Drift, Nebula Gardens, The Core, Shattered Halo, Laser Garden, Aurora's Heart and **Level Impossible**
- Chapter 2 demo (1.7): **Whispering Grove**, a jungle island with insects that hunt you
- Hazards: patrol drones, rotating lasers, spike traps, crumbling tiles, moving platforms and bounce pads
- Hearts, par times and gold/silver/bronze medals
- 14 hidden relics, each with its own design, saved to your Collection
- In-game Records screen with your best, average, last 10 runs, deaths and more
- Full PS5 DualSense / controller support with rumble
- Settings that affect the game: difficulty, graphics quality, FOV, sensitivity, volumes and more

## Controls

| Action | Keyboard / mouse | Controller |
|---|---|---|
| Move | WASD | Left stick |
| Look | Mouse | Right stick |
| Jump | Space | ✕ |
| Sprint | Shift | R2 |
| Pick up (if auto pickup is off) | E | ▢ |
| Records / Collection | Tab, then ← → | Touchpad, then L1 / R1 |
| Pause | Esc | Options |
| Respawn | R | — |

## Building from source

Requires [Node.js](https://nodejs.org). All models are generated with [Blender](https://www.blender.org) from the scripts in `blender/`, and the generated `.glb` files are already included.

```bash
npm install
npm start          # run the game
npm run build      # build dist/Aurora-Setup.exe
npm run models     # regenerate the models with Blender (optional)
```

| Folder / file | Contents |
|---|---|
| `index.html` | Main menu, settings, audio, level select |
| `src/game.js` | The game engine (three.js) |
| `src/levels.js` | Level layouts |
| `blender/` | Scripts that build the player, world, hazard and relic models |
| `models/`, `relics/` | Generated models and relic icons |
| `main.js`, `preload.js` | Electron desktop wrapper |
