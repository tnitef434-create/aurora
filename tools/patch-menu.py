# One-off patch that turns the main menu into the game shell (idempotency not needed).
import sys, io
p = sys.argv[1]
s = io.open(p, encoding='utf-8').read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n < 1:
        raise SystemExit('NOT FOUND:\n' + old[:200])
    s = s.replace(old, new, count)

# ---------------------------------------------------------------- HTML
rep('<title>Main Menu</title>', '<title>Aurora</title>')
rep('<div id="root">', '<div id="game"></div>\n<div id="root">')
rep('<div class="tagline">MAIN MENU</div>', '<div class="tagline">A JOURNEY THROUGH THE VOID</div>')
rep('<script>\n(() => {', '''<div id="blackout"></div>
<div id="loading"><div class="spin"></div><span>Entering the void…</span></div>
<script src="game.bundle.js"></script>
<script>
(() => {''')

# ---------------------------------------------------------------- CSS
rep('</style>', r'''
/* ================= game shell ================= */
#game{position:fixed;inset:0;z-index:0;display:none;background:#05060a}
#game.on{display:block}
#root{z-index:1}
body.ingame #root{display:none}
#root.paused .scene,#root.paused #fx,#root.paused .grain,#root.paused .tabs{display:none}
#root.paused .vignette{background:radial-gradient(ellipse 90% 80% at 50% 45%,rgba(6,8,14,.35),rgba(3,4,8,.82))}
#blackout{position:fixed;inset:0;z-index:200;background:#000;opacity:0;pointer-events:none;transition:opacity .5s ease}
#blackout.on{opacity:1;pointer-events:auto}
#loading{position:fixed;inset:0;z-index:201;display:none;align-items:center;justify-content:center;gap:16px;font-weight:800;letter-spacing:.2em;font-size:15px;color:rgba(255,255,255,.8);text-transform:uppercase}
#loading.show{display:flex}
#loading .spin{width:26px;height:26px;border-radius:50%;border:3px solid rgba(255,255,255,.15);border-top-color:#b69cff;animation:spin .8s linear infinite}
.modes.lv{grid-template-columns:repeat(3,1fr)}
.mode .lvn{position:absolute;top:12px;left:16px;font-size:40px;font-weight:900;opacity:.35;line-height:1}
.mode.locked{opacity:.38;filter:saturate(.3)}
.mode.locked .lvn::after{content:' 🔒';font-size:18px;vertical-align:middle}
.g-canvas{position:absolute;inset:0;width:100%!important;height:100%!important;display:block;outline:none}
.g-hud{position:absolute;inset:0;pointer-events:none;color:#fff;--ui:1;font-family:'Figtree',system-ui,sans-serif;user-select:none}
.g-tl{position:absolute;left:34px;top:28px;transform:scale(var(--ui));transform-origin:0 0}
.g-lvl{font-weight:800;font-size:17px;letter-spacing:.06em;text-transform:uppercase;text-shadow:0 2px 12px rgba(0,0,0,.6)}
.g-shards{display:flex;gap:8px;margin-top:8px}
.g-shards i{font-style:normal;font-size:30px;line-height:1;color:rgba(255,255,255,.18);transition:color .4s,text-shadow .4s}
.g-shards i::before{content:'★'}
.g-shards i.on{color:#ffc35a;text-shadow:0 0 14px rgba(255,195,90,.9),0 0 30px rgba(255,160,60,.6)}
.g-shards i.pop{animation:gpop .7s cubic-bezier(.34,1.56,.64,1)}
@keyframes gpop{0%{transform:scale(.4) rotate(-40deg)}60%{transform:scale(1.5) rotate(10deg)}100%{transform:none}}
.g-tr{position:absolute;right:34px;top:28px;text-align:right;transform:scale(var(--ui));transform-origin:100% 0}
.g-timer{font-weight:800;font-size:24px;font-variant-numeric:tabular-nums;text-shadow:0 2px 12px rgba(0,0,0,.6)}
.g-fps{margin-top:4px;font:700 12px ui-monospace,Consolas,monospace;color:#9dffb8}
.g-msg{position:absolute;left:50%;top:17%;transform:translate(-50%,12px);opacity:0;font-weight:800;font-size:26px;letter-spacing:.02em;text-align:center;
  text-shadow:0 0 24px rgba(0,0,0,.8),0 2px 8px rgba(0,0,0,.6);transition:opacity .45s ease,transform .6s cubic-bezier(.2,.9,.25,1);white-space:nowrap}
.g-msg.show{opacity:1;transform:translate(-50%,0)}
.g-prompt{position:absolute;left:50%;top:64%;transform:translate(-50%,8px);display:flex;align-items:center;padding:10px 18px;border-radius:14px;
  background:rgba(10,12,22,.55);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(12px);font-weight:700;font-size:16px;opacity:0;transition:opacity .3s,transform .4s cubic-bezier(.34,1.56,.64,1)}
.g-prompt.show{opacity:1;transform:translate(-50%,0)}
.g-prompt b{display:inline-grid;place-items:center;min-width:28px;height:28px;padding:0 7px;border-radius:8px;background:#fff;color:#111;margin-right:10px;font-weight:900}
.g-map{position:absolute;right:30px;bottom:30px;width:190px;height:190px;border-radius:20px;background:rgba(8,10,18,.45);border:1px solid rgba(255,255,255,.14);
  backdrop-filter:blur(10px);transform:scale(var(--ui));transform-origin:100% 100%}
.g-hints{position:absolute;left:34px;bottom:28px;display:flex;flex-wrap:wrap;gap:16px;font-weight:700;font-size:14px;color:rgba(255,255,255,.82);text-shadow:0 1px 6px rgba(0,0,0,.6)}
.g-hints b{display:inline-block;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.25);border-radius:7px;padding:3px 8px;margin-right:7px;font-size:12px}
.g-title{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);text-align:center;opacity:0;white-space:nowrap}
.g-title.show{animation:gTitle 4.6s ease forwards}
.g-title small{font-weight:800;letter-spacing:.5em;font-size:14px;color:rgba(255,255,255,.6)}
.g-title h1{font-size:clamp(44px,6vw,86px);font-weight:900;letter-spacing:.04em;margin:6px 0;text-shadow:0 0 40px rgba(180,150,255,.5)}
.g-title p{font-size:18px;font-weight:600;color:rgba(255,255,255,.75)}
@keyframes gTitle{0%{opacity:0;filter:blur(12px);transform:translate(-50%,-44%)}14%{opacity:1;filter:blur(0);transform:translate(-50%,-50%)}78%{opacity:1}100%{opacity:0;filter:blur(8px);transform:translate(-50%,-56%)}}
.g-lock{position:absolute;inset:0;display:none;place-items:center;pointer-events:auto;cursor:pointer;background:rgba(0,0,0,.25)}
.g-lock.show{display:grid}
.g-lock span{padding:14px 26px;border-radius:14px;background:rgba(255,255,255,.95);color:#121016;font-weight:800;font-size:18px;box-shadow:-12px 0 30px -4px rgba(255,120,210,.5),12px 0 30px -4px rgba(150,140,255,.55)}
.g-complete{position:absolute;left:50%;top:50%;min-width:440px;padding:38px 44px;border-radius:26px;text-align:center;opacity:0;pointer-events:none;
  transform:translate(-50%,-46%) scale(.92);transition:opacity .5s ease,transform .7s cubic-bezier(.34,1.56,.64,1);
  background:linear-gradient(165deg,rgba(150,175,195,.3),rgba(40,52,68,.55));border:1px solid rgba(255,255,255,.22);backdrop-filter:blur(26px) saturate(140%);box-shadow:0 40px 90px rgba(0,0,0,.6)}
.g-complete.show{opacity:1;pointer-events:auto;transform:translate(-50%,-50%) scale(1)}
.g-complete small{font-weight:800;letter-spacing:.4em;font-size:13px;color:rgba(255,255,255,.6);text-transform:uppercase}
.g-complete h1{font-size:44px;font-weight:900;margin-top:6px}
.g-stats{display:flex;flex-wrap:wrap;justify-content:center;gap:12px 44px;margin:24px 0 28px}
.g-stats div span{display:block;font-size:13px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.6)}
.g-stats div b{font-size:32px;font-weight:900;font-variant-numeric:tabular-nums}
.g-stats em{flex-basis:100%;font-style:normal;font-weight:800;color:#ffc35a;text-shadow:0 0 16px rgba(255,195,90,.7)}
.g-stats p{flex-basis:100%;color:rgba(255,255,255,.75);font-weight:600}
.g-btn{border:0;cursor:pointer;height:60px;padding:0 44px;border-radius:15px;font:900 22px 'Figtree',sans-serif;letter-spacing:.08em;color:#1a1408;
  background:linear-gradient(180deg,#ffe879,#ffc53a);box-shadow:0 14px 36px -10px rgba(255,200,60,.7);transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
.g-btn:hover{transform:scale(1.05)}
.g-fade{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none}
</style>''')

# ---------------------------------------------------------------- settings / data
rep("  sensX: 6.5, sensY: 6.5, invert: false, vibration: true, deadzone: 12, mode: 0\n",
    "  sensX: 6.5, sensY: 6.5, invert: false, vibration: true, deadzone: 12, mode: 0,\n"
    "  difficulty: 'Normal', minimap: true, quality: 'High', fov: 75, level: 0\n")
rep("{ id: 'play', title: 'Play', sub: 'Jump into a match with friends.', icon: 'play', kind: 'play' }",
    "{ id: 'play', title: 'Play', sub: 'Journey through the void.', icon: 'play', kind: 'play' }")
rep("{ type: 'header', label: 'Region & Language' }", "{ type: 'header', label: 'Language & Difficulty' }")
rep("{ type: 'choice', key: 'region', label: 'Matchmaking Region', options: ['Auto', 'Europe', 'NA-East', 'NA-West', 'Asia', 'Oceania'] }",
    "{ type: 'choice', key: 'difficulty', label: 'Difficulty', desc: 'Relaxed: respawn where you fell · Hard: lose your shards.', options: ['Relaxed', 'Normal', 'Hard'] }")
rep("label: 'Auto Pickup Items', desc: 'Automatically collect nearby loot.'", "label: 'Auto Pickup', desc: 'Collect star shards by walking into them.'")
rep("desc: 'Menu parallax & camera shake.'", "desc: 'Landing shake, walking bob & menu parallax.'")
rep("{ type: 'toggle', key: 'showFps', label: 'Show FPS Counter' }",
    "{ type: 'toggle', key: 'showFps', label: 'Show FPS Counter' },\n    { type: 'toggle', key: 'minimap', label: 'Minimap', desc: 'Reveals the maze as you explore.' }")
rep("desc: 'Ambient menu soundtrack.'", "desc: 'Ambient soundtrack, unique per level.'")
rep("{ type: 'choice', key: 'fpsCap', label: 'Frame Rate Limit', options: ['30', '60', '120', '144', '240', 'Unlimited'] },",
    "{ type: 'choice', key: 'fpsCap', label: 'Frame Rate Limit', options: ['30', '60', '120', '144', '240', 'Unlimited'] },\n"
    "    { type: 'choice', key: 'quality', label: 'Graphics Quality', desc: 'Shadows, bloom and particle density.', options: ['Low', 'Medium', 'High', 'Ultra'] },\n"
    "    { type: 'slider', key: 'fov', label: 'Field of View', min: 60, max: 100, step: 1, kstep: 5, unit: '°' },")
rep("desc: 'Disable card tilt and ambient animation.'", "desc: 'Less camera bob, tilt and ambient motion.'")
rep("desc: 'Also affects card tilt.'", "desc: 'Mouse & right stick (also menu card tilt).'")
rep('''const MODES = [
  { name: 'Solo', n: 1, pop: '48.2K' }, { name: 'Duos', n: 2, pop: '31.7K' },
  { name: 'Squads', n: 4, pop: '64.9K' }, { name: 'Creative', n: 3, pop: '12.4K' }
];''', '''const LEVEL_INFO = [
  { name: 'The Drift' }, { name: 'Nebula Gardens' }, { name: 'The Core' }
];
const LEVEL_CHORDS = [
  [[146.83, 220.00, 277.18, 329.63], [123.47, 185.00, 220.00, 277.18], [98.00, 196.00, 246.94, 369.99], [110.00, 164.81, 220.00, 277.18]],
  [[130.81, 196.00, 233.08, 311.13], [116.54, 174.61, 233.08, 293.66], [103.83, 155.56, 207.65, 261.63], [98.00, 146.83, 196.00, 233.08]],
  [[110.00, 164.81, 220.00, 261.63], [87.31, 174.61, 220.00, 261.63], [130.81, 196.00, 261.63, 329.63], [98.00, 196.00, 246.94, 293.66]]
];
let PROG = { unlocked: 1, best: [] };
try { Object.assign(PROG, JSON.parse(localStorage.getItem('aurora-progress') || '{}')); } catch (e) {}
const saveProg = () => { try { localStorage.setItem('aurora-progress', JSON.stringify(PROG)); } catch (e) {} };
const fmtT = t => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;''')

# music: per-level chord sets
rep('''  update() {
    const should = A.ctx && S.music > 0''', '''  base: null,
  setChords(ch) {
    if (!this.base) this.base = this.chords;
    this.chords = ch || this.base; this.step = 0;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.update();
  },
  update() {
    const should = A.ctx && S.music > 0''')

# ---------------------------------------------------------------- play panel rows
rep("const list = d.kind === 'play' ? [{ type: 'modes' }, { type: 'ready' }] :",
    "const list = d.kind === 'play' ? (inGame\n"
    "    ? [{ type: 'resume' }, { type: 'action', label: 'Restart Level', fn: () => restartLevel() }, { type: 'action', label: 'Exit to Main Menu', fn: () => exitToMenu() }]\n"
    "    : [{ type: 'levels' }, { type: 'start' }]) :")

start = s.index('  modes() {')
end = s.index("$('#backBtn').addEventListener('click', closePanel);")
s = s[:start] + r'''  levels() {
    S.level = clamp(S.level || 0, 0, PROG.unlocked - 1);
    const el = h(`<div class="row col"><div class="rl"><b>Select Level</b><small>Find the star shards, wake the portal, drift onward.</small></div>
      <div class="modes lv">${LEVEL_INFO.map((l, i) => `<div class="mode${i >= PROG.unlocked ? ' locked' : ''}"><div class="lvn">${i + 1}</div><b>${l.name}</b><small>${i >= PROG.unlocked ? 'Locked' : PROG.best[i] != null ? 'Best ' + fmtT(PROG.best[i]) : 'Not cleared yet'}</small></div>`).join('')}</div></div>`);
    const tiles = $$('.mode', el);
    const refresh = () => tiles.forEach((t, i) => t.classList.toggle('sel', i === S.level));
    const pick = i => {
      if (i >= PROG.unlocked) { SFX.bump(); toast('Clear the previous level to unlock it'); return; }
      if (i === S.level) return;
      const dir = Math.sign(i - S.level) || 1;
      S.level = i; save(); refresh(); SFX.change(dir); vibrate(10);
      if (readyEls) readyEls.st.textContent = `Level ${i + 1} · ${LEVEL_INFO[i].name}`;
    };
    tiles.forEach((t, i) => {
      t.addEventListener('click', e => { e.stopPropagation(); pick(i); });
      t.addEventListener('pointerenter', () => SFX.hover(i + 2, true));
    });
    refresh();
    return { el, refresh, adjust: d => { const n = S.level + d; if (n < 0 || n >= LEVEL_INFO.length) SFX.bump(); else pick(n); }, press: () => beginLevel(S.level) };
  },
  start() {
    const el = h(`<div class="row col ready-row"><button class="ready"><span class="rt">START</span></button><div class="rstatus">Level ${S.level + 1} · ${LEVEL_INFO[S.level].name}</div></div>`);
    readyEls = { btn: $('.ready', el), rt: $('.rt', el), st: $('.rstatus', el) };
    readyEls.btn.addEventListener('click', e => { e.stopPropagation(); beginLevel(S.level); });
    return { el, press: () => beginLevel(S.level), adjust: () => SFX.bump() };
  },
  resume() {
    const el = h(`<div class="row col ready-row"><button class="ready"><span class="rt">RESUME</span></button><div class="rstatus">Level ${(G3 ? G3.level : 0) + 1} · ${LEVEL_INFO[G3 ? G3.level : 0].name}</div></div>`);
    $('.ready', el).addEventListener('click', e => { e.stopPropagation(); resumeGame(); });
    return { el, press: resumeGame, adjust: () => SFX.bump() };
  },
  action(def) {
    const el = h(`<div class="row reset">${def.label}</div>`);
    el.addEventListener('click', def.fn);
    return { el, press: def.fn, adjust: () => SFX.bump() };
  }
};

/* ============================== GAME GLUE ============================== */
let readyEls = null, G3 = null, G3loading = null, inGame = false;
function stopSearch() {}
function ensureGame() {
  if (G3) return Promise.resolve(G3);
  if (G3loading) return G3loading;
  $('#loading').classList.add('show');
  G3loading = window.AuroraGame.createGame({
    container: $('#game'), audio: { A, SFX, Music }, getSettings: () => S,
    onPause: showPauseMenu,
    onLevelComplete: (i, t) => {
      const prev = PROG.best[i], newBest = prev == null || t < prev;
      if (newBest) PROG.best[i] = t;
      PROG.unlocked = Math.max(PROG.unlocked, Math.min(i + 2, LEVEL_INFO.length));
      S.level = Math.min(i + 1, LEVEL_INFO.length - 1); save(); saveProg();
      if (i + 1 < LEVEL_INFO.length) Music.setChords(LEVEL_CHORDS[i + 1]);
      return { best: PROG.best[i], newBest };
    },
    onFinish: () => { leaveGame(); toast('You reached the Core — thanks for playing!'); }
  }).then(g => { G3 = g; $('#loading').classList.remove('show'); return g; })
    .catch(err => { console.error(err); $('#loading').classList.remove('show'); G3loading = null; toast('Could not start the 3D engine'); throw err; });
  return G3loading;
}
const wait = ms => new Promise(r => setTimeout(r, ms));
async function beginLevel(i) {
  if (mode !== 'panel' || i >= PROG.unlocked) return;
  mode = 'starting';
  SFX.ready(); vibrate(30);
  $('#blackout').classList.add('on');
  await wait(550);
  let g;
  try { g = await ensureGame(); } catch (e) { $('#blackout').classList.remove('on'); mode = 'panel'; return; }
  hardClosePanel();
  inGame = true; mode = 'game';
  root.classList.remove('paused'); document.body.classList.add('ingame');
  Music.setChords(LEVEL_CHORDS[i]);
  g.start(i);
  await wait(60);
  $('#blackout').classList.remove('on');
}
function hardClosePanel() {
  clearTimeout(openPanel.t);
  panel.getAnimations({ subtree: true }).forEach(a => a.cancel());
  panel.classList.remove('show'); root.classList.remove('covered');
  if (openCard) openCard.el.style.visibility = '';
  setHints('menu', true);
}
function setPlayCardPaused(p) {
  const c = cards[0];
  $('h2', c.el).textContent = p ? 'Resume' : 'Play';
  $('p', c.el).textContent = p ? 'Step back into the void.' : CARDS[0].sub;
  if (focus === 0) plabel.textContent = p ? 'Resume' : 'Play';
}
function showPauseMenu() {
  document.body.classList.remove('ingame'); root.classList.add('paused');
  mode = 'menu';
  setPlayCardPaused(true);
  if (focus !== 0) setFocus(0);
  SFX.modal(); setHints('menu', true);
}
function resumeGame() {
  if (!G3) return;
  if (mode === 'panel' || mode === 'closing') hardClosePanel();
  mode = 'game'; document.body.classList.add('ingame'); root.classList.remove('paused');
  SFX.close(); G3.resume();
}
function restartLevel() {
  if (!G3) return;
  hardClosePanel();
  mode = 'game'; document.body.classList.add('ingame'); root.classList.remove('paused');
  G3.restart();
}
function exitToMenu() { SFX.close(); leaveGame(); }
function leaveGame() {
  if (G3) G3.stop();
  inGame = false;
  if (mode === 'panel' || mode === 'closing') hardClosePanel();
  document.body.classList.remove('ingame'); root.classList.remove('paused');
  setPlayCardPaused(false); mode = 'menu'; Music.setChords(null); setHints('menu', true);
}

''' + s[end:]

# ---------------------------------------------------------------- input routing
rep('''function handle(k) {
  if (mode === 'splash') return startGame();''', '''function handle(k) {
  if (mode === 'game' || mode === 'starting') return;
  if (mode === 'splash') return startGame();''')
rep("    else if (k === 'back' || k === 'options') openModal();\n    else if (k === 'tabPrev')",
    "    else if (k === 'back' || k === 'options') { if (inGame) resumeGame(); else openModal(); }\n    else if (k === 'tabPrev')")
rep('''addEventListener('keydown', e => {
  const k = KEYMAP[e.key];''', '''addEventListener('keydown', e => {
  if (mode === 'game' || mode === 'starting') return;   // the game handles its own keys
  const k = KEYMAP[e.key];''')
rep('''  let any = false;
  for (const k in st) {
    if (!st[k]) continue;''', '''  if (mode === 'game' || mode === 'starting') { padPrev = st; return; }   // the game reads the pad itself
  let any = false;
  for (const k in st) {
    if (!st[k]) continue;''')
rep('''function apply(key) {
  A.applyVolumes();''', '''function apply(key) {
  A.applyVolumes();
  if (G3) G3.applySettings(S);''')
rep('''function frame(now) {
  const dt = Math.min(64, now - last); last = now;''', '''function frame(now) {
  if (mode === 'game') { last = now; requestAnimationFrame(frame); return; }   // menu sleeps while playing
  const dt = Math.min(64, now - last); last = now;''')
rep("const panelScale", "const panelScale") if 'const panelScale' in s else None
# expose the menu's audio engine
rep("/* ============================== ICONS ============================== */", "window.AuroraAudio = { A, SFX, Music };\n\n/* ============================== ICONS ============================== */")

io.open(p, 'w', encoding='utf-8').write(s)
print('patched OK')
