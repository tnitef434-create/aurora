// Trailer soundtrack, synthesized offline with Web Audio so every hit lands exactly on its cut.
// renderSoundtrack() resolves to a 16-bit stereo WAV as a base64 string.
import { SHOTS, BEATS, DURATION } from './timeline.js';

const RATE = 48000;
const hz = n => 440 * Math.pow(2, (n - 69) / 12); // midi note → frequency
const shotAt = fn => SHOTS.find(s => s.fn === fn).at;

export async function renderSoundtrack() {
  const ac = new OfflineAudioContext(2, Math.ceil((DURATION + .5) * RATE), RATE);
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  // master: glue compressor and a big synthetic hall
  const master = ac.createGain(); master.gain.value = .9;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .25;
  master.connect(comp); comp.connect(ac.destination);
  const hall = ac.createConvolver();
  { const len = RATE * 3.4, ir = ac.createBuffer(2, len, RATE);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (rnd() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    hall.buffer = ir; }
  const wet = ac.createGain(); wet.gain.value = .32; hall.connect(wet); wet.connect(master);
  const bus = (dry = 1, rev = .5) => { const g = ac.createGain(); const d = ac.createGain(); d.gain.value = dry; const r = ac.createGain(); r.gain.value = rev; g.connect(d); d.connect(master); g.connect(r); r.connect(hall); return g; };

  const noiseBuf = ac.createBuffer(1, RATE * 4, RATE);
  { const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1; }
  const noise = (t, dur) => { const n = ac.createBufferSource(); n.buffer = noiseBuf; n.start(t, rnd() * 2); n.stop(t + dur); return n; };
  const env = (g, t, a, peak, hold, rel) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.setValueAtTime(peak, t + a + hold); g.gain.exponentialRampToValueAtTime(.0001, t + a + hold + rel); };

  // ---- sustained pad: detuned saws through a slow lowpass (the "bed" under everything)
  function pad(t0, t1, notes, level, cutoff = 900, out = bus(.7, .8)) {
    const g = ac.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(level, t0 + Math.min(1.5, (t1 - t0) / 3)); g.gain.setValueAtTime(level, Math.max(t0, t1 - 1)); g.gain.linearRampToValueAtTime(0, t1);
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(cutoff * .4, t0); f.frequency.linearRampToValueAtTime(cutoff, t1); f.Q.value = .7;
    g.connect(f); f.connect(out);
    for (const n of notes) for (const det of [-9, 0, 8]) {
      const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(n); o.detune.value = det;
      const p = ac.createStereoPanner(); p.pan.value = det / 14; const og = ac.createGain(); og.gain.value = 1 / (notes.length * 3);
      o.connect(og); og.connect(p); p.connect(g); o.start(t0); o.stop(t1 + .1);
    }
  }
  // ---- sub drone
  function sub(t0, t1, n, level) {
    const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = hz(n);
    const g = ac.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(level, t0 + 1); g.gain.setValueAtTime(level, t1 - .6); g.gain.linearRampToValueAtTime(0, t1);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t1);
  }
  // ---- cinematic boom: pitch-dropping sine + noise thump
  function boom(t, size = 1) {
    const o = ac.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(32, t + .7 * size);
    const g = ac.createGain(); env(g, t, .004, .95 * Math.min(size, 1.2), .05, 1.4 * size);
    o.connect(g); g.connect(bus(1, .35)); o.start(t); o.stop(t + 2.2 * size);
    const n = noise(t, .6), f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(2400, t); f.frequency.exponentialRampToValueAtTime(120, t + .45);
    const ng = ac.createGain(); env(ng, t, .002, .5 * size, 0, .5); n.connect(f); f.connect(ng); ng.connect(bus(1, .6));
  }
  // ---- braam: the big brassy trailer blast
  function braam(t, dur, notes, level = .5) {
    const out = bus(.9, .7);
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 3;
    f.frequency.setValueAtTime(180, t); f.frequency.exponentialRampToValueAtTime(1600, t + .12); f.frequency.exponentialRampToValueAtTime(420, t + dur);
    const g = ac.createGain(); env(g, t, .03, level, dur * .4, dur * .6);
    const sh = ac.createWaveShaper(); const curve = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; curve[i] = Math.tanh(x * 2.2); } sh.curve = curve;
    f.connect(sh); sh.connect(g); g.connect(out);
    for (const n of notes) for (const det of [-14, -4, 6, 15]) {
      const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(n); o.detune.value = det;
      const og = ac.createGain(); og.gain.value = 1.4 / (notes.length * 4); o.connect(og); og.connect(f); o.start(t); o.stop(t + dur + .2);
    }
  }
  // ---- taiko-ish drum
  function drum(t, v = 1, pitch = 1) {
    const o = ac.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(170 * pitch, t); o.frequency.exponentialRampToValueAtTime(52 * pitch, t + .16);
    const g = ac.createGain(); env(g, t, .002, .8 * v, .01, .42); o.connect(g); g.connect(bus(1, .45)); o.start(t); o.stop(t + .6);
    const n = noise(t, .12), f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900 * pitch; f.Q.value = .8;
    const ng = ac.createGain(); env(ng, t, .001, .35 * v, 0, .09); n.connect(f); f.connect(ng); ng.connect(bus(1, .4));
  }
  // ---- metallic hit / cymbal
  function crash(t, len = 2.4, v = .22) {
    const n = noise(t, len), f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 5200;
    const g = ac.createGain(); env(g, t, .002, v, .02, len); n.connect(f); f.connect(g); g.connect(bus(.8, .8));
  }
  // ---- riser: filtered noise sweep + climbing tone
  function riser(t0, t1, v = .3) {
    const n = noise(t0, t1 - t0), f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 4;
    f.frequency.setValueAtTime(300, t0); f.frequency.exponentialRampToValueAtTime(9000, t1);
    const g = ac.createGain(); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(v, t1 - .02); g.gain.linearRampToValueAtTime(0, t1);
    n.connect(f); f.connect(g); g.connect(bus(.9, .6));
    const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(hz(38), t0); o.frequency.exponentialRampToValueAtTime(hz(74), t1);
    const lf = ac.createBiquadFilter(); lf.type = 'lowpass'; lf.frequency.value = 2200;
    const og = ac.createGain(); og.gain.setValueAtTime(.0001, t0); og.gain.exponentialRampToValueAtTime(v * .35, t1 - .02); og.gain.linearRampToValueAtTime(0, t1);
    o.connect(lf); lf.connect(og); og.connect(bus(.8, .5)); o.start(t0); o.stop(t1);
  }
  // ---- chime (star shards, relics)
  function chime(t, n, v = .18, pan = 0) {
    const out = bus(.7, 1.1);
    const p = ac.createStereoPanner(); p.pan.value = pan; p.connect(out);
    for (const [mul, a, d] of [[1, 1, 2.2], [2.01, .45, 1.2], [3.02, .22, .7], [5.4, .08, .35]]) {
      const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = hz(n) * mul;
      const g = ac.createGain(); env(g, t, .003, v * a, 0, d); o.connect(g); g.connect(p); o.start(t); o.stop(t + d + .1);
    }
  }
  // ---- whoosh
  function whoosh(t, len = .9, v = .3) {
    const n = noise(t, len), f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(4000, t + len * .7); f.frequency.exponentialRampToValueAtTime(900, t + len);
    const g = ac.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + len * .7); g.gain.exponentialRampToValueAtTime(.0001, t + len);
    n.connect(f); f.connect(g); g.connect(bus(.9, .5));
  }

  // key of D minor. midi: D2=38 A2=45 D3=50 F3=53 A3=57 D4=62 F4=65 A4=69 C5=72 D5=74
  const T = { descent: shotAt('descent'), run: shotAt('run'), shard: shotAt('shard'), portal: shotAt('portal'), grove: shotAt('grove'), groveHero: shotAt('groveHero'), relics: shotAt('relics'), leap: shotAt('leap'), title: shotAt('title') };

  // 1. Unpaused ident: one deep hit and a bright ping
  boom(.5, 1.1); chime(.5, 74, .16); crash(.5, 3, .08);
  sub(.5, T.descent + .5, 26, .25);

  // 2. descent: dark pad, heartbeat thumps growing
  pad(T.descent - .4, T.run, [50, 53, 57, 62], .32, 1100);
  sub(T.descent, T.run, 38, .3);
  for (let t = T.descent + .5, k = 0; t < T.run - .1; t += 1, k++) { drum(t, .35 + k * .08, .6); drum(t + .22, .2 + k * .05, .6); }
  riser(T.run - 1.6, T.run, .22);

  // 3. run: BRAAM, then a driving drum pattern at 120 bpm
  braam(T.run, 2.2, [26, 38, 45, 50], .55); boom(T.run, 1); crash(T.run, 2.8, .18);
  pad(T.run, T.portal + 2.6, [50, 53, 58, 62], .26, 1600); // D F Bb D → tension
  sub(T.run, T.portal + 2.6, 34, .28);
  for (let i = 0; i < 16; i++) {
    const t = T.run + .25 + i * .25; if (t > T.shard + 1.1) break;
    const accent = i % 4 === 0 ? 1 : i % 2 === 0 ? .6 : .38; drum(t, accent, i % 4 === 3 ? 1.3 : 1);
  }
  for (let i = 0; i < 8; i++) chime(T.run + .5 + i * .5, [62, 65, 69, 72, 69, 65, 62, 57][i], .05, (i % 2 ? .4 : -.4));

  // 4. shard: silence-snap, then a shimmering golden hit
  chime(T.shard + 1.15, 74, .28); chime(T.shard + 1.15, 81, .15, .3); chime(T.shard + 1.28, 86, .12, -.3);
  boom(T.shard + 1.15, .7); whoosh(T.shard + .35, .8, .22);

  // 5. portal: whoosh into a huge boom and a rising swell
  whoosh(T.portal - .2, .6, .3); boom(T.portal + .35, 1.2); braam(T.portal + .35, 1.8, [33, 45, 52, 57], .5); crash(T.portal + .35, 3, .2);
  riser(T.portal + 1.1, T.grove, .18);

  // 6. Whispering Grove: warm lift to the relative major, forest chirps
  pad(T.grove, T.relics + .2, [46, 53, 58, 62, 65], .3, 2000); // Bb major add9 — open, hopeful
  sub(T.grove, T.relics, 34, .26);
  boom(T.grove, .9); chime(T.grove, 77, .12);
  for (let i = 0; i < 14; i++) { const t = T.grove + .4 + rnd() * 5.8; chime(t, 91 + Math.floor(rnd() * 6), .025 + rnd() * .02, rnd() * 1.6 - .8); }
  for (let i = 0; i < 12; i++) drum(T.grove + 1 + i * .5, i % 2 ? .25 : .45, .8);
  drum(T.groveHero + .4, 1, .9); whoosh(T.groveHero + .2, .9, .3);
  riser(T.groveHero + .6, T.relics, .25);

  // 7. relic montage: a braam every beat, drums doubling up
  pad(T.relics, T.leap, [50, 53, 57, 60, 65], .28, 2400); sub(T.relics, T.leap, 38, .3);
  BEATS.forEach((t, i) => {
    boom(t, .55); drum(t, 1, 1); drum(t + .25, .55, 1.15);
    if (i % 2 === 0) braam(t, .45, [38, 45, 50 + (i % 4 === 0 ? 0 : 3)], .32);
    chime(t, [74, 77, 81, 79, 84, 81, 86, 84, 89][i], .09, i % 2 ? .3 : -.3);
  });
  for (let i = 0; i < 8; i++) drum(T.leap - .5 + i * .0625, .3 + i * .08, 1.2); // fill

  // 8. leap: everything drops away, one long breath and a rising scream into the title
  sub(T.leap, T.title, 26, .22);
  whoosh(T.leap + .1, 1.6, .22);
  riser(T.leap, T.title, .4);
  // the "suck": reversed swell right before the slam
  { const n = noise(T.title - .5, .5), f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(400, T.title - .5); f.frequency.exponentialRampToValueAtTime(8000, T.title);
    const g = ac.createGain(); g.gain.setValueAtTime(.0001, T.title - .5); g.gain.exponentialRampToValueAtTime(.35, T.title - .01); g.gain.linearRampToValueAtTime(0, T.title);
    n.connect(f); f.connect(g); g.connect(master); }

  // 9. AURORA: the biggest hit, then a wide shimmering Dm(add9) that rings out
  boom(T.title, 1.5); boom(T.title + .02, 1); braam(T.title, 3.4, [26, 38, 45, 50, 57], .6); crash(T.title, 5, .26);
  pad(T.title, DURATION, [50, 57, 62, 64, 65, 69], .34, 2600);
  sub(T.title, DURATION, 38, .3);
  [74, 76, 77, 81, 86].forEach((n, i) => chime(T.title + .4 + i * .35, n, .1, i % 2 ? .45 : -.45));
  boom(T.title + 2.0, .6); chime(T.title + 2.0, 86, .14);

  const buf = await ac.startRendering();
  // encode 16-bit PCM WAV
  const L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length;
  const out = new DataView(new ArrayBuffer(44 + n * 4));
  const str = (o, s) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF'); out.setUint32(4, 36 + n * 4, true); str(8, 'WAVEfmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 2, true);
  out.setUint32(24, RATE, true); out.setUint32(28, RATE * 4, true); out.setUint16(32, 4, true); out.setUint16(34, 16, true); str(36, 'data'); out.setUint32(40, n * 4, true);
  for (let i = 0; i < n; i++) { out.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true); out.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i])) * 32767, true); }
  const bytes = new Uint8Array(out.buffer); let bin = '';
  for (let i = 0; i < bytes.length; i += 32768) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 32768));
  return btoa(bin);
}
