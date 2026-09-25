// AURORA × UNPAUSED — launch trailer.
// A scripted cinematic built from the game's own Blender models. Everything is a pure function of time
// (window.renderAt(t)), so tools/render-trailer.mjs can step through it frame by frame and encode an MP4.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { LEVELS } from '../src/levels.js';
import { SHOTS, TEXT, DURATION } from './timeline.js';
import { renderSoundtrack } from './audio.js';

import tile_1 from '../models/tile_1.glb';
import tile_2 from '../models/tile_2.glb';
import tile_3 from '../models/tile_3.glb';
import crystal_1 from '../models/crystal_1.glb';
import crystal_2 from '../models/crystal_2.glb';
import crystal_3 from '../models/crystal_3.glb';
import asteroid_1 from '../models/asteroid_1.glb';
import asteroid_2 from '../models/asteroid_2.glb';
import flora_1 from '../models/flora_1.glb';
import flora_2 from '../models/flora_2.glb';
import shard from '../models/shard.glb';
import portal from '../models/portal.glb';
import player from '../models/player.glb';
import player_nature from '../models/player_nature.glb';
import drone from '../models/drone.glb';
import grass_1 from '../models/grass_1.glb';
import grass_2 from '../models/grass_2.glb';
import tree_1 from '../models/tree_1.glb';
import tree_2 from '../models/tree_2.glb';
import tree_3 from '../models/tree_3.glb';
import bush_1 from '../models/bush_1.glb';
import bush_2 from '../models/bush_2.glb';
import insect from '../models/insect.glb';
import island from '../models/island.glb';
import islet_1 from '../models/islet_1.glb';
import islet_2 from '../models/islet_2.glb';
import relic_1 from '../models/relic_1.glb';
import relic_2 from '../models/relic_2.glb';
import relic_3 from '../models/relic_3.glb';
import relic_4 from '../models/relic_4.glb';
import relic_7 from '../models/relic_7.glb';
import relic_9 from '../models/relic_9.glb';
import relic_10 from '../models/relic_10.glb';
import relic_12 from '../models/relic_12.glb';
import relic_13 from '../models/relic_13.glb';

const MODEL_DATA = { tile_1, tile_2, tile_3, crystal_1, crystal_2, crystal_3, asteroid_1, asteroid_2, flora_1, flora_2, shard, portal, player, player_nature, drone, grass_1, grass_2, tree_1, tree_2, tree_3, bush_1, bush_2, insect, island, islet_1, islet_2, relic_1, relic_2, relic_3, relic_4, relic_7, relic_9, relic_10, relic_12, relic_13 };
const MONTAGE = ['relic_3', 'relic_12', 'relic_1', 'relic_9', 'relic_13', 'relic_4', 'relic_10', 'relic_7', 'relic_2'];

/* ------------------------------------------------------------------ helpers */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const ease = t => t * t * (3 - 2 * t);
const easeOut = t => 1 - Math.pow(1 - t, 3);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
// seeded random so every render of the trailer is identical
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

/* ------------------------------------------------------------------ shaders (same look as the game) */
const NOISE = `
float hash(vec3 p){ p=fract(p*0.3183099+.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float noise(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=.5; } return v; }`;
const SKY_VERT = `varying vec3 vDir; void main(){ vDir=position; vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position=p.xyww; }`;
const SKY_FRAG = `
uniform vec3 c1,c2,n1,n2,aur; uniform float time, aurBoost; varying vec3 vDir;
${NOISE}
float auroraF(vec3 d){
  float ang=atan(d.x,d.z), y=d.y, a=0.;
  for(int i=0;i<3;i++){
    float fi=float(i);
    float c=.16+fi*.09+sin(ang*2.+fi*1.7+time*.035)*.06+sin(ang*5.3-time*.05+fi)*.022;
    float lower=smoothstep(c-.015,c+.012,y);
    float upper=exp(-max(y-c,0.)*(6.+fi*3.));
    float rays=.25+.75*pow(noise(vec3(ang*38.+fi*13.,time*.22,fi*3.)),1.6);
    a+=lower*upper*rays*(1.-fi*.22);
  }
  return a;
}
void main(){
  vec3 d=normalize(vDir);
  vec3 col=mix(c2,c1,smoothstep(-.6,.8,d.y));
  float n=fbm(d*2.1+vec3(time*.004,0.,0.));
  float m=fbm(d*3.7+vec3(4.,time*.006,1.));
  col+=n1*smoothstep(.42,.9,n)*.9;
  col+=n2*smoothstep(.45,.95,m)*.75*smoothstep(.3,.8,n+.2);
  col+=n1*pow(max(n-.35,0.),3.)*3.;
  float au=auroraF(d);
  col+=mix(aur,n2*1.3,clamp((d.y-.15)*2.2,0.,1.))*au*1.5*aurBoost;
  vec3 sp=d*260.; vec3 id=floor(sp); float h=hash(id);
  float s=smoothstep(.45,.0,length(fract(sp)-.5))*step(.992,h)*(.55+.45*sin(time*1.7+h*80.));
  col+=vec3(.9,.95,1.)*s*1.6;
  gl_FragColor=vec4(col,1.);
}`;
const PLANET_VERT = `varying vec3 vN; varying vec3 vP; varying vec3 vW;
void main(){ vN=normalize(normalMatrix*normal); vP=position; vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`;
const PLANET_FRAG = `
uniform vec3 col, sunDir; uniform float time; varying vec3 vN; varying vec3 vP; varying vec3 vW;
${NOISE}
void main(){
  vec3 p=normalize(vP);
  float bands=fbm(vec3(p.x*2.,p.y*9.+fbm(p*3.+time*.01)*2.,p.z*2.));
  vec3 base=mix(col*.25,col,bands);
  vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vW);
  float l=clamp(dot(N,normalize((viewMatrix*vec4(sunDir,0.)).xyz))*.9+.15,0.,1.);
  float rim=pow(1.-max(dot(N,normalize((viewMatrix*vec4(V,0.)).xyz)),0.),3.);
  gl_FragColor=vec4(base*l+col*rim*1.6,1.);
}`;
const PORTAL_FRAG = `
uniform float time, uActive; uniform vec3 col; varying vec2 vUv;
void main(){
  vec2 p=vUv*2.-1.; float r=length(p); if(r>1.) discard;
  float a=atan(p.y,p.x);
  float sw=sin(a*5.+r*14.-time*3.5)*.5+.5;
  float sw2=sin(-a*3.+r*9.-time*2.)*.5+.5;
  float core=smoothstep(1.,.05,r);
  vec3 c=col*(.35+sw*.7+sw2*.4)*core*mix(.18,2.4,uActive)+vec3(1.)*pow(core,5.)*uActive*1.4;
  gl_FragColor=vec4(c,core);
}`;
const UV_VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;

function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.3, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ================================================================== setup */
const W = 1920, H = 1080;
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = .95;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, .1, 4000);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
scene.environmentIntensity = .2;

const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, rt);
composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), .5, .45, .92);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const glowTex = glowTexture();

/* sky, planet, stars */
const skyU = { c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, n1: { value: new THREE.Vector3() }, n2: { value: new THREE.Vector3() }, aur: { value: new THREE.Vector3() }, time: { value: 0 }, aurBoost: { value: 1 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24),
  new THREE.ShaderMaterial({ uniforms: skyU, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false, fog: false }));
sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
const planetU = { col: { value: new THREE.Color() }, sunDir: { value: V(1, .6, .4).normalize() }, time: { value: 0 } };
const planet = new THREE.Mesh(new THREE.SphereGeometry(170, 64, 32), new THREE.ShaderMaterial({ uniforms: planetU, vertexShader: PLANET_VERT, fragmentShader: PLANET_FRAG, fog: false }));
scene.add(planet);
const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true }));
sunSprite.scale.setScalar(260); scene.add(sunSprite);
{
  const N = 2600, p = new Float32Array(N * 3), c = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, r = 900 + rnd() * 300, s = Math.sqrt(1 - u * u);
    p.set([Math.cos(a) * s * r, u * r, Math.sin(a) * s * r], i * 3);
    const col = new THREE.Color().setHSL(.55 + rnd() * .35, .6, .75 + rnd() * .25); c.set([col.r, col.g, col.b], i * 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  const stars = new THREE.Points(g, new THREE.PointsMaterial({ size: 3, sizeAttenuation: false, map: glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  stars.frustumCulled = false; scene.add(stars);
}

/* lights */
const hemi = new THREE.HemisphereLight(0x9fb4ff, 0x1a0f22, .45); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 1.9);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0004; sun.shadow.normalBias = .03;
scene.add(sun, sun.target);
const keyLight = new THREE.PointLight(0x9fe8ff, 1.6, 10, 2); scene.add(keyLight);

/* ================================================================== models */
const loader = new GLTFLoader();
const models = {}, clips = {};
await Promise.all(Object.entries(MODEL_DATA).map(([k, u8]) => new Promise((res, rej) => {
  const ab = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
  loader.parse(ab, '', g => { models[k] = g.scene; clips[k] = g.animations; res(); }, rej);
})));

// materials styled per palette, the same way the game does it
function styler(pal, relicBoost = 4.5) {
  const cache = new Map();
  return (orig, key = orig.name) => {
    if (cache.has(key)) return cache.get(key);
    const m = orig.clone();
    switch (key) {
      case 'Stone': m.color.set(0x3b3e4c).lerp(new THREE.Color(pal.fog), .2); m.roughness = .88; m.metalness = .05; m.envMapIntensity = .4; break;
      case 'Rock': m.color.set(0x2a2230); m.roughness = .95; m.flatShading = true; break;
      case 'Trim': m.emissive.set(pal.trim); m.emissiveIntensity = .75; m.color.set(0x000000); break;
      case 'Crystal': m.color.set(pal.crystal).multiplyScalar(.55); m.emissive.set(pal.crystal); m.emissiveIntensity = .55; m.roughness = .18; m.metalness = .35; m.flatShading = true; break;
      case 'Shard': m.emissive.set(0xffc35a); m.emissiveIntensity = 2.2; break;
      case 'PortalRing': m.emissive.set(pal.trim); m.color.set(pal.trim); m.emissiveIntensity = 1.2; break;
      case 'Visor': m.emissiveIntensity = 1.1; m.envMapIntensity = 2.5; break;
      case 'Danger': m.emissiveIntensity = 3.5; break;
      case 'Wing': m.transparent = true; m.opacity = .42; m.depthWrite = false; m.side = THREE.DoubleSide; m.emissiveIntensity = 1.2; break;
      case 'InsectEye': m.emissiveIntensity = 4; break;
      case 'Mushroom': m.emissiveIntensity = 2.2; break;
      case 'Water': m.transparent = true; m.opacity = .8; m.emissiveIntensity = 1.4; break;
      case 'Leaf': case 'Leaf2': case 'Leaf3': m.side = THREE.DoubleSide; break;
      default: if (/^R[A-Z]/.test(key) && m.emissiveIntensity > 0) m.emissiveIntensity *= relicBoost;
    }
    m.needsUpdate = true; cache.set(key, m); return m;
  };
}
function clone(name, mat, { cast = true, receive = true } = {}) {
  const o = name.startsWith('player') ? SkeletonUtils.clone(models[name]) : models[name].clone(true);
  o.traverse(c => { if (c.isMesh) { c.material = mat(c.material); c.castShadow = cast; c.receiveShadow = receive; } });
  return o;
}
function rig(name, mat) {
  const o = clone(name, mat);
  const mixer = new THREE.AnimationMixer(o), actions = {};
  for (const c of clips[name]) actions[c.name] = mixer.clipAction(c);
  // pose(anim, time): jump straight to a frame of one animation — no state, so any frame renders on its own
  const pose = (anim, t) => { for (const k in actions) actions[k].stop(); const a = actions[anim]; a.reset().play(); mixer.setTime(t % a.getClip().duration); };
  return { obj: o, pose };
}

/* ================================================================== worlds */
// ---- chapter 1: a crystal maze floating in space
const PAL1 = LEVELS[0].palette;
const space = new THREE.Group(); scene.add(space);
const m1 = styler(PAL1);
const WALLS = new Set();
{
  // a small hand-drawn maze: '#' crystal walls, '.' floor, ' ' void
  const MAP = [
    '#########   ',
    '#.......#   ',
    '#.#####.####',
    '#.#...#....#',
    '#.#.#.####.#',
    '#.....#....#',
    '#####.####.#',
    '    #......#',
    '    ########',
  ];
  MAP.forEach((row, r) => [...row].forEach((ch, c) => {
    const x = (c - 5.5) * 4, z = (r - 4) * 4;
    if (ch === ' ') return;
    const t = clone('tile_' + (1 + Math.floor(rnd() * 3)), m1); t.position.set(x, 0, z); t.rotation.y = Math.floor(rnd() * 4) * Math.PI / 2; space.add(t);
    if (ch === '#') {
      WALLS.add(r * 100 + c);
      const k = clone('crystal_' + (1 + Math.floor(rnd() * 3)), m1); k.position.set(x, 0, z); k.rotation.y = rnd() * 6.28; k.scale.set(1.3, 1.15 + rnd() * .35, 1.3); space.add(k);
      for (let j = 0; j < 2; j++) { const a = rnd() * 6.28, s = clone('crystal_' + (1 + Math.floor(rnd() * 3)), m1); s.position.set(x + Math.cos(a) * 1.1, 0, z + Math.sin(a) * 1.1); s.rotation.y = rnd() * 6.28; s.scale.set(.8, .7 + rnd() * .5, .8); space.add(s); }
    } else if (rnd() < .45) {
      const a = rnd() * 6.28, f = clone('flora_' + (1 + Math.floor(rnd() * 2)), m1); f.position.set(x + Math.cos(a) * 1.3, 0, z + Math.sin(a) * 1.3); f.scale.setScalar(.8 + rnd() * .6); space.add(f);
    }
  }));
  // distant floating tiles and asteroids
  for (let k = 0; k < 40; k++) {
    const a = rnd() * 6.28, d = 60 + rnd() * 120, o = clone('tile_' + (1 + k % 3), m1, { cast: false });
    o.position.set(Math.cos(a) * d, -45 + rnd() * 35, Math.sin(a) * d); o.rotation.y = rnd() * 6; o.scale.setScalar(1.5 + rnd() * 3.5); space.add(o);
  }
}
const asteroids = [];
for (let k = 0; k < 70; k++) {
  const o = clone('asteroid_' + (1 + k % 2), m1, { cast: false });
  const a = rnd() * 6.28, d = 30 + rnd() * 140;
  o.position.set(Math.cos(a) * d, -40 + rnd() * 90, Math.sin(a) * d); o.scale.setScalar(.6 + rnd() * 3.2);
  asteroids.push({ o, spin: V(rnd() - .5, rnd() - .5, rnd() - .5).multiplyScalar(.5), r0: V(rnd() * 6, rnd() * 6, rnd() * 6) });
  space.add(o);
}
// the robot, a star shard, the portal and a patrol drone
const hero = rig('player', m1); space.add(hero.obj);
const shardObj = clone('shard', m1); space.add(shardObj);
const shardLight = new THREE.PointLight(0xffc35a, 3, 8, 2); shardObj.add(shardLight);
const portalObj = clone('portal', m1); portalObj.position.set(18, 0, 12); portalObj.rotation.y = Math.PI / 2; space.add(portalObj);
const portalU = { time: { value: 0 }, uActive: { value: 0 }, col: { value: new THREE.Color(PAL1.trim) } };
const disc = new THREE.Mesh(new THREE.CircleGeometry(1.62, 64), new THREE.ShaderMaterial({ uniforms: portalU, vertexShader: UV_VERT, fragmentShader: PORTAL_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
disc.position.y = 2.6; portalObj.add(disc);
const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.9, 60, 32, 1, true), new THREE.MeshBasicMaterial({ color: PAL1.trim, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
beam.position.y = 30; portalObj.add(beam);
const portalLight = new THREE.PointLight(PAL1.trim, 4, 16, 2); portalLight.position.y = 2.6; portalObj.add(portalLight);
const droneObj = clone('drone', m1); space.add(droneObj);

// ---- chapter 2: Whispering Grove, a jungle island
const PAL2 = LEVELS.find(l => l.theme === 'jungle').palette;
const m2 = styler(PAL2);
const jungle = new THREE.Group(); scene.add(jungle);
{
  const R = 34;
  const isl = clone('island', m2, { cast: false }); isl.scale.set(R, R * .55, R); isl.position.y = -.42; jungle.add(isl);
  for (let k = 0; k < 150; k++) {
    const a = rnd() * 6.28, d = R * Math.sqrt(rnd()) * .9;
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (Math.hypot(x, z) < 9 || (Math.abs(x) < 5 && z > -30 && z < 30)) continue; // a clearing path through the middle
    const t = clone('tree_' + (1 + k % 3), m2); t.position.set(x, -.3, z); t.rotation.y = rnd() * 6.28; t.scale.set(.8 + rnd() * .5, .8 + rnd() * .6, .8 + rnd() * .5); jungle.add(t);
    if (rnd() < .5) { const b = clone('bush_' + (1 + k % 2), m2, { cast: false }); b.position.set(x + 2, -.3, z + 1); b.scale.setScalar(1 + rnd()); jungle.add(b); }
  }
  for (let k = 0; k < 160; k++) {
    const g = clone('grass_' + (1 + k % 2), m2, { cast: false }); const a = rnd() * 6.28, d = R * Math.sqrt(rnd()) * .85;
    g.position.set(Math.cos(a) * d, -.2, Math.sin(a) * d); g.rotation.y = rnd() * 6; g.scale.setScalar(.9 + rnd() * .8); jungle.add(g);
  }
  for (let k = 0; k < 18; k++) {
    const o = clone('islet_' + (1 + k % 2), m2, { cast: false }); const a = rnd() * 6.28, d = R * 1.8 + rnd() * 80;
    o.position.set(Math.cos(a) * d, -40 + rnd() * 70, Math.sin(a) * d); o.rotation.y = rnd() * 6; o.scale.set(6 + rnd() * 14, 5 + rnd() * 9, 6 + rnd() * 14); jungle.add(o);
  }
}
const grove = rig('player_nature', m2); jungle.add(grove.obj);
const bugs = [];
for (let k = 0; k < 7; k++) { const o = clone('insect', m2); o.scale.setScalar(1.25); jungle.add(o); bugs.push({ o, ph: rnd() * 6.28, r: 4 + rnd() * 7, h: 2 + rnd() * 3, sp: .5 + rnd() * .5 }); }

// ---- relic vault: a dark stage for the montage
const vault = new THREE.Group(); scene.add(vault);
const PAL3 = LEVELS[5].palette;
const m3 = styler(PAL3, 1.6);
const relics = MONTAGE.map(n => { const o = clone(n, m3); o.visible = false; vault.add(o); return o; });
const vaultLight = new THREE.PointLight(0xffffff, 30, 20, 2); vaultLight.position.set(2, 3, 4); vault.add(vaultLight);

/* ---------- sparks: stateless particles, position is a function of time ---------- */
const SPARK_N = 600;
const sparkGeo = new THREE.BufferGeometry();
const sparkPos = new Float32Array(SPARK_N * 3), sparkCol = new Float32Array(SPARK_N * 3);
const sparkDir = [], sparkSp = [];
for (let i = 0; i < SPARK_N; i++) {
  const u = rnd() * 2 - 1, a = rnd() * 6.28, s = Math.sqrt(1 - u * u);
  sparkDir.push(V(Math.cos(a) * s, u * .7 + .3, Math.sin(a) * s)); sparkSp.push(2 + rnd() * 6);
}
sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3)); sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkCol, 3));
const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ size: .3, map: glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
sparks.frustumCulled = false; scene.add(sparks);
function burst(at, color, age, scale = 1) {
  const c = new THREE.Color(color), life = 1.6;
  for (let i = 0; i < SPARK_N; i++) {
    const k = age < 0 || age > life ? 0 : Math.pow(1 - age / life, 2);
    const d = sparkSp[i] * scale * (1 - Math.exp(-age * 2.2)) / 2.2;
    sparkPos.set([at.x + sparkDir[i].x * d, at.y + sparkDir[i].y * d - .5 * age * age, at.z + sparkDir[i].z * d], i * 3);
    sparkCol.set([c.r * k, c.g * k, c.b * k], i * 3);
  }
  sparkGeo.attributes.position.needsUpdate = true; sparkGeo.attributes.color.needsUpdate = true;
}

/* ---------- motes: slow floating dust around the camera ---------- */
const MOTE_N = 500, moteGeo = new THREE.BufferGeometry(), moteBase = new Float32Array(MOTE_N * 3), motePos = new Float32Array(MOTE_N * 3);
for (let i = 0; i < MOTE_N; i++) moteBase.set([(rnd() - .5) * 60, -6 + rnd() * 20, (rnd() - .5) * 60], i * 3);
moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
const moteMat = new THREE.PointsMaterial({ size: .16, map: glowTex, color: PAL1.trim, transparent: true, opacity: .8, depthWrite: false, blending: THREE.AdditiveBlending });
const motes = new THREE.Points(moteGeo, moteMat); motes.frustumCulled = false; scene.add(motes);
function drift(t) {
  for (let i = 0; i < MOTE_N; i++) {
    const b = i * 3;
    motePos[b] = moteBase[b] + Math.sin(t * .3 + i) * .6; motePos[b + 1] = moteBase[b + 1] + ((t * .25 + i * .37) % 4) - 2; motePos[b + 2] = moteBase[b + 2] + Math.cos(t * .27 + i * 1.3) * .6;
  }
  moteGeo.attributes.position.needsUpdate = true;
}

/* ================================================================== look per world */
function applyPalette(pal, { jungleLit = false } = {}) {
  skyU.c1.value.set(pal.sky1); skyU.c2.value.set(pal.sky2);
  skyU.n1.value.set(...pal.neb); skyU.n2.value.set(...pal.neb2); skyU.aur.value.set(...(pal.aur || [.3, 1, .7]));
  scene.fog = new THREE.FogExp2(pal.fog, .0055);
  planetU.col.value.set(pal.planet);
  const sunDir = V(.9, .55, -.35).normalize();
  planetU.sunDir.value.copy(sunDir);
  sun.color.set(pal.sun); hemi.color.set(pal.trim).lerp(new THREE.Color(0xffffff), .6); hemi.groundColor.set(pal.fog);
  if (jungleLit) { hemi.color.set(0x8fb0e8); hemi.groundColor.set(0x0c1408); hemi.intensity = .4; sun.intensity = 1.6; }
  else { hemi.intensity = .45; sun.intensity = 1.9; }
  sun.position.copy(sunDir).multiplyScalar(60); sun.target.position.set(0, 0, 0);
  const sc = sun.shadow.camera; sc.left = sc.bottom = -40; sc.right = sc.top = 40; sc.near = 1; sc.far = 160; sc.updateProjectionMatrix();
  sunSprite.material.color.set(pal.sun); sunSprite.position.copy(sunDir).multiplyScalar(1100);
  planet.position.copy(V(-sunDir.x, -.25, -sunDir.z).normalize().multiplyScalar(900));
  keyLight.color.set(pal.trim); moteMat.color.set(pal.trim);
}
function world(w) {
  space.visible = w === 'space'; jungle.visible = w === 'jungle'; vault.visible = w === 'vault';
  sky.visible = planet.visible = sunSprite.visible = w !== 'vault';
  if (w === 'space') applyPalette(PAL1);
  if (w === 'jungle') applyPalette(PAL2, { jungleLit: true });
  if (w === 'vault') { applyPalette(PAL3); scene.fog = null; scene.background = new THREE.Color(0x020308); }
  else scene.background = null;
}
const look = (from, to) => { camera.position.copy(from); camera.lookAt(to); };

/* ================================================================== shots */
// each shot sets the whole scene from its local time s (seconds since the shot began) and u (0..1 through it)
const HERO_PATH = [V(-18, 0, -12), V(-18, 0, 4), V(-2, 0, 4), V(-2, 0, 12), V(18, 0, 12)];
function along(path, d) {
  for (let i = 0; i < path.length - 1; i++) {
    const seg = path[i].distanceTo(path[i + 1]);
    if (d <= seg || i === path.length - 2) { const k = clamp(d / seg); return { p: path[i].clone().lerp(path[i + 1], k), dir: path[i + 1].clone().sub(path[i]).normalize() }; }
    d -= seg;
  }
}
const RUN = 7.2;
const SHOT_FNS = {
  // Unpaused ident: black, only titles
  ident() { world('vault'); relics.forEach(r => r.visible = false); vaultLight.intensity = 0; look(V(0, 0, 10), V(0, 0, 0)); },

  // slow drift down through the asteroid field toward the crystal maze
  descent(s, u, t) {
    world('space'); hero.obj.visible = false; shardObj.visible = false; droneObj.visible = false;
    const e = ease(u);
    look(V(lerp(-70, -34, e), lerp(58, 22, e), lerp(70, 34, e)), V(lerp(-10, -4, e), lerp(-6, 0, e), 0));
    camera.fov = 50;
    portalU.uActive.value = 0; beam.material.opacity = 0;
  },

  // the robot sprints along the maze, camera tracking low and close
  run(s, u, t) {
    world('space'); hero.obj.visible = true; shardObj.visible = false; droneObj.visible = true;
    const { p, dir } = along(HERO_PATH, 10 + s * RUN);
    hero.obj.position.copy(p); hero.obj.rotation.y = Math.atan2(dir.x, dir.z); hero.pose('Run', s);
    const side = V(dir.z, 0, -dir.x);
    look(p.clone().add(side.multiplyScalar(4.2)).add(dir.clone().multiplyScalar(2.5)).add(V(0, 1.6, 0)), p.clone().add(V(0, 1.2, 0)).add(dir.clone().multiplyScalar(1.2)));
    camera.fov = 42;
    keyLight.position.copy(p).add(V(0, 2.5, 0));
    droneObj.position.set(p.x + dir.x * 9 - dir.z * 1.5, 1.1 + Math.sin(t * 3) * .15, p.z + dir.z * 9 + dir.x * 1.5); droneObj.rotation.y = t * 2;
  },

  // a star shard, close and golden, then collected in a burst
  shard(s, u, t) {
    world('space'); hero.obj.visible = true; droneObj.visible = false;
    const at = V(-2, 0, 8);
    hero.obj.position.set(-2, 0, 9.4); hero.obj.rotation.y = Math.PI; hero.pose(s < 1.2 ? 'Run' : 'Cheer', s < 1.2 ? s : s - 1.2);
    const got = s > 1.15;
    shardObj.visible = !got; shardObj.position.set(at.x, 1.3 + Math.sin(t * 2.4) * .18, at.z); shardObj.rotation.y = t * 2.2; shardObj.scale.setScalar(1.1);
    if (s < 1.15) hero.obj.position.z = lerp(13.5, 9.4, s / 1.15);
    burst(V(at.x, 1.3, at.z), 0xffc35a, s - 1.15, 1.1);
    const o = ease(u);
    look(V(at.x - lerp(.9, 1.3, o), lerp(1.2, 2.2, o), at.z - lerp(2.6, 4.2, o)), V(at.x, 1.4, at.z + 1));
    camera.fov = 38;
    keyLight.position.set(at.x, 3, at.z);
  },

  // the portal wakes: the disc swirls up and a beam shoots into the sky
  portal(s, u, t) {
    world('space'); hero.obj.visible = true; shardObj.visible = false; droneObj.visible = false;
    const a = easeOut(ramp(s, .35, 1.6));
    portalU.uActive.value = a; portalU.time.value = t; beam.material.opacity = a * .35; portalLight.intensity = 4 + a * 14;
    hero.obj.position.set(9.5, 0, 12.2); hero.obj.rotation.y = Math.PI / 2; hero.pose(s < .35 ? 'Idle' : 'Cheer', s < .35 ? s : s - .35);
    burst(V(18, 2.6, 12), PAL1.trim, s - .35, 1.4);
    const o = ease(u);
    look(V(lerp(3.5, 6.5, o), lerp(1.1, 2.4, o), lerp(12.9, 12.4, o)), V(18, lerp(2.6, 4.2, o), 12));
    camera.fov = 45;
    keyLight.position.set(12, 2.5, 12);
  },

  // Chapter 2: a sweeping flight over Whispering Grove
  grove(s, u, t) {
    world('jungle');
    const e = ease(u), a = lerp(-.9, .5, e);
    look(V(Math.sin(a) * lerp(70, 26, e), lerp(38, 9, e), Math.cos(a) * lerp(70, 26, e)), V(0, lerp(0, 2, e), 0));
    camera.fov = 50;
    grove.obj.position.set(0, 0, 0); grove.obj.rotation.y = a + Math.PI * .1; grove.pose('Idle', s);
    keyLight.position.set(0, 3, 0);
    bugs.forEach((b, i) => { const q = b.ph + t * b.sp; b.o.position.set(Math.cos(q) * b.r, b.h + Math.sin(t * 2 + i) * .4, Math.sin(q) * b.r); b.o.rotation.y = -q; });
  },

  // close on the jungle robot as it jumps off toward camera
  groveHero(s, u, t) {
    world('jungle');
    grove.obj.position.set(0, s < .4 ? 0 : Math.max(0, Math.sin(clamp((s - .4) / 1.1) * Math.PI) * 2.6), 0); grove.obj.rotation.y = .5;
    grove.pose(s < .4 ? 'Idle' : 'Jump', s < .4 ? s : (s - .4) * .8);
    const o = ease(u);
    look(V(lerp(2.3, 3.1, o), lerp(1.0, 1.5, o), lerp(2.9, 3.6, o)), V(0, 1.2 + grove.obj.position.y * .8, 0));
    camera.fov = 40;
    keyLight.position.set(1.5, 3, 2);
    bugs.forEach((b, i) => { const q = b.ph + t * b.sp; b.o.position.set(Math.cos(q) * (b.r + 5), b.h + Math.sin(t * 2 + i) * .4, Math.sin(q) * b.r * .7); b.o.rotation.y = -q; });
  },

  // relics, one per beat
  relics(s, u, t, shot) {
    world('vault');
    const n = relics.length, i = Math.min(n - 1, Math.floor(u * n));
    const ls = s - i * (shot.len / n);
    relics.forEach((r, k) => r.visible = k === i);
    const r = relics[i];
    r.position.set(0, 0, 0); r.rotation.set(.25, ls * 1.8 + i, 0); r.scale.setScalar(1.35 + ls * .12);
    const hue = [.48, .8, .12, .58, .92, .35, .05, .7, .2][i];
    vaultLight.color.setHSL(hue, .5, .7); vaultLight.intensity = 9 + 22 * Math.exp(-ls * 7);
    keyLight.color.setHSL(hue, .9, .6); keyLight.intensity = 4; keyLight.position.set(-2, -1, 3);
    look(V(0, .5, lerp(3.3, 2.9, clamp(ls / .45))), V(0, .3, 0));
    camera.fov = 40;
    burst(V(0, .2, 0), new THREE.Color().setHSL(hue, .9, .6).getHex(), ls, .35);
  },

  // the robot leaps across the void, slowed down
  leap(s, u, t) {
    world('space'); hero.obj.visible = true; shardObj.visible = false; droneObj.visible = true;
    const k = ease(u);
    hero.obj.position.set(lerp(-6, 6, k), 1.2 + Math.sin(k * Math.PI) * 3, 30); hero.obj.rotation.y = Math.PI / 2; hero.pose('Jump', .15 + u * .5);
    droneObj.position.set(lerp(8, -4, k), 2.2, 34); droneObj.rotation.y = t * 3;
    look(V(lerp(-2, 1, k), lerp(-1.5, 0, k), 38), hero.obj.position.clone().add(V(0, .5, 0)));
    camera.fov = 44;
    keyLight.position.copy(hero.obj.position).add(V(0, 2, 1));
  },

  // title card over the aurora sky
  title(s, u, t) {
    world('space'); hero.obj.visible = true; shardObj.visible = false; droneObj.visible = false;
    hero.obj.position.set(-2, 0, 4); hero.obj.rotation.y = Math.PI * .85; hero.pose('Idle', s);
    skyU.aurBoost.value = 1.1; portalU.uActive.value = 1; portalU.time.value = t; beam.material.opacity = .3;
    const o = ease(u);
    look(V(lerp(0, -1, o), lerp(2.2, 2.6, o), lerp(12, 10.5, o)), V(-2, lerp(6, 7, o), -30));
    camera.fov = 55;
    keyLight.position.set(-2, 2.5, 5);
  },
};

/* ================================================================== text overlay */
const textEls = TEXT.map(tx => {
  const el = document.createElement('div');
  el.className = 'tx ' + (tx.cls || ''); el.innerHTML = tx.html;
  document.getElementById('titles').appendChild(el);
  return { el, ...tx };
});
const flash = document.getElementById('flash'), fade = document.getElementById('fade'), bars = document.getElementById('bars');

/* ================================================================== render */
window.renderAt = t => {
  seed = 7;
  const shot = SHOTS.find(s => t >= s.at && t < s.at + s.len) || SHOTS[SHOTS.length - 1];
  const s = t - shot.at, u = clamp(s / shot.len);
  skyU.aurBoost.value = .8; burst(V(0, -999, 0), 0, -1);
  portalU.uActive.value = 0; beam.material.opacity = 0; portalLight.intensity = 4; keyLight.intensity = 1.6;
  skyU.time.value = t * 6; planetU.time.value = t;
  asteroids.forEach(a => { a.o.rotation.set(a.r0.x + a.spin.x * t, a.r0.y + a.spin.y * t, a.r0.z + a.spin.z * t); });
  drift(t);
  SHOT_FNS[shot.fn](s, u, t, shot);
  camera.updateProjectionMatrix();
  // gentle handheld sway on every shot, plus a kick on each impact
  const kick = SHOTS.reduce((k, sh) => sh.hit != null && t >= sh.at + sh.hit ? Math.max(k, Math.exp(-(t - sh.at - sh.hit) * 9)) : k, 0);
  camera.rotation.z += Math.sin(t * .7) * .004 + Math.sin(t * 37) * kick * .01;
  camera.position.y += Math.sin(t * 29) * kick * .06;
  composer.render();

  // overlay: titles, white flashes on impacts, fades to black between acts
  for (const x of textEls) {
    const a = ramp(t, x.at, x.at + (x.inT || .5)) * (1 - ramp(t, x.at + x.len - (x.outT || .5), x.at + x.len));
    x.el.style.opacity = a.toFixed(3);
    const g = ease(ramp(t, x.at, x.at + x.len));
    x.el.style.transform = `translate(-50%,-50%) scale(${(1 + (x.zoom ?? .06) * g).toFixed(4)})`;
    x.el.style.letterSpacing = x.track ? `${lerp(x.track[0], x.track[1], easeOut(ramp(t, x.at, x.at + x.len)))}em` : '';
  }
  const fl = SHOTS.reduce((k, sh) => sh.flash && t >= sh.at + (sh.hit || 0) ? Math.max(k, Math.exp(-(t - sh.at - (sh.hit || 0)) * sh.flash)) : k, 0);
  flash.style.opacity = fl.toFixed(3);
  const blk = SHOTS.reduce((k, sh) => {
    let v = 0;
    if (sh.fadeIn) v = Math.max(v, 1 - ramp(t, sh.at, sh.at + sh.fadeIn));
    if (sh.fadeOut) v = Math.max(v, ramp(t, sh.at + sh.len - sh.fadeOut, sh.at + sh.len));
    return t >= sh.at && t < sh.at + sh.len ? Math.max(k, v) : k;
  }, t >= DURATION ? 1 : 0);
  fade.style.opacity = blk.toFixed(3);
  document.getElementById('shade').style.opacity = shot.fn === 'title' ? ease(ramp(t, shot.at, shot.at + .6)).toFixed(3) : '0';
  bars.style.opacity = shot.fn === 'ident' || shot.fn === 'title' ? '0' : '1';
};
window.TRAILER = { DURATION, W, H };
window.renderSoundtrack = renderSoundtrack;
document.fonts.ready.then(() => { window.renderAt(0); window.trailerReady = true; });
