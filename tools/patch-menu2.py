# Second menu patch: collection, pretty level select, pause bar, aurora backgrounds.
import sys, io
p = sys.argv[1]
s = io.open(p, encoding='utf-8').read()

def rep(old, new, count=1):
    global s
    if s.count(old) < 1:
        raise SystemExit('NOT FOUND:\n' + old[:300])
    s = s.replace(old, new, count)

# ------------------------------------------------------------------ HTML
rep('''    <div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div><div class="blob b4"></div><div class="blob b5"></div>
    <div class="pillar"></div>''', '''    <canvas id="aurora"></canvas>''')
rep('<button class="tab active">Home</button><button class="tab">Locker</button><button class="tab">Shop</button><button class="tab">Career</button>',
    '<button class="tab active">Home</button><button class="tab">Collection</button>')
rep('''      <div class="chip"><span class="dot"></span>Online</div>
      <div class="chip lvl">Lv 42</div>''', '''      <div class="chip relic-chip" id="relicChip"><span class="gemdot"></span><b>0</b>/12</div>
      <div class="chip lvl" id="medalChip"><span class="mdot gold"></span><b>0</b></div>''')
rep('''  </header>''', '''  </header>
  <div class="pausebar" id="pausebar">
    <span class="pb-title">Paused</span>
    <button data-p="resume"><span class="pk">Esc</span>Resume</button>
    <button data-p="restart"><span class="pk">R</span>Restart Level</button>
    <button data-p="quit" class="danger"><span class="pk">Q</span>Quit Level</button>
  </div>''')
rep('''    <div class="title" id="title"></div>''', '''    <div class="splash-mark"><i></i><i></i><i></i></div>
    <div class="title" id="title"></div>''')

# ------------------------------------------------------------------ CSS
rep('--cw:clamp(200px,16.5vw,300px);', '--cw:clamp(168px,13.6vw,262px);')
rep('radial-gradient(90% 60% at 50% 115%,#2a1016 0%,transparent 65%),', 'radial-gradient(90% 60% at 50% 115%,#0c1a2a 0%,transparent 65%),')
rep('</style>', r'''
/* ================= aurora theme ================= */
#aurora{position:absolute;inset:80px;width:calc(100% - 160px);height:calc(100% - 160px);display:block}
.blob,.pillar{display:none}
.splash{background:transparent}
.splash-mark{position:relative;width:118px;height:118px;margin-bottom:26px;animation:fadeUp 1.2s var(--ease) .05s backwards}
.splash-mark i{position:absolute;inset:0;border-radius:34px;background:conic-gradient(from 200deg,#ff7fd6,#b69cff,#7fd4ff,#7fffd4,#ff7fd6);animation:spin 7s linear infinite;box-shadow:0 0 60px rgba(160,200,255,.45)}
.splash-mark i:nth-child(2){inset:22px;border-radius:18px;background:#0b0e18;animation:none;box-shadow:inset 0 0 30px rgba(127,255,212,.25)}
.splash-mark i:nth-child(3){inset:-30px;border-radius:60px;background:radial-gradient(closest-side,rgba(127,255,212,.25),transparent);animation:breathe 3s ease-in-out infinite;box-shadow:none}
.title{background:linear-gradient(100deg,#fff 10%,#7fffd4 30%,#b69cff 48%,#ff7fd6 64%,#fff 85%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text}
.chip .gemdot{width:10px;height:10px;transform:rotate(45deg);background:linear-gradient(135deg,#7fffd4,#b69cff);box-shadow:0 0 10px #7fffd4}
.mdot{width:12px;height:12px;border-radius:50%;display:inline-block}
.mdot.gold{background:radial-gradient(circle at 35% 30%,#fff3c4,#ffc43d 55%,#b8791a);box-shadow:0 0 10px rgba(255,196,61,.6)}
.mdot.silver{background:radial-gradient(circle at 35% 30%,#fff,#c9d2e3 55%,#7c879c)}
.mdot.bronze{background:radial-gradient(circle at 35% 30%,#ffe0c4,#d98a4e 55%,#8a4a22)}
/* pause bar */
.pausebar{position:absolute;top:24px;left:50%;transform:translateX(-50%);z-index:12;display:none;align-items:center;gap:8px;padding:8px;border-radius:18px;
  background:rgba(10,12,22,.55);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(16px);animation:fadeUp .5s var(--ease)}
#root.paused .pausebar{display:flex}
.pb-title{font-weight:900;letter-spacing:.3em;font-size:13px;color:var(--faint);padding:0 12px 0 10px;text-transform:uppercase}
.pausebar button{display:flex;align-items:center;gap:8px;border:0;cursor:pointer;padding:10px 16px;border-radius:12px;background:rgba(255,255,255,.08);font-weight:800;font-size:15px;transition:background .2s,transform .35s var(--spring)}
.pausebar button:hover{background:rgba(255,255,255,.18);transform:translateY(-2px)}
.pausebar button.danger:hover{background:rgba(255,70,100,.35)}
.pk{font-size:11px;font-weight:900;padding:3px 7px;border-radius:6px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.25)}
/* level select */
.lv-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:14px}
.lvl-card{position:relative;border-radius:18px;overflow:hidden;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);cursor:pointer;
  transition:transform .45s var(--spring),border-color .3s,box-shadow .35s}
.lvl-card:hover{transform:translateY(-3px);border-color:rgba(255,255,255,.25)}
.lvl-card canvas{display:block;width:100%;height:138px}
.lvl-card.sel{border-color:rgba(200,240,255,.75);box-shadow:0 0 0 2px rgba(127,255,212,.35),0 18px 40px -10px rgba(127,255,212,.35);transform:translateY(-5px)}
.lvl-meta{padding:10px 14px 12px}
.lvl-top{display:flex;align-items:baseline;gap:10px}
.lvl-num{font-weight:900;font-size:13px;letter-spacing:.2em;color:var(--faint)}
.lvl-name{font-weight:800;font-size:17px}
.lvl-stats{display:flex;align-items:center;gap:12px;margin-top:6px;font-size:13px;font-weight:700;color:var(--muted)}
.lvl-stats .gem{color:#7fffd4}
.lvl-lock{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(6,8,16,.72);backdrop-filter:blur(3px);font-weight:800;color:var(--muted);font-size:13px}
.lvl-lock b{font-size:26px}
.lvl-diff{display:flex;gap:3px;margin-left:auto}
.lvl-diff i{width:6px;height:10px;border-radius:2px;background:rgba(255,255,255,.18)}
.lvl-diff i.on{background:linear-gradient(#ff7fd6,#b69cff)}
/* collection */
.coll-head{display:flex;align-items:center;gap:18px;margin-bottom:16px}
.coll-head b{font-size:34px;font-weight:900}
.coll-head span{color:var(--muted);font-weight:700}
.coll-bar{flex:1;height:8px;border-radius:9px;background:rgba(255,255,255,.1);overflow:hidden}
.coll-bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#7fffd4,#b69cff,#ff7fd6);box-shadow:0 0 14px rgba(127,255,212,.6)}
.relic-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.relic-card{position:relative;padding:16px 14px 14px;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);text-align:center;
  animation:rowIn .6s var(--ease) backwards;animation-delay:calc(var(--k)*40ms + 250ms)}
.relic-card .rgem{width:46px;height:46px;margin:4px auto 12px;transform:rotate(45deg);border-radius:9px;background:rgba(255,255,255,.08);border:1px dashed rgba(255,255,255,.25)}
.relic-card.found{background:linear-gradient(160deg,color-mix(in srgb,var(--c) 22%,transparent),rgba(255,255,255,.04));border-color:color-mix(in srgb,var(--c) 55%,transparent)}
.relic-card.found .rgem{border:0;background:linear-gradient(135deg,#fff,var(--c) 45%,#b69cff);box-shadow:0 0 22px var(--c);animation:gemfloat 3s ease-in-out infinite}
@keyframes gemfloat{50%{transform:rotate(45deg) translate(-3px,-3px)}}
.relic-card b{display:block;font-size:14px;font-weight:800}
.relic-card small{display:block;margin-top:4px;font-size:12px;color:var(--faint);font-weight:600}
.medal-row{display:flex;gap:18px;margin:6px 0 16px;font-weight:800;color:var(--muted)}
.medal-row span{display:flex;align-items:center;gap:7px}
/* HUD additions */
.g-hearts{display:flex;gap:6px;margin-top:8px}
.g-hearts i{width:24px;height:22px;background:rgba(255,255,255,.15);clip-path:path('M12 21 L2.5 11.5 A5.4 5.4 0 0 1 12 4.2 A5.4 5.4 0 0 1 21.5 11.5 Z');transition:background .3s}
.g-hearts i.on{background:linear-gradient(#ff8fb0,#ff3d6e);filter:drop-shadow(0 0 6px rgba(255,60,110,.8))}
.g-hearts i.lost{animation:hlost .6s ease}
@keyframes hlost{0%{transform:scale(1.6);background:#fff}100%{transform:none}}
.g-row{display:flex;align-items:center;gap:16px;margin-top:6px}
.g-relics{font-weight:800;font-size:17px;color:#bffff0;text-shadow:0 0 12px rgba(127,255,212,.7)}
.g-relics span{color:#7fffd4}
.g-par{font-size:12px;font-weight:800;letter-spacing:.12em;color:rgba(255,255,255,.55);margin-top:2px}
.g-timer.over{color:#ffb0a0}
.g-hit{position:absolute;inset:0;opacity:0;background:radial-gradient(ellipse at center,transparent 45%,rgba(255,30,60,.55) 100%)}
.g-hit.on{animation:ghit .7s ease-out}
@keyframes ghit{0%{opacity:1}100%{opacity:0}}
.g-relicmsg{position:absolute;left:50%;top:26%;transform:translate(-50%,10px);text-align:center;opacity:0;pointer-events:none}
.g-relicmsg small{display:block;font-weight:900;letter-spacing:.45em;font-size:13px;color:#7fffd4;text-transform:uppercase}
.g-relicmsg b{display:block;font-size:40px;font-weight:900;margin-top:4px;background:linear-gradient(90deg,#7fffd4,#b69cff,#ff7fd6);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 18px rgba(127,255,212,.5))}
.g-relicmsg.show{animation:grelic 3.4s ease forwards}
@keyframes grelic{0%{opacity:0;transform:translate(-50%,20px) scale(.9)}12%{opacity:1;transform:translate(-50%,0) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-14px)}}
.g-medal{width:74px;height:74px;margin:-4px auto 12px;border-radius:50%;display:grid;place-items:center;font-weight:900;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#2a1a05;animation:gpop .8s cubic-bezier(.34,1.56,.64,1)}
.g-medal.gold{background:radial-gradient(circle at 35% 30%,#fff3c4,#ffc43d 55%,#b8791a);box-shadow:0 0 34px rgba(255,196,61,.7)}
.g-medal.silver{background:radial-gradient(circle at 35% 30%,#fff,#c9d2e3 55%,#7c879c);box-shadow:0 0 26px rgba(220,230,255,.5)}
.g-medal.bronze{background:radial-gradient(circle at 35% 30%,#ffe0c4,#d98a4e 55%,#8a4a22);box-shadow:0 0 22px rgba(217,138,78,.5)}
.g-btns{display:flex;gap:12px;justify-content:center}
.g-btn2{background:rgba(255,255,255,.12)!important;color:#fff!important;box-shadow:none!important;border:1px solid rgba(255,255,255,.2)!important}
</style>''')

# ------------------------------------------------------------------ JS: data
rep('''const LEVEL_INFO = [
  { name: 'The Drift' }, { name: 'Nebula Gardens' }, { name: 'The Core' }
];''', '''const LEVEL_INFO = (window.AuroraGame && window.AuroraGame.levels) || [];''')
rep('''  [[110.00, 164.81, 220.00, 261.63], [87.31, 174.61, 220.00, 261.63], [130.81, 196.00, 261.63, 329.63], [98.00, 196.00, 246.94, 293.66]]
];''', '''  [[110.00, 164.81, 220.00, 261.63], [87.31, 174.61, 220.00, 261.63], [130.81, 196.00, 261.63, 329.63], [98.00, 196.00, 246.94, 293.66]],
  [[146.83, 220.00, 293.66, 369.99], [130.81, 196.00, 261.63, 329.63], [123.47, 185.00, 246.94, 311.13], [110.00, 164.81, 220.00, 277.18]],
  [[138.59, 207.65, 261.63, 329.63], [123.47, 185.00, 233.08, 293.66], [116.54, 174.61, 220.00, 277.18], [103.83, 155.56, 207.65, 246.94]],
  [[130.81, 196.00, 246.94, 329.63], [146.83, 220.00, 277.18, 369.99], [164.81, 246.94, 311.13, 392.00], [123.47, 185.00, 246.94, 311.13]]
];''')
rep("let PROG = { unlocked: 1, best: [] };", "let PROG = { unlocked: 1, best: [], medal: [], relics: {} };")
rep("const fmtT = t =>", '''const MEDAL_RANK = { bronze: 1, silver: 2, gold: 3 };
const relicTotal = () => LEVEL_INFO.reduce((n, l) => n + (l.relics || []).length, 0);
const relicFound = () => Object.values(PROG.relics || {}).reduce((n, a) => n + a.filter(Boolean).length, 0);
function updateChips() {
  const rc = document.getElementById('relicChip'), mc = document.getElementById('medalChip');
  if (rc) rc.innerHTML = `<span class="gemdot"></span><b>${relicFound()}</b>/${relicTotal()}`;
  if (mc) mc.innerHTML = `<span class="mdot gold"></span><b>${(PROG.medal || []).filter(m => m === 'gold').length}</b>`;
}
const hex6 = n => '#' + n.toString(16).padStart(6, '0');
// Draws a level's real layout: walls, floor, hazards, lanes, shards, start and portal (found relics only)
function drawLevelMap(cv, i, W_ = 260, H_ = 138) {
  const L = LEVEL_INFO[i]; if (!L) return;
  const dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = W_ * dpr; cv.height = H_ * dpr;
  const g = cv.getContext('2d'); g.scale(dpr, dpr);
  const map = L.map, H = map.length, W = Math.max(...map.map(r => r.length)), pal = L.palette;
  const bg = g.createLinearGradient(0, 0, W_, H_); bg.addColorStop(0, hex6(pal.sky1)); bg.addColorStop(1, hex6(pal.sky2));
  g.fillStyle = bg; g.fillRect(0, 0, W_, H_);
  const au = pal.aur || [.3, 1, .7];
  const glow = g.createRadialGradient(W_ * .5, H_ * 1.2, 10, W_ * .5, H_ * .6, W_ * .7);
  glow.addColorStop(0, `rgba(${au.map(v => v * 255 | 0).join(',')},.25)`); glow.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = glow; g.fillRect(0, 0, W_, H_);
  const s = Math.min((W_ - 18) / W, (H_ - 18) / H), ox = (W_ - W * s) / 2, oy = (H_ - H * s) / 2;
  const found = (PROG.relics && PROG.relics[i]) || [];
  let hIdx = 0;
  const cell = (r, c) => [ox + c * s, oy + r * s];
  const dot = (r, c, col, rad, blur) => { const [x, y] = cell(r, c); g.save(); g.shadowColor = col; g.shadowBlur = blur || 0; g.fillStyle = col; g.beginPath(); g.arc(x + s / 2, y + s / 2, rad, 0, 7); g.fill(); g.restore(); };
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
    const ch = map[r][c] || ' ', [x, y] = cell(r, c);
    if (ch === ' ') continue;
    if (ch === '#') { g.fillStyle = hex6(pal.crystal); g.globalAlpha = .75; g.fillRect(x + .6, y + .6, s - 1.2, s - 1.2); g.globalAlpha = 1; continue; }
    if (ch === '~' || ch === 'M') { g.fillStyle = hex6(pal.trim); g.globalAlpha = .25; g.fillRect(x + s * .3, y + s * .3, s * .4, s * .4); g.globalAlpha = 1; if (ch === 'M') { g.globalAlpha = .7; g.fillRect(x + 1, y + 1, s - 2, s - 2); g.globalAlpha = 1; } continue; }
    g.fillStyle = ch === 'C' ? 'rgba(255,140,60,.55)' : 'rgba(255,255,255,.2)';
    g.fillRect(x + .6, y + .6, s - 1.2, s - 1.2);
    if ('DRX'.includes(ch)) dot(r, c, '#ff4060', s * .26, 6);
    if (ch === 'B') dot(r, c, '#ff7fd6', s * .3, 6);
    if (ch === '*') dot(r, c, '#ffc35a', s * .3, 8);
    if (ch === 'S') { g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.beginPath(); g.arc(x + s / 2, y + s / 2, s * .3, 0, 7); g.stroke(); }
    if (ch === 'E') dot(r, c, hex6(pal.trim), s * .36, 10);
    if (ch === 'H') { if (found[hIdx]) { g.save(); g.translate(x + s / 2, y + s / 2); g.rotate(Math.PI / 4); g.shadowColor = '#7fffd4'; g.shadowBlur = 8; g.fillStyle = '#7fffd4'; g.fillRect(-s * .22, -s * .22, s * .44, s * .44); g.restore(); } hIdx++; }
  }
}''')
rep("let focus = 1;", "let focus = 0;")

# cards: add Collection
rep("{ id: 'play', title: 'Play', sub: 'Journey through the void.', icon: 'play', kind: 'play' },",
    "{ id: 'play', title: 'Play', sub: 'Journey through the void.', icon: 'play', kind: 'play' },\n  { id: 'collection', title: 'Collection', sub: 'Hidden relics you have recovered.', icon: 'gem', kind: 'collection' },")
rep("  play: `<svg viewBox=\"0 0 100 100\">", "  gem: `<svg viewBox=\"0 0 100 100\"><g class=\"gemsvg\"><path d=\"M50 12 L80 38 L50 90 L20 38 Z\" fill=\"#fff\"/><path d=\"M20 38 L80 38 L50 90 Z\" fill=\"#fff\" opacity=\".75\"/><path d=\"M35 38 L50 12 L65 38 L50 90 Z\" fill=\"#fff\" opacity=\".55\"/><path d=\"M20 38 L35 24 L50 12 L65 24 L80 38\" fill=\"none\" stroke=\"#fff\" stroke-width=\"4\" stroke-linejoin=\"round\"/></g></svg>`,\n  play: `<svg viewBox=\"0 0 100 100\">")
rep("const list = d.kind === 'play' ? (inGame", "const list = d.kind === 'collection' ? [{ type: 'collection' }] : d.kind === 'play' ? (inGame")

# tabs -> Collection
rep('''    if (i > 0) {
      toast(`${t.textContent} is coming soon`);
      tabTimer = setTimeout(() => { tabs.forEach(x => x.classList.toggle('active', x === tabs[0])); placeInd(tabs[0]); SFX.change(-1); }, 900);
    }''', '''    if (i === 1) {
      const ci = cards.findIndex(c => c.d.kind === 'collection');
      setFocus(ci);
      tabTimer = setTimeout(() => { if (mode === 'menu') activate(); tabs.forEach(x => x.classList.toggle('active', x === tabs[0])); placeInd(tabs[0]); }, 260);
    }''')

# level select + collection rows
start = s.index('  levels() {')
end = s.index('  start() {', start)
s = s[:start] + r'''  levels() {
    S.level = clamp(S.level || 0, 0, PROG.unlocked - 1);
    const diffBars = i => Array.from({ length: 6 }, (_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('');
    const el = h(`<div class="row col"><div class="rl"><b>Select Level</b><small>Collect the 3 star shards, wake the portal. Relics are hidden off the main path.</small></div>
      <div class="lv-grid">${LEVEL_INFO.map((l, i) => {
        const locked = i >= PROG.unlocked, rel = (PROG.relics[i] || []).filter(Boolean).length, md = PROG.medal[i];
        return `<div class="lvl-card${locked ? ' locked' : ''}"><canvas></canvas>
          <div class="lvl-meta"><div class="lvl-top"><span class="lvl-num">${String(i + 1).padStart(2, '0')}</span><span class="lvl-name">${l.name}</span><span class="lvl-diff">${diffBars(i)}</span></div>
          <div class="lvl-stats">${md ? `<span class="mdot ${md}"></span>` : ''}<span>${PROG.best[i] != null ? 'Best ' + fmtT(PROG.best[i]) : 'Par ' + fmtT(l.par)}</span><span class="gem">◆ ${rel}/${(l.relics || []).length}</span></div></div>
          ${locked ? `<div class="lvl-lock"><b>🔒</b>Clear level ${i} to unlock</div>` : ''}</div>`;
      }).join('')}</div></div>`);
    const tiles = $$('.lvl-card', el);
    tiles.forEach((t, i) => drawLevelMap($('canvas', t), i));
    const refresh = () => tiles.forEach((t, i) => t.classList.toggle('sel', i === S.level));
    const pick = i => {
      if (i >= PROG.unlocked) { SFX.bump(); toast('Clear the previous level to unlock it'); return; }
      if (i === S.level) return;
      const dir = Math.sign(i - S.level) || 1;
      S.level = i; save(); refresh(); SFX.change(dir); vibrate(10);
      if (readyEls) readyEls.st.textContent = `Level ${i + 1} · ${LEVEL_INFO[i].name}`;
    };
    tiles.forEach((t, i) => {
      t.addEventListener('click', e => { e.stopPropagation(); if (i === S.level && i < PROG.unlocked) beginLevel(i); else pick(i); });
      t.addEventListener('pointerenter', () => SFX.hover(i + 2, true));
    });
    refresh();
    return { el, refresh, adjust: d => { const n = S.level + d; if (n < 0 || n >= LEVEL_INFO.length) SFX.bump(); else pick(n); }, press: () => beginLevel(S.level) };
  },
  collection() {
    const total = relicTotal(), found = relicFound();
    const medals = PROG.medal || [];
    const count = m => medals.filter(x => x === m).length;
    let k = 0;
    const el = h(`<div class="row col" style="cursor:default">
      <div class="coll-head"><b>${found}<span style="font-size:20px"> / ${total}</span></b><span>relics recovered</span><div class="coll-bar"><i style="width:${total ? found / total * 100 : 0}%"></i></div></div>
      <div class="medal-row"><span><i class="mdot gold"></i>${count('gold')} Gold</span><span><i class="mdot silver"></i>${count('silver')} Silver</span><span><i class="mdot bronze"></i>${count('bronze')} Bronze</span></div>
      <div class="relic-grid">${LEVEL_INFO.map((l, i) => (l.relics || []).map((name, j) => {
        const got = PROG.relics[i] && PROG.relics[i][j];
        const c = `rgb(${(l.palette.aur || [.3, 1, .7]).map(v => v * 255 | 0).join(',')})`;
        return `<div class="relic-card${got ? ' found' : ''}" style="--c:${c};--k:${k++}"><div class="rgem"></div><b>${got ? name : '???'}</b><small>Level ${i + 1} · ${l.name}</small></div>`;
      }).join('')).join('')}</div></div>`);
    return { el, press: () => SFX.bump(), adjust: () => SFX.bump() };
  },
''' + s[end:]

# ------------------------------------------------------------------ game glue
rep('''    onLevelComplete: (i, t) => {
      const prev = PROG.best[i], newBest = prev == null || t < prev;
      if (newBest) PROG.best[i] = t;''', '''    getRelics: i => PROG.relics[i] || [],
    onRelic: (i, idx) => { (PROG.relics[i] = PROG.relics[i] || [])[idx] = true; saveProg(); updateChips(); },
    onQuit: () => { leaveGame(); },
    onLevelComplete: (i, t, medal) => {
      const prev = PROG.best[i], newBest = prev == null || t < prev;
      if (newBest) PROG.best[i] = t;
      if (!PROG.medal[i] || MEDAL_RANK[medal] > MEDAL_RANK[PROG.medal[i]]) PROG.medal[i] = medal;
      setTimeout(updateChips, 0);''')
rep("onFinish: () => { leaveGame(); toast('You reached the Core — thanks for playing!'); }",
    "onFinish: () => { leaveGame(); toast('You reached the Heart of the Aurora — thanks for playing!'); }")

# pause bar + keys
rep("/* ============================== GAME GLUE ============================== */", '''/* ============================== GAME GLUE ============================== */
document.getElementById('pausebar').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || !inGame || mode === 'game') return;
  if (b.dataset.p === 'resume') resumeGame(); else if (b.dataset.p === 'restart') restartLevel(); else exitToMenu();
});
$$('#pausebar button').forEach((b, i) => b.addEventListener('pointerenter', () => SFX.hover(i, true)));''')
rep('''addEventListener('keydown', e => {
  if (mode === 'game' || mode === 'starting') return;   // the game handles its own keys''', '''addEventListener('keydown', e => {
  if (mode === 'game' || mode === 'starting') return;   // the game handles its own keys
  if (inGame && (mode === 'menu' || mode === 'panel') && !e.repeat) {
    if (e.code === 'KeyR') { e.preventDefault(); restartLevel(); return; }
    if (e.code === 'KeyQ') { e.preventDefault(); exitToMenu(); return; }
  }''')
rep("    ok: b(0), back: b(1), tabPrev: b(4), tabNext: b(5), fastL: b(6), fastR: b(7), options: b(9) || b(8)",
    "    ok: b(0), back: b(1), tabPrev: b(4), tabNext: b(5), fastL: b(6), fastR: b(7), options: b(9) || b(8), tri: b(3), sq: b(2)")
rep('''function handle(k) {
  if (mode === 'game' || mode === 'starting') return;''', '''function handle(k) {
  if (mode === 'game' || mode === 'starting') return;
  if (inGame && (k === 'tri' || k === 'sq') && (mode === 'menu' || mode === 'panel')) { if (k === 'tri') restartLevel(); else exitToMenu(); return; }''')
rep("const PAD_HINTS = { menu: [['t:L1 R1', 'Tabs'], ['t:R3', 'Tilt']], panel: [['t:L2 R2', 'Fast adjust']], modal: [] };",
    "const PAD_HINTS = { menu: [['t:L1 R1', 'Tabs'], ['t:R3', 'Tilt']], panel: [['t:L2 R2', 'Fast adjust']], modal: [] };\nconst PAUSE_HINTS = { pad: [['t:△', 'Restart'], ['t:▢', 'Quit Level']], kb: [['t:R', 'Restart'], ['t:Q', 'Quit Level']] };")
rep("  if (inGame && k === 'menu') list = list.map(([g, l]) => g === 'o' ? [g, 'Resume'] : [g, l]);",
    "  if (inGame && k === 'menu') list = [...(padConnected ? PAUSE_HINTS.pad : PAUSE_HINTS.kb), ...list.map(([g, l]) => g === 'o' ? [g, 'Resume'] : [g, l])];")

# ------------------------------------------------------------------ aurora background (WebGL)
rep("/* ============================== PARTICLES ============================== */", r'''/* ============================== AURORA SKY ============================== */
(() => {
  const cv = document.getElementById('aurora');
  const gl = cv.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
  if (!gl) return;
  const vs = 'attribute vec2 p; void main(){ gl_Position=vec4(p,0.,1.); }';
  const fs = `precision highp float; uniform vec2 res; uniform float t; uniform vec2 m;
    float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
    float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*n(p); p=p*2.03+1.7; a*=.5; } return v; }
    void main(){
      vec2 uv=gl_FragCoord.xy/res; vec2 p=uv; p.x*=res.x/res.y;
      vec3 col=mix(vec3(.012,.016,.04),vec3(.04,.03,.1),uv.y);
      col+=vec3(.25,.12,.4)*fbm(p*1.6+vec2(t*.01,0.))*.25;
      // stars
      vec2 sp=p*vec2(160.,160.); vec2 id=floor(sp); float s=h(id);
      col+=vec3(.85,.9,1.)*step(.9965,s)*smoothstep(.5,.0,length(fract(sp)-.5))*(.5+.5*sin(t*1.5+s*90.));
      // aurora curtains (colours of the logo: mint, lavender, pink, cyan)
      for(int i=0;i<4;i++){
        float fi=float(i);
        float x=p.x*1.1+fi*.43+m.x*.04;
        float edge=.46+fi*.06+.13*sin(x*1.7+t*.12+fi*1.3)+.05*sin(x*4.1-t*.2+fi*2.)+.02*fbm(vec2(x*3.,t*.1));
        float d=uv.y-edge;
        float curtain=smoothstep(-.03,.02,d)*exp(-max(d,0.)*(2.6+fi*1.1));
        float rays=.3+.7*pow(n(vec2(x*26.+fi*9.,t*.35+fi)),1.4);
        vec3 c=mix(vec3(.3,1.,.72),vec3(.7,.58,1.),clamp(d*2.4,0.,1.));
        c=mix(c,vec3(1.,.5,.85),clamp(fi*.28-.1,0.,1.)*clamp(d*3.,0.,1.));
        c=mix(c,vec3(.5,.85,1.),step(2.5,fi)*.5);
        col+=c*curtain*rays*(.62-fi*.1);
      }
      // distant ridge
      float ridge=.13+.05*fbm(vec2(p.x*2.2,3.))+.025*n(vec2(p.x*9.,1.));
      float rm=smoothstep(ridge+.004,ridge-.004,uv.y);
      col=mix(col,vec3(.01,.012,.025)+col*.08,rm);
      col+=vec3(.3,1.,.72)*.06*exp(-abs(uv.y-ridge)*40.)*(1.-rm);
      gl_FragColor=vec4(col,1.);
    }`;
  const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(pr, 'res'), uT = gl.getUniformLocation(pr, 't'), uM = gl.getUniformLocation(pr, 'm');
  const fit = () => { const k = .55; cv.width = Math.max(2, cv.clientWidth * k | 0); cv.height = Math.max(2, cv.clientHeight * k | 0); gl.viewport(0, 0, cv.width, cv.height); };
  addEventListener('resize', fit); fit();
  const t0 = performance.now();
  const draw = now => {
    requestAnimationFrame(draw);
    if (mode === 'game' || root.classList.contains('paused')) return;
    gl.uniform2f(uRes, cv.width, cv.height); gl.uniform1f(uT, (now - t0) / 1000 * (S.reduceMotion ? .3 : 1)); gl.uniform2f(uM, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  requestAnimationFrame(draw);
})();
updateChips();

/* ============================== PARTICLES ============================== */''')

io.open(p, 'w', encoding='utf-8').write(s)
print('patched OK')
