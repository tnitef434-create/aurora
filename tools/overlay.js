  /* ---------- records / collection overlay (touchpad or Tab) ---------- */
  const ov = { open: false, tab: 0, relockAfter: false };
  const ovEl = hud.querySelector('.g-ov'), ovBody = hud.querySelector('.ov-body');
  hud.querySelectorAll('.ov-tabs button').forEach(b => b.addEventListener('click', () => setOvTab(+b.dataset.t)));
  ovEl.addEventListener('click', e => { if (e.target === ovEl) closeOverlay(); });
  function openOverlay() {
    if (ov.open || state !== 'playing' || paused) return;
    ov.open = true; keys.clear();
    ov.relockAfter = !!document.pointerLockElement;
    if (document.pointerLockElement) { suppressUnlockPause = true; document.exitPointerLock(); }
    H.lock.classList.remove('show');
    renderOverlay();
    hud.classList.add('ov-on');
    A.tone({ f: 523.25, to: 784, type: 'triangle', dur: .12, vol: .07, send: .3 }); A.noise({ dur: .3, from: 400, to: 4000, vol: .04, send: .3 });
    setHum(0);
  }
  function closeOverlay(silent) {
    if (!ov.open) return;
    ov.open = false; hud.classList.remove('ov-on'); lastT = performance.now();
    if (!silent) { A.tone({ f: 784, to: 523.25, type: 'triangle', dur: .12, vol: .06, send: .3 }); if (running && !paused && ov.relockAfter && !getPad()) requestLock(); }
  }
  function setOvTab(t) {
    if (t === ov.tab) { A.tone({ f: 190, to: 130, type: 'triangle', dur: .08, vol: .08, send: 0 }); return; }
    ov.tab = t; renderOverlay();
    A.tone({ f: t ? 987.77 : 880, to: t ? 1174.66 : 739.99, type: 'triangle', dur: .09, vol: .07, send: .15 });
    rumble(40, 0, .3);
  }
  const medalDot = m => m ? `<i class="ov-medal ${m}"></i>` : '';
  function renderOverlay() {
    const prog = (getProgress && getProgress()) || {};
    hud.querySelector('.ov-keys').innerHTML = getPad()
      ? `<b>L1</b><b>R1</b> Switch <span></span><b>Touchpad</b> Close`
      : `<b>←</b><b>→</b> Switch <span></span><b>Tab</b> Close`;
    hud.querySelectorAll('.ov-tabs button').forEach(b => b.classList.toggle('on', +b.dataset.t === ov.tab));
    hud.querySelector('.ov-ind').style.transform = `translateX(${ov.tab * 100}%)`;
    ovBody.classList.remove('swap'); void ovBody.offsetWidth; ovBody.classList.add('swap');
    ovBody.innerHTML = ov.tab === 0 ? recordsHTML(prog) : collectionHTML(prog);
  }
  function recordsHTML(prog) {
    const i = levelIndex, def = LEVELS[i];
    const runs = ((prog.runs || {})[i] || []).slice(-10);
    const st = (prog.stats || {})[i] || { n: 0, sum: 0, att: 0, deaths: 0 };
    const best = (prog.best || [])[i], bestMedal = (prog.medal || [])[i];
    const avg = st.n ? st.sum / st.n : null;
    const last = runs.length ? runs[runs.length - 1] : null;
    const f = v => v == null ? '—' : fmtTime(v);
    const tiles = [
      ['All-time best', f(best), medalDot(bestMedal), 'hero'],
      ['Average', f(avg), avg != null && best != null ? `<em>+${(avg - best).toFixed(1)}s vs best</em>` : ''],
      ['Last run', f(last && last.t), last ? medalDot(last.m) : ''],
      ['This run', `<span class="ov-live">${fmtTime(time)}</span>`, `<em>${P.shardsTaken}/3 shards</em>`],
      ['Clears', st.n || 0, ''],
      ['Attempts', st.att || 0, st.att ? `<em>${Math.round((st.n || 0) / st.att * 100)}% cleared</em>` : ''],
      ['Deaths', st.deaths || 0, `<em>${P.deathsRun || 0} this run</em>`],
      ['Par', fmtTime(def.par), `<em>gold at or under</em>`],
    ];
    let chart;
    if (!runs.length) chart = `<div class="ov-empty">No finished runs yet<span>Reach the portal to set your first time.</span></div>`;
    else {
      const W = 520, Hc = 150, top = Math.max(def.par * 1.6, ...runs.map(r => r.t)) * 1.1;
      const bw = W / 10, y = v => Hc - v / top * Hc;
      const bars = runs.map((r, k) => {
        const x = k * bw + bw * .18, isBest = best != null && Math.abs(r.t - best) < 1e-6;
        return `<g class="bar ${r.m || ''}${isBest ? ' best' : ''}${k === runs.length - 1 ? ' latest' : ''}" style="--d:${k * 45}ms">
          <rect x="${x}" y="${y(r.t)}" width="${bw * .64}" height="${Hc - y(r.t)}" rx="5"/>
          <text x="${x + bw * .32}" y="${y(r.t) - 6}">${r.t.toFixed(1)}</text>
          <text class="lbl" x="${x + bw * .32}" y="${Hc + 16}">#${((st.n || runs.length) - runs.length) + k + 1}</text></g>`;
      }).join('');
      chart = `<svg class="ov-chart" viewBox="0 -18 ${W} ${Hc + 38}" preserveAspectRatio="none">
        <line class="par" x1="0" x2="${W}" y1="${y(def.par)}" y2="${y(def.par)}"/><text class="parl" x="${W - 2}" y="${y(def.par) - 5}">PAR</text>
        ${avg != null ? `<line class="avg" x1="0" x2="${W}" y1="${y(avg)}" y2="${y(avg)}"/><text class="avgl" x="${W - 2}" y="${y(avg) + 13}">AVG</text>` : ''}
        ${bars}</svg>`;
    }
    const levelsList = LEVELS.map((l, k) => {
      const b = (prog.best || [])[k], m = (prog.medal || [])[k], n = ((prog.stats || {})[k] || {}).n || 0;
      return `<div class="ov-lv${k === i ? ' cur' : ''}"><span class="n">${String(k + 1).padStart(2, '0')}</span><span class="nm">${l.name}</span>${medalDot(m)}<b>${b != null ? fmtTime(b) : '—'}</b><small>${n}×</small></div>`;
    }).join('');
    return `<div class="ov-rec">
      <div class="ov-title"><small>${T('level')} ${i + 1}</small><h2>${def.name}</h2></div>
      <div class="ov-tiles">${tiles.map(([a, b, c, cls], k) => `<div class="ov-tile ${cls || ''}" style="--d:${k * 35}ms"><span>${a}</span><b>${b}</b>${c || ''}</div>`).join('')}</div>
      <div class="ov-cols"><div class="ov-chartbox"><div class="ov-sub">Last ${runs.length || 10} runs</div>${chart}</div>
      <div class="ov-levels"><div class="ov-sub">All levels · best</div>${levelsList}</div></div></div>`;
  }
  function collectionHTML(prog) {
    const rel = prog.relics || {};
    let found = 0, total = 0, k = 0;
    const cards = LEVELS.map((l, li) => (l.relics || []).map((name, j) => {
      total++;
      const live = li === levelIndex && L && L.relics.some(r => r.idx === j && r.taken);
      const got = (rel[li] && rel[li][j]) || live;
      if (got) found++;
      const col = `rgb(${(l.palette.aur || [.3, 1, .7]).map(v => v * 255 | 0).join(',')})`;
      return `<div class="ov-relic${got ? ' got' : ''}${li === levelIndex ? ' here' : ''}" style="--c:${col};--d:${(k++) * 30}ms">
        <div class="ov-ricon"><img src="relics/relic_${l.relicIds ? l.relicIds[j] : li * 2 + j}.png" alt=""></div>
        <b>${got ? name : '???'}</b><small>${String(li + 1).padStart(2, '0')} · ${l.name}</small></div>`;
    }).join('')).join('');
    const pct = total ? found / total : 0;
    return `<div class="ov-col">
      <div class="ov-colhead"><svg class="ov-ring" viewBox="0 0 64 64"><circle cx="32" cy="32" r="27"/><circle class="fg" cx="32" cy="32" r="27" style="stroke-dasharray:${(pct * 169.6).toFixed(1)} 169.6"/></svg>
        <div><b>${found}<span> / ${total}</span></b><small>relics recovered · this level's relics are highlighted</small></div></div>
      <div class="ov-rgrid">${cards}</div></div>`;
  }
