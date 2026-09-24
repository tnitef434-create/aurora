p = 'index.html'
s = open(p, encoding='utf-8').read()


def rep(a, b):
    global s
    assert a in s, a[:160]
    s = s.replace(a, b, 1)


# --- Options bug: the button that paused the game must not also trigger the menu.
rep("""function showPauseMenu() {
  document.body.classList.remove('ingame'); root.classList.add('paused');""", """function swallowHeldPadButtons() {
  // treat everything currently held as "already pressed" so a held Options/Circle
  // doesn't instantly act on the pause menu; buttons register again once released
  const now = performance.now();
  padPrev = { left: 1, right: 1, up: 1, down: 1, ok: 1, back: 1, tabPrev: 1, tabNext: 1, fastL: 1, fastR: 1, options: 1, tri: 1, sq: 1 };
  for (const k in padPrev) padHeld[k] = now + 400;
  padGuardUntil = now + 250;
}
function showPauseMenu() {
  swallowHeldPadButtons();
  document.body.classList.remove('ingame'); root.classList.add('paused');""")
rep("let padPrev = {}, padHeld = {}, padSince = {}, padConnected = false, padIndex = null;",
    "let padPrev = {}, padHeld = {}, padSince = {}, padConnected = false, padIndex = null, padGuardUntil = 0;")
rep("""  if (mode === 'game' || mode === 'starting') { padPrev = st; return; }   // the game reads the pad itself""",
    """  if (mode === 'game' || mode === 'starting') { padPrev = st; return; }   // the game reads the pad itself
  if (now < padGuardUntil) { for (const k in st) if (st[k]) padPrev[k] = true; return; }""")

# --- run history + stats
rep("let PROG = { unlocked: 1, best: [], medal: [], relics: {} };", "let PROG = { unlocked: 1, best: [], medal: [], relics: {}, runs: {}, stats: {} };")
rep("""    getRelics: i => PROG.relics[i] || [],""", """    getRelics: i => PROG.relics[i] || [],
    getProgress: () => PROG,
    onAttempt: i => { const st = PROG.stats[i] = PROG.stats[i] || { n: 0, sum: 0, att: 0, deaths: 0 }; st.att++; saveProg(); },
    onDeath: i => { const st = PROG.stats[i] = PROG.stats[i] || { n: 0, sum: 0, att: 0, deaths: 0 }; st.deaths++; saveProg(); },""")
rep("""    onLevelComplete: (i, t, medal) => {
      const prev = PROG.best[i], newBest = prev == null || t < prev;""", """    onLevelComplete: (i, t, medal, relicsNow, deaths) => {
      const prev = PROG.best[i], newBest = prev == null || t < prev;
      const runs = PROG.runs[i] = PROG.runs[i] || [];
      runs.push({ t, m: medal, d: Date.now(), x: deaths || 0 }); if (runs.length > 10) runs.splice(0, runs.length - 10);
      const st = PROG.stats[i] = PROG.stats[i] || { n: 0, sum: 0, att: 0, deaths: 0 }; st.n++; st.sum += t;""")

# --- collection page uses the Blender-rendered relic icons
rep("""return `<div class="relic-card${got ? ' found' : ''}" style="--c:${c};--k:${k++}"><div class="rgem"></div>""",
    """return `<div class="relic-card${got ? ' found' : ''}" style="--c:${c};--k:${k++}"><div class="ricon"><img src="relics/relic_${i * 2 + j}.png" alt=""></div>""")
rep("<span>relics recovered</span>", "<span>relics recovered · tip: press the touchpad (or Tab) in a level</span>")

# --- CSS
rep("</style>", r"""
/* relic icons (menu collection) */
.relic-card .ricon{width:92px;height:92px;margin:0 auto 8px;display:grid;place-items:center;position:relative}
.relic-card .ricon::before{content:'';position:absolute;inset:14px;border-radius:50%;background:radial-gradient(closest-side,color-mix(in srgb,var(--c) 45%,transparent),transparent);opacity:0;transition:opacity .4s}
.relic-card.found .ricon::before{opacity:1}
.relic-card .ricon img{position:relative;width:100%;height:100%;object-fit:contain;filter:brightness(0) drop-shadow(0 0 1px rgba(255,255,255,.55));opacity:.45}
.relic-card.found .ricon img{filter:drop-shadow(0 6px 14px rgba(0,0,0,.5));opacity:1;animation:relicFloat 4s ease-in-out infinite}
@keyframes relicFloat{50%{transform:translateY(-5px) rotate(-3deg)}}

/* ================= in-game records / collection overlay ================= */
.g-ov{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0;
  background:radial-gradient(ellipse at center,rgba(8,10,20,.35),rgba(4,5,10,.8));backdrop-filter:blur(0px);transition:opacity .35s ease,backdrop-filter .45s ease}
.g-hud.ov-on .g-ov{opacity:1;pointer-events:auto;backdrop-filter:blur(10px)}
.g-hud.ov-on>*:not(.g-ov):not(.g-fade):not(.g-hit){opacity:0!important}
.ov-card{width:min(1080px,92vw);max-height:88vh;display:flex;flex-direction:column;border-radius:28px;overflow:hidden;
  background:linear-gradient(160deg,rgba(120,140,170,.22),rgba(20,26,40,.72) 55%,rgba(10,12,22,.86));border:1px solid rgba(255,255,255,.16);
  box-shadow:0 50px 120px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.18);transform:translateY(26px) scale(.96);transition:transform .6s cubic-bezier(.34,1.56,.64,1)}
.g-hud.ov-on .ov-card{transform:none}
.ov-card::before{content:'';position:absolute;left:50%;top:0;width:44%;height:2px;transform:translateX(-50%);background:linear-gradient(90deg,transparent,#7fffd4,#b69cff,#ff7fd6,transparent);box-shadow:0 0 18px rgba(160,200,255,.8)}
.ov-card{position:relative}
.ov-head{display:flex;align-items:center;justify-content:space-between;padding:20px 26px 0}
.ov-tabs{position:relative;display:flex;padding:5px;border-radius:14px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1)}
.ov-tabs button{position:relative;z-index:1;width:140px;padding:10px 0;border:0;background:none;color:rgba(255,255,255,.55);font:800 14px 'Figtree',sans-serif;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;transition:color .3s}
.ov-tabs button.on{color:#121016}
.ov-ind{position:absolute;left:5px;top:5px;bottom:5px;width:140px;border-radius:10px;background:linear-gradient(180deg,#fff,#efe6ff);
  box-shadow:-8px 0 22px rgba(255,127,214,.35),8px 0 22px rgba(160,140,255,.4);transition:transform .5s cubic-bezier(.34,1.56,.64,1)}
.ov-keys{display:flex;align-items:center;gap:6px;font-weight:700;font-size:13px;color:rgba(255,255,255,.6)}
.ov-keys b{padding:3px 8px;border-radius:7px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.22);font-size:11px;color:#fff}
.ov-keys span{width:14px}
.ov-body{padding:18px 26px 26px;overflow:auto}
.ov-body.swap>*{animation:ovIn .5s cubic-bezier(.2,.9,.25,1)}
@keyframes ovIn{from{opacity:0;transform:translateX(24px)}}
.ov-title small{font-weight:900;letter-spacing:.4em;font-size:12px;color:#7fffd4;text-transform:uppercase}
.ov-title h2{font-size:34px;font-weight:900;margin:2px 0 16px}
.ov-tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.ov-tile{position:relative;padding:14px 16px;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);animation:ovTile .5s cubic-bezier(.2,.9,.25,1) backwards;animation-delay:var(--d)}
@keyframes ovTile{from{opacity:0;transform:translateY(12px)}}
.ov-tile span{display:block;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.5)}
.ov-tile b{display:block;font-size:26px;font-weight:900;font-variant-numeric:tabular-nums;margin-top:4px}
.ov-tile em{font-style:normal;font-size:12px;font-weight:700;color:rgba(255,255,255,.5)}
.ov-tile.hero{background:linear-gradient(150deg,rgba(127,255,212,.18),rgba(182,156,255,.14));border-color:rgba(160,230,255,.35)}
.ov-tile.hero b{font-size:30px;background:linear-gradient(90deg,#fff,#bffff0);-webkit-background-clip:text;background-clip:text;color:transparent}
.ov-tile .ov-medal{position:absolute;right:14px;top:14px}
.ov-medal{display:inline-block;width:14px;height:14px;border-radius:50%;flex:none}
.ov-medal.gold{background:radial-gradient(circle at 35% 30%,#fff3c4,#ffc43d 55%,#b8791a);box-shadow:0 0 10px rgba(255,196,61,.7)}
.ov-medal.silver{background:radial-gradient(circle at 35% 30%,#fff,#c9d2e3 55%,#7c879c)}
.ov-medal.bronze{background:radial-gradient(circle at 35% 30%,#ffe0c4,#d98a4e 55%,#8a4a22)}
.ov-cols{display:grid;grid-template-columns:1.6fr 1fr;gap:14px;margin-top:14px}
.ov-chartbox,.ov-levels{padding:14px 16px;border-radius:16px;background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.07)}
.ov-sub{font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:8px}
.ov-chart{width:100%;height:190px;overflow:visible}
.ov-chart .bar rect{fill:url(#none);fill:rgba(255,255,255,.25);transform-box:fill-box;transform-origin:50% 100%;animation:barUp .7s cubic-bezier(.2,.9,.25,1) backwards;animation-delay:var(--d)}
@keyframes barUp{from{transform:scaleY(0)}}
.ov-chart .bar.gold rect{fill:#ffc43d}.ov-chart .bar.silver rect{fill:#c9d2e3}.ov-chart .bar.bronze rect{fill:#d98a4e}
.ov-chart .bar.latest rect{stroke:#fff;stroke-width:2}
.ov-chart .bar.best rect{filter:drop-shadow(0 0 6px rgba(127,255,212,.9))}
.ov-chart text{fill:rgba(255,255,255,.8);font:700 11px 'Figtree',sans-serif;text-anchor:middle}
.ov-chart text.lbl{fill:rgba(255,255,255,.4);font-size:10px}
.ov-chart line.par{stroke:#7fffd4;stroke-width:1.5;stroke-dasharray:5 5;opacity:.8}
.ov-chart line.avg{stroke:#b69cff;stroke-width:1.2;opacity:.7}
.ov-chart .parl{fill:#7fffd4;text-anchor:end;font-size:10px;font-weight:900}
.ov-chart .avgl{fill:#b69cff;text-anchor:end;font-size:10px;font-weight:900}
.ov-empty{height:190px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font-weight:800;font-size:18px;color:rgba(255,255,255,.75)}
.ov-empty span{font-size:13px;font-weight:600;color:rgba(255,255,255,.45)}
.ov-lv{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;font-size:14px}
.ov-lv .n{font-weight:900;color:rgba(255,255,255,.4);font-size:12px}
.ov-lv .nm{flex:1;font-weight:700}
.ov-lv b{font-variant-numeric:tabular-nums;font-weight:800}
.ov-lv small{width:30px;text-align:right;color:rgba(255,255,255,.4);font-weight:700}
.ov-lv.cur{background:linear-gradient(90deg,rgba(127,255,212,.15),transparent);box-shadow:inset 3px 0 0 #7fffd4}
.ov-colhead{display:flex;align-items:center;gap:18px;margin-bottom:16px}
.ov-ring{width:64px;height:64px;transform:rotate(-90deg)}
.ov-ring circle{fill:none;stroke:rgba(255,255,255,.1);stroke-width:6}
.ov-ring circle.fg{stroke:url(#none);stroke:#7fffd4;stroke-linecap:round;filter:drop-shadow(0 0 6px #7fffd4);transition:stroke-dasharray .8s}
.ov-colhead b{font-size:34px;font-weight:900}
.ov-colhead b span{font-size:18px;color:rgba(255,255,255,.5)}
.ov-colhead small{display:block;color:rgba(255,255,255,.55);font-weight:700}
.ov-rgrid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
.ov-relic{padding:10px 8px 12px;border-radius:16px;text-align:center;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);animation:ovTile .5s cubic-bezier(.2,.9,.25,1) backwards;animation-delay:var(--d)}
.ov-relic.here{border-color:rgba(255,255,255,.28);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
.ov-relic.got{background:linear-gradient(170deg,color-mix(in srgb,var(--c) 22%,transparent),rgba(255,255,255,.03));border-color:color-mix(in srgb,var(--c) 50%,transparent)}
.ov-ricon{position:relative;height:88px;display:grid;place-items:center}
.ov-ricon::before{content:'';position:absolute;inset:12px;border-radius:50%;background:radial-gradient(closest-side,color-mix(in srgb,var(--c) 50%,transparent),transparent);opacity:0}
.ov-relic.got .ov-ricon::before{opacity:1}
.ov-ricon img{position:relative;width:88px;height:88px;object-fit:contain;filter:brightness(0) drop-shadow(0 0 1px rgba(255,255,255,.6));opacity:.4}
.ov-relic.got .ov-ricon img{filter:drop-shadow(0 6px 12px rgba(0,0,0,.5));opacity:1;animation:relicFloat 4s ease-in-out infinite}
.ov-relic b{display:block;font-size:12px;font-weight:800;margin-top:4px;line-height:1.2}
.ov-relic small{display:block;margin-top:3px;font-size:10px;color:rgba(255,255,255,.45);font-weight:700}
</style>""")

# in-game hint for the new screen
rep("? [['L', T('move')]", "? [['L', T('move')]") if "? [['L', T('move')]" in s else None
open(p, 'w', encoding='utf-8').write(s)
print('ok')
