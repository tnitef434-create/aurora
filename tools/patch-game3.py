p = 'src/game.js'
s = open(p, encoding='utf-8').read()


def rep(a, b):
    global s
    assert a in s, a[:120]
    s = s.replace(a, b, 1)


rep("import relic from '../models/relic.glb';", "\n".join(f"import relic_{i} from '../models/relic_{i}.glb';" for i in range(12)))
rep("platform, pad, drone, emitter, spikes, relic };", "platform, pad, drone, emitter, spikes, " + ", ".join(f"relic_{i}" for i in range(12)) + " };")
rep("  const { container, audio, getSettings, onPause, onLevelComplete, onFinish, onQuit, getRelics, onRelic } = opts;",
    "  const { container, audio, getSettings, onPause, onLevelComplete, onFinish, onQuit, getRelics, onRelic, getProgress, onAttempt, onDeath } = opts;")
rep("const k = remap[c.material.name] || c.material.name;", "const k = remap['*'] || remap[c.material.name] || c.material.name;")
rep("""      case 'RelicGhost': m.transparent = true; m.opacity = .28; m.emissiveIntensity = .6; m.depthWrite = false; break;
    }""", """      case 'RelicGhost': m.transparent = true; m.opacity = .28; m.color.set(0xffffff); m.emissive.set(0x9fffe0); m.emissiveIntensity = .5; m.metalness = 0; m.depthWrite = false; break;
      default:
        // relic materials (made in Blender, named R*) glow harder in-game so bloom picks them up
        if (/^R[A-Z]/.test(key) && m.emissiveIntensity > 0) m.emissiveIntensity *= 4.5;
    }""")
rep("""        const o = cloneModel('relic', had ? { Relic: 'RelicGhost', RelicGold: 'RelicGhost' } : {});
        o.position.set(p.x, 1.2, p.z);""", """        const gIdx = Math.min(i * 2 + idx, 11);
        const o = cloneModel('relic_' + gIdx, had ? { '*': 'RelicGhost' } : {});
        o.scale.setScalar(1.25);
        o.position.set(p.x, 1.3, p.z);""")
rep("L.relics.push({ obj: o, idx, had, taken: false, r, c, name: def.relics[idx] || 'Relic' });",
    "L.relics.push({ obj: o, idx, gIdx, had, taken: false, r, c, name: def.relics[idx] || 'Relic' });")
rep("rl.obj.position.y = 1.2 + Math.sin(t * 1.6 + rl.c) * .15;", "rl.obj.position.y = 1.3 + Math.sin(t * 1.6 + rl.c) * .15;")

rep("""    <div class="g-fade"></div>`;""", """    <div class="g-ov"><div class="ov-card">
      <div class="ov-head"><div class="ov-tabs"><i class="ov-ind"></i><button data-t="0">Records</button><button data-t="1">Collection</button></div>
      <div class="ov-keys"></div></div>
      <div class="ov-body"></div></div></div>
    <div class="g-fade"></div>`;""")

rep("    time = 0; updateShardHud(); updateHearts(); updateRelicHud(); renderHints();",
    "    time = 0; P.deathsRun = 0; updateShardHud(); updateHearts(); updateRelicHud(); renderHints();\n    closeOverlay(true);\n    onAttempt && onAttempt(i);")
rep("""    const dead = P.hearts <= 0;
    message(""", """    const dead = P.hearts <= 0;
    if (reason !== 'manual') { P.deathsRun = (P.deathsRun || 0) + 1; onDeath && onDeath(levelIndex); }
    message(""")
rep("const res = onLevelComplete(levelIndex, time, medal, relicsNow) || {};", "const res = onLevelComplete(levelIndex, time, medal, relicsNow, P.deathsRun || 0) || {};")
rep("""  function pause() {
    if (!running || paused) return;""", """  function pause() {
    if (!running || paused) return;
    closeOverlay(true);""")

rep("""      if (k === 'Escape' || k === 'KeyP') { e.preventDefault(); pause(); return; }
      if (paused) return;""", """      if (ov.open) {
        e.preventDefault();
        if (k === 'Tab' || k === 'Escape' || k === 'Backspace') closeOverlay();
        else if (k === 'ArrowRight' || k === 'KeyE' || k === 'Digit2') setOvTab(1);
        else if (k === 'ArrowLeft' || k === 'KeyQ' || k === 'Digit1') setOvTab(0);
        return;
      }
      if (k === 'Tab' && state === 'playing' && !paused && !e.repeat) { e.preventDefault(); openOverlay(); return; }
      if (k === 'Escape' || k === 'KeyP') { e.preventDefault(); pause(); return; }
      if (paused) return;""")

rep("""    if (edge(0)) jumpPressed = true;
    if (edge(2)) interactPressed = true;""", """    if (ov.open) {
      if (edge(5) || edge(15)) setOvTab(1);
      else if (edge(4) || edge(14)) setOvTab(0);
      else if (edge(17) || edge(1) || edge(9) || edge(8)) closeOverlay();
      padPrev = p.buttons.map(x => x.pressed || x.value > .5);
      return out;
    }
    if (edge(17) && state === 'playing') { padPrev = p.buttons.map(x => x.pressed || x.value > .5); openOverlay(); return out; }
    if (edge(0)) jumpPressed = true;
    if (edge(2)) interactPressed = true;""")

rep("""    const inp = readPad(dt);
    if (paused) return;""", """    const inp = readPad(dt);
    if (paused) return;
    if (ov.open) { const live = hud.querySelector('.ov-live'); if (live) live.textContent = fmtTime(time); return; }""")

OVERLAY = open('tools/overlay.js', encoding='utf-8').read()
rep("  /* ---------- main loop ---------- */", OVERLAY + "\n  /* ---------- main loop ---------- */")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
