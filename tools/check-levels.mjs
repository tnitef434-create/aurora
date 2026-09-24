// Verifies every level is solvable: all shards + the portal reachable from S.
// Moves: walk to adjacent floor; jump over exactly one void cell in a straight line;
// ride a platform lane (M/~ run) end to end; bounce pad clears up to 3 void cells.
import { LEVELS } from '../src/levels.js';

const floor = c => '.SE*BCDRXH'.includes(c);
let ok = true;
for (const [li, L] of LEVELS.entries()) {
  const g = L.map, H = g.length, W = Math.max(...g.map(r => r.length));
  const at = (r, c) => (g[r] && g[r][c]) || ' ';
  const widths = new Set(g.map(r => r.length));
  if (widths.size > 1) console.log(`L${li + 1}: ragged rows`, [...widths]);
  let start;
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (at(r, c) === 'S') start = [r, c];
  // platform lanes: endpoints connect
  const lanes = [];
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (at(r, c) === 'M') {
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      let rr = r, cc = c;
      while ('M~'.includes(at(rr + dr, cc + dc))) { rr += dr; cc += dc; }
      // lane runs from (r,c) back through Ms and ~s; find both ends
      if (rr !== r || cc !== c) {
        let br = r, bc = c; while ('M~'.includes(at(br - dr, bc - dc))) { br -= dr; bc -= dc; }
        lanes.push([[br - dr, bc - dc], [rr + dr, cc + dc]]);
      }
    }
  }
  const seen = new Set([start.join()]), q = [start];
  const push = (r, c) => { const k = r + ',' + c; if (!seen.has(k) && floor(at(r, c))) { seen.add(k); q.push([r, c]); } };
  while (q.length) {
    const [r, c] = q.shift();
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      push(r + dr, c + dc);
      if (at(r + dr, c + dc) === ' ') push(r + 2 * dr, c + 2 * dc);
      if (at(r, c) === 'B') for (let k = 2; k <= 4; k++) { let clear = true; for (let j = 1; j < k; j++) if (at(r + j * dr, c + j * dc) !== ' ') clear = false; if (clear) push(r + k * dr, c + k * dc); }
    }
    for (const [a, b] of lanes) {
      if (a[0] === r && a[1] === c) push(b[0], b[1]);
      if (b[0] === r && b[1] === c) push(a[0], a[1]);
    }
  }
  const need = [];
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if ('*EH'.includes(at(r, c))) need.push([r, c, at(r, c)]);
  const miss = need.filter(([r, c]) => !seen.has(r + ',' + c));
  const shards = need.filter(n => n[2] === '*').length;
  console.log(`L${li + 1} ${L.name}: ${W}x${H}, shards=${shards}, reachable=${seen.size}, missing=${JSON.stringify(miss)}`);
  if (miss.length || shards !== 3) ok = false;
}
process.exit(ok ? 0 : 1);
