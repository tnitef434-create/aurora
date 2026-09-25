// Trailer timeline, in seconds. The soundtrack (audio.js) reads the same numbers, so picture and sound stay locked.
// hit: seconds into the shot where an impact lands (camera kick + boom); flash: how fast the white flash fades.
export const SHOTS = [
  { fn: 'ident',     at: 0,    len: 3.6 },
  { fn: 'descent',   at: 3.6,  len: 4.4, fadeIn: 1.2 },
  { fn: 'run',       at: 8.0,  len: 3.4, hit: 0 },
  { fn: 'shard',     at: 11.4, len: 2.4, hit: 1.15, flash: 7 },
  { fn: 'portal',    at: 13.8, len: 2.6, hit: .35, flash: 5, fadeOut: .25 },
  { fn: 'grove',     at: 16.4, len: 4.2, hit: 0, fadeIn: .5 },
  { fn: 'groveHero', at: 20.6, len: 2.0, hit: .4 },
  { fn: 'relics',    at: 22.6, len: 4.5, hit: 0, flash: 9 },
  { fn: 'leap',      at: 27.1, len: 2.2, fadeOut: .5 },
  { fn: 'title',     at: 29.3, len: 6.4, hit: 0, flash: 2.5, fadeOut: 1.2 },
];
export const DURATION = 35.7;
// the relic montage cuts on every half-second beat
export const BEATS = Array.from({ length: 9 }, (_, i) => 22.6 + i * .5);

const U_MARK = `<svg viewBox="-7 -9 46 46"><path d="M5 5v15c0 6 4 9 9 9s9-3 9-9v-3" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="square"/><path d="m20 2 9 6-9 6z" fill="#ff6339"/></svg>`;

export const TEXT = [
  { at: .5, len: 2.8, inT: .9, outT: .6, cls: 'ident', zoom: .04, html: `${U_MARK}<div><b>UNPAUSED</b><span>presents</span></div>` },
  { at: 4.4, len: 3.2, inT: .8, cls: 'line', track: [.5, .32], html: 'Beyond the last star…' },
  { at: 8.4, len: 2.7, cls: 'line', track: [.5, .32], html: 'one light keeps running' },
  { at: 11.6, len: 2.0, inT: .25, cls: 'line', track: [.4, .3], html: 'Gather the star shards' },
  { at: 14.1, len: 2.2, inT: .25, cls: 'line', track: [.4, .3], html: 'Wake the portals' },
  { at: 16.9, len: 3.6, inT: .6, cls: 'chapter', track: [.3, .2], html: '<small>Chapter 2</small>Whispering Grove' },
  { at: 22.7, len: 2.2, inT: .2, cls: 'line', track: [.4, .3], html: 'Find ancient relics' },
  { at: 24.9, len: 2.1, inT: .2, cls: 'line', track: [.4, .3], html: 'Wield their power' },
  { at: 27.3, len: 1.8, inT: .3, cls: 'line', track: [.4, .3], html: 'Don’t look down.' },
  { at: 29.3, len: 6.4, inT: .05, outT: 1.2, cls: 'title', zoom: .05, track: [.62, .28], html: 'AURORA' },
  { at: 31.3, len: 4.4, inT: .6, outT: 1.2, cls: 'end', zoom: 0, html: `<p>Play free in your browser</p><div class="lock">${U_MARK}<b>unpaused.online</b></div>` },
];
