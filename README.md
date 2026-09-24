# Aurora

A dreamy third-person space-maze game. Guide a small astronaut across floating crystal islands beneath the northern lights. In each level you collect three star shards to wake the portal, dodge drones, lasers, spike traps and crumbling tiles, and hunt for hidden relics.

## Play

**In your browser, no install:** download or clone this repo and open `index.html` in Chrome, Edge or Firefox. The game is prebuilt (`game.bundle.js`), so nothing else is needed. You can also turn on GitHub Pages (Settings → Pages → deploy from `main`) and play it online.

**Desktop app:** get the latest **Aurora-win64.zip** from [Releases](../../releases). Unzip it and run `Aurora.exe`.

> Windows may show "Windows protected your PC" because the game isn't code-signed. Click **More info → Run anyway**.

## Features

- 7 levels: The Drift, Nebula Gardens, The Core, Shattered Halo, Laser Garden, Aurora's Heart and **Level Impossible**
- Level Impossible (v1.5, the final update of Chapter 1): the biggest map yet (25×25), packed with lasers, spike traps, drones and crumbling tiles, faster hazards and only 2 hearts
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
npm run build      # package Aurora.exe into dist/
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
