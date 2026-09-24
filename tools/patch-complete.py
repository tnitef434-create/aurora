p = 'src/game.js'
s = open(p, encoding='utf-8').read()


def rep(a, b):
    global s
    assert a in s, a[:120]
    s = s.replace(a, b, 1)


# focus state + helpers
rep("  const fmtTime = t =>", """  // level-complete screen: 0 = Main Menu, 1 = Continue
  let cFocus = 1, cStickPrev = 0;
  function setCFocus(i, silent) {
    i = clamp(i, 0, 1);
    if (i === cFocus && !silent) { A.tone({ f: 190, to: 130, type: 'triangle', dur: .08, vol: .08, send: 0 }); return; }
    cFocus = i;
    H.complete.querySelector('[data-a="menu"]').classList.toggle('focus', i === 0);
    H.complete.querySelector('[data-a="next"]').classList.toggle('focus', i === 1);
    if (!silent) { A.tone({ f: i ? 1046.5 : 880, dur: .09, vol: .06, send: .15 }); rumble(30, 0, .25); }
  }
  function activateComplete() { if (cFocus === 0) quitFromComplete(); else continueAfterComplete(); }
  const fmtTime = t =>""")

# show glyphs on the buttons + default focus
rep("""    H.complete.querySelector('[data-a="next"]').textContent = T('cont');
    H.complete.querySelector('[data-a="menu"]').textContent = T('menu');
    H.complete.classList.add('show');""", """    const padNow = !!getPad();
    H.complete.querySelector('[data-a="next"]').innerHTML = `<span class="gk">${padNow ? '✕' : 'Enter'}</span>${T('cont')}`;
    H.complete.querySelector('[data-a="menu"]').innerHTML = `<span class="gk">${padNow ? '○' : 'Esc'}</span>${T('menu')}`;
    setCFocus(1, true);
    // anything still held (e.g. the jump that carried you into the portal) must be released first
    const pp = getPad(); padPrev = pp ? pp.buttons.map(x => x.pressed || x.value > .5) : [];
    cStickPrev = 0;
    H.complete.classList.add('show');""")
rep("H.complete.querySelector('[data-a=\"next\"]').addEventListener('click', () => continueAfterComplete());",
    "H.complete.querySelector('[data-a=\"next\"]').addEventListener('click', () => continueAfterComplete());\n"
    "  H.complete.querySelector('[data-a=\"next\"]').addEventListener('pointerenter', () => { if (state === 'complete') setCFocus(1); });\n"
    "  H.complete.querySelector('[data-a=\"menu\"]').addEventListener('pointerenter', () => { if (state === 'complete') setCFocus(0); });")

# keyboard
rep("""        if (['Enter', 'Space', 'KeyE'].includes(k)) { e.preventDefault(); continueAfterComplete(); }
        if (['Escape', 'KeyQ', 'Backspace'].includes(k)) { e.preventDefault(); quitFromComplete(); }""",
    """        if (['ArrowLeft', 'KeyA'].includes(k)) { e.preventDefault(); setCFocus(0); }
        if (['ArrowRight', 'KeyD'].includes(k)) { e.preventDefault(); setCFocus(1); }
        if (['Enter', 'Space', 'KeyE'].includes(k)) { e.preventDefault(); activateComplete(); }
        if (['Escape', 'KeyQ', 'Backspace'].includes(k)) { e.preventDefault(); quitFromComplete(); }""")

# controller: d-pad / stick to choose, Cross to confirm, Circle = main menu
rep("""    if (state === 'complete') {
      if (edge(0)) continueAfterComplete();
      else if (edge(1)) quitFromComplete();""", """    if (state === 'complete') {
      const sx = Math.abs(lx) > .55 ? Math.sign(lx) : 0;
      if (edge(14) || (sx < 0 && cStickPrev >= 0)) setCFocus(0);
      else if (edge(15) || (sx > 0 && cStickPrev <= 0)) setCFocus(1);
      cStickPrev = sx;
      if (edge(0)) activateComplete();
      else if (edge(1)) quitFromComplete();""")

# the complete screen must keep reading the pad even while the game world is frozen
open(p, 'w', encoding='utf-8').write(s)
print('ok')
