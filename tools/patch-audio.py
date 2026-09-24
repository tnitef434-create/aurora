p = 'index.html'
s = open(p, encoding='utf-8').read()


def rep(a, b):
    global s
    assert a in s, a[:120]
    s = s.replace(a, b, 1)


# 1) bigger audio buffer: the game renders heavy 3D on the main thread, so the lowest-latency
#    setting glitches. 'playback' trades a few ms of latency for stutter-free audio.
rep("const ctx = this.ctx = new C();",
    "let ctx;\n    try { ctx = new C({ latencyHint: 'playback' }); } catch (e) { ctx = new C(); }\n    this.ctx = ctx; this.voices = 0;")

# 2) one shared, shorter reverb instead of two long ones (convolution is the most expensive node)
rep("""    const ir = this.impulse(2.8, 3.2);
    ['sfx', 'music'].forEach(k => {
      const g = ctx.createGain(); g.connect(this.master); this.bus[k] = g;
      const cv = ctx.createConvolver(); cv.buffer = ir; cv.connect(g); this.rev[k] = cv;
    });""", """    const verb = ctx.createConvolver(); verb.buffer = this.impulse(2.1, 3.4); verb.connect(this.master);
    ['sfx', 'music'].forEach(k => {
      const g = ctx.createGain(); g.connect(this.master); this.bus[k] = g;
      const send = ctx.createGain(); send.connect(verb); this.rev[k] = send;   // follows the bus volume
    });""")
rep("    this.bus.music.gain.setTargetAtTime(Math.pow(S.music / 100, 1.6) * .9, t, .15);",
    "    this.bus.music.gain.setTargetAtTime(Math.pow(S.music / 100, 1.6) * .9, t, .15);\n"
    "    this.rev.sfx.gain.setTargetAtTime(Math.pow(S.sfx / 100, 1.6), t, .04);\n"
    "    this.rev.music.gain.setTargetAtTime(Math.pow(S.music / 100, 1.6) * .9, t, .15);")

# 3) voice cap: never let sound effects pile up into hundreds of live nodes
rep("""  tone({ f = 440, to = null, type = 'sine', at = 0, dur = .12, vol = .15, a = .004, send = .25, det = 0, bus = 'sfx' }) {
    if (!this.ctx) return;""", """  tone({ f = 440, to = null, type = 'sine', at = 0, dur = .12, vol = .15, a = .004, send = .25, det = 0, bus = 'sfx' }) {
    if (!this.ctx || (bus === 'sfx' && this.voices > 40)) return;""")
rep("""  noise({ at = 0, dur = .3, vol = .1, from = 500, to = 4000, q = 1.1, send = .3, peak = .4 }) {
    if (!this.ctx) return;""", """  noise({ at = 0, dur = .3, vol = .1, from = 500, to = 4000, q = 1.1, send = .3, peak = .4 }) {
    if (!this.ctx || this.voices > 40) return;""")
rep("    o.start(t); o.stop(t + dur + .05);",
    "    o.start(t); o.stop(t + dur + .05);\n    if (bus === 'sfx') { this.voices++; o.onended = () => { this.voices--; o.disconnect(); g.disconnect(); }; }")
rep("    src.start(t, Math.random() * .5); src.stop(t + dur + .05);",
    "    src.start(t, Math.random() * .5); src.stop(t + dur + .05);\n    this.voices++; src.onended = () => { this.voices--; src.disconnect(); bp.disconnect(); g.disconnect(); };")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
