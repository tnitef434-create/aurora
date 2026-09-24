// AURORA — the game. Third-person space-maze explorer built on three.js.
// Models are made in Blender (blender/build_models.py, blender/build_player.py) and bundled in as binary .glb data.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { LEVELS, TILE } from './levels.js';

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
import platform from '../models/platform.glb';
import pad from '../models/pad.glb';
import drone from '../models/drone.glb';
import emitter from '../models/emitter.glb';
import spikes from '../models/spikes.glb';
import relic_0 from '../models/relic_0.glb';
import relic_1 from '../models/relic_1.glb';
import relic_2 from '../models/relic_2.glb';
import relic_3 from '../models/relic_3.glb';
import relic_4 from '../models/relic_4.glb';
import relic_5 from '../models/relic_5.glb';
import relic_6 from '../models/relic_6.glb';
import relic_7 from '../models/relic_7.glb';
import relic_8 from '../models/relic_8.glb';
import relic_9 from '../models/relic_9.glb';
import relic_10 from '../models/relic_10.glb';
import relic_11 from '../models/relic_11.glb';

const MODEL_DATA = { tile_1, tile_2, tile_3, crystal_1, crystal_2, crystal_3, asteroid_1, asteroid_2, flora_1, flora_2, shard, portal, player, platform, pad, drone, emitter, spikes, relic_0, relic_1, relic_2, relic_3, relic_4, relic_5, relic_6, relic_7, relic_8, relic_9, relic_10, relic_11 };
const INSTANCED = ['tile_1', 'tile_2', 'tile_3', 'crystal_1', 'crystal_2', 'crystal_3', 'asteroid_1', 'asteroid_2', 'flora_1', 'flora_2'];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, rate, dt) => lerp(a, b, 1 - Math.exp(-rate * dt));

/* ------------------------------------------------------------------ strings */
const STR = {
  English: { level: 'Level', shards: 'Star shards', collect: 'Collect', locked: 'Collect every star shard to wake the portal', awake: 'The portal has awakened', got: 'Star shard found', complete: 'Level Complete', time: 'Time', best: 'Best', cont: 'Continue', menu: 'Main Menu', fell: 'Lost in the void…', dead: 'Your light went out…', click: 'Click to take control', finalT: 'Chapter 1 complete', finalS: 'Thanks for playing Aurora.', newBest: 'New best!', move: 'Move', jump: 'Jump', sprint: 'Sprint', look: 'Look', pause: 'Pause', relic: 'Relic found', relics: 'Relics', medal: 'Medal', gold: 'Gold', silver: 'Silver', bronze: 'Bronze', par: 'Par' },
  Nederlands: { level: 'Level', shards: 'Sterscherven', collect: 'Oppakken', locked: 'Verzamel alle sterscherven om het portaal te wekken', awake: 'Het portaal is ontwaakt', got: 'Sterscherf gevonden', complete: 'Level voltooid', time: 'Tijd', best: 'Beste', cont: 'Doorgaan', menu: 'Hoofdmenu', fell: 'Verdwaald in de leegte…', dead: 'Je licht is gedoofd…', click: 'Klik om te spelen', finalT: 'Hoofdstuk 1 voltooid', finalS: 'Bedankt voor het spelen van Aurora.', newBest: 'Nieuw record!', move: 'Lopen', jump: 'Springen', sprint: 'Sprinten', look: 'Kijken', pause: 'Pauze', relic: 'Relikwie gevonden', relics: 'Relikwieën', medal: 'Medaille', gold: 'Goud', silver: 'Zilver', bronze: 'Brons', par: 'Par' },
  Deutsch: { level: 'Level', shards: 'Sternsplitter', collect: 'Aufheben', locked: 'Sammle alle Sternsplitter, um das Portal zu wecken', awake: 'Das Portal ist erwacht', got: 'Sternsplitter gefunden', complete: 'Level geschafft', time: 'Zeit', best: 'Bestzeit', cont: 'Weiter', menu: 'Hauptmenü', fell: 'In der Leere verloren…', dead: 'Dein Licht ist erloschen…', click: 'Klicken zum Spielen', finalT: 'Kapitel 1 abgeschlossen', finalS: 'Danke fürs Spielen von Aurora.', newBest: 'Neue Bestzeit!', move: 'Laufen', jump: 'Springen', sprint: 'Sprinten', look: 'Umsehen', pause: 'Pause', relic: 'Relikt gefunden', relics: 'Relikte', medal: 'Medaille', gold: 'Gold', silver: 'Silber', bronze: 'Bronze', par: 'Par' },
  'Français': { level: 'Niveau', shards: 'Éclats d’étoile', collect: 'Ramasser', locked: 'Récupère tous les éclats pour éveiller le portail', awake: 'Le portail s’est éveillé', got: 'Éclat d’étoile trouvé', complete: 'Niveau terminé', time: 'Temps', best: 'Record', cont: 'Continuer', menu: 'Menu principal', fell: 'Perdu dans le vide…', dead: 'Ta lumière s’est éteinte…', click: 'Clique pour jouer', finalT: 'Chapitre 1 terminé', finalS: 'Merci d’avoir joué à Aurora.', newBest: 'Nouveau record !', move: 'Bouger', jump: 'Sauter', sprint: 'Sprinter', look: 'Regarder', pause: 'Pause', relic: 'Relique trouvée', relics: 'Reliques', medal: 'Médaille', gold: 'Or', silver: 'Argent', bronze: 'Bronze', par: 'Par' },
  'Español': { level: 'Nivel', shards: 'Fragmentos estelares', collect: 'Recoger', locked: 'Reúne todos los fragmentos para despertar el portal', awake: 'El portal ha despertado', got: 'Fragmento encontrado', complete: 'Nivel completado', time: 'Tiempo', best: 'Récord', cont: 'Continuar', menu: 'Menú principal', fell: 'Perdido en el vacío…', dead: 'Tu luz se apagó…', click: 'Haz clic para jugar', finalT: 'Capítulo 1 completado', finalS: 'Gracias por jugar a Aurora.', newBest: '¡Nuevo récord!', move: 'Mover', jump: 'Saltar', sprint: 'Correr', look: 'Mirar', pause: 'Pausa', relic: 'Reliquia encontrada', relics: 'Reliquias', medal: 'Medalla', gold: 'Oro', silver: 'Plata', bronze: 'Bronce', par: 'Par' },
  '日本語': { level: 'レベル', shards: '星のかけら', collect: '拾う', locked: '星のかけらを全部集めてポータルを目覚めさせよう', awake: 'ポータルが目覚めた', got: '星のかけらを見つけた', complete: 'レベルクリア', time: 'タイム', best: 'ベスト', cont: '続ける', menu: 'メインメニュー', fell: '虚空に迷い込んだ…', dead: '光が消えた…', click: 'クリックして操作', finalT: 'チャプター1 クリア', finalS: 'Auroraをプレイしてくれてありがとう。', newBest: '自己ベスト！', move: '移動', jump: 'ジャンプ', sprint: 'ダッシュ', look: '視点', pause: 'ポーズ', relic: '遺物を発見', relics: '遺物', medal: 'メダル', gold: '金', silver: '銀', bronze: '銅', par: '目標' },
};

const QUALITY = {
  Low:    { pr: .75, shadows: 0,    bloom: false, particles: .35 },
  Medium: { pr: 1,   shadows: 1024, bloom: true,  particles: .6 },
  High:   { pr: 1.5, shadows: 2048, bloom: true,  particles: 1 },
  Ultra:  { pr: 2,   shadows: 4096, bloom: true,  particles: 1.4 },
};
const HEARTS = { Relaxed: 5, Normal: 3, Hard: 2 };

/* ------------------------------------------------------------------ shaders */
const NOISE = `
float hash(vec3 p){ p=fract(p*0.3183099+.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float noise(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=.5; } return v; }`;

const SKY_VERT = `varying vec3 vDir; void main(){ vDir=position; vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position=p.xyww; }`;
const SKY_FRAG = `
uniform vec3 c1,c2,n1,n2,aur; uniform float time; varying vec3 vDir;
${NOISE}
// aurora curtains: sharp lower edge, soft rays fading upward, drifting slowly around the horizon
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
  col+=mix(aur,n2*1.3,clamp((d.y-.15)*2.2,0.,1.))*au*1.5;
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
const medalFor = (t, par) => t <= par ? 'gold' : t <= par * 1.5 ? 'silver' : 'bronze';

/* ================================================================== GAME */
export async function createGame(opts) {
  const { container, audio, getSettings, onPause, onLevelComplete, onFinish, onQuit, getRelics, onRelic, getProgress, onAttempt, onDeath } = opts;
  const A = audio.A;
  let S = getSettings();
  const T = k => (STR[S.language] || STR.English)[k] || STR.English[k];

  /* ---------- renderer / post ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.className = 'g-canvas';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, .1, 4000);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .18;

  const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const afterimage = new AfterimagePass(.72);
  composer.addPass(afterimage);
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .55, .45, .92);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------- models ---------- */
  const loader = new GLTFLoader();
  const models = {}, clips = {};
  await Promise.all(Object.entries(MODEL_DATA).map(([k, u8]) => new Promise((res, rej) => {
    const ab = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
    loader.parse(ab, '', g => { models[k] = g.scene; clips[k] = g.animations; res(); }, rej);
  })));
  const partsOf = name => {
    const out = []; const sc = models[name]; sc.updateMatrixWorld(true);
    sc.traverse(o => { if (o.isMesh) { const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld); out.push({ geometry: g, material: o.material }); } });
    return out;
  };
  const PARTS = {};
  for (const k of INSTANCED) PARTS[k] = partsOf(k);
  const glowTex = glowTexture();

  /* ---------- static sky ---------- */
  const skyU = { c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, n1: { value: new THREE.Vector3() }, n2: { value: new THREE.Vector3() }, aur: { value: new THREE.Vector3() }, time: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24),
    new THREE.ShaderMaterial({ uniforms: skyU, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false, fog: false }));
  sky.renderOrder = -10; sky.frustumCulled = false;
  scene.add(sky);

  const planetU = { col: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(1, .6, .4).normalize() }, time: { value: 0 } };
  const planet = new THREE.Mesh(new THREE.SphereGeometry(170, 64, 32),
    new THREE.ShaderMaterial({ uniforms: planetU, vertexShader: PLANET_VERT, fragmentShader: PLANET_FRAG, fog: false }));
  scene.add(planet);

  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true }));
  sunSprite.scale.setScalar(260);
  scene.add(sunSprite);

  const STAR_N = 2600;
  const starGeo = new THREE.BufferGeometry();
  { const p = new Float32Array(STAR_N * 3), c = new Float32Array(STAR_N * 3);
    for (let i = 0; i < STAR_N; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(900 + Math.random() * 300);
      p.set([v.x, v.y, v.z], i * 3);
      const col = new THREE.Color().setHSL(.55 + Math.random() * .35, .6, .75 + Math.random() * .25);
      c.set([col.r, col.g, col.b], i * 3);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(p, 3)); starGeo.setAttribute('color', new THREE.BufferAttribute(c, 3)); }
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 3, sizeAttenuation: false, map: glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  stars.frustumCulled = false;
  scene.add(stars);

  /* ---------- lights ---------- */
  const hemi = new THREE.HemisphereLight(0x9fb4ff, 0x1a0f22, .45);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 1.9);
  sun.castShadow = true;
  sun.shadow.bias = -.0004; sun.shadow.normalBias = .03;
  scene.add(sun, sun.target);
  const playerLight = new THREE.PointLight(0x9fe8ff, 2.2, 8, 2);
  scene.add(playerLight);

  /* ---------- particles ---------- */
  const PN = 1100;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(PN * 3), pCol = new Float32Array(PN * 3);
  const pVel = new Float32Array(PN * 3), pLife = new Float32Array(PN), pMax = new Float32Array(PN), pBase = new Float32Array(PN * 3);
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: .32, map: glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  pts.frustumCulled = false;
  scene.add(pts);
  let pNext = 0;
  function emit(pos, color, n, speed, life = 1, up = 0, spread = 1) {
    const c = new THREE.Color(color);
    for (let k = 0; k < n; k++) {
      const i = pNext = (pNext + 1) % PN;
      const d = new THREE.Vector3().randomDirection().multiplyScalar(speed * (.3 + Math.random() * .7));
      pPos.set([pos.x + (Math.random() - .5) * spread * .3, pos.y + (Math.random() - .5) * spread * .3, pos.z + (Math.random() - .5) * spread * .3], i * 3);
      pVel.set([d.x, d.y + up, d.z], i * 3);
      pLife[i] = pMax[i] = life * (.6 + Math.random() * .6);
      pBase.set([c.r, c.g, c.b], i * 3);
    }
  }
  function updateParticles(dt) {
    for (let i = 0; i < PN; i++) {
      if (pLife[i] <= 0) { pCol[i * 3] = pCol[i * 3 + 1] = pCol[i * 3 + 2] = 0; continue; }
      pLife[i] -= dt;
      const k = Math.max(pLife[i] / pMax[i], 0);
      pVel[i * 3 + 1] -= .6 * dt;
      for (let a = 0; a < 3; a++) { pVel[i * 3 + a] *= (1 - 1.2 * dt); pPos[i * 3 + a] += pVel[i * 3 + a] * dt; pCol[i * 3 + a] = pBase[i * 3 + a] * k * k; }
    }
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true;
  }

  const DUST_N = 700;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(DUST_N * 3);
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({ size: .22, map: glowTex, color: 0xffffff, transparent: true, opacity: .8, depthWrite: false, blending: THREE.AdditiveBlending });
  const dust = new THREE.Points(dustGeo, dustMat); dust.frustumCulled = false;
  scene.add(dust);

  /* ---------- HUD ---------- */
  const hud = document.createElement('div');
  hud.className = 'g-hud';
  hud.innerHTML = `
    <div class="g-hit"></div>
    <div class="g-tl"><div class="g-lvl"></div><div class="g-hearts"></div><div class="g-row"><div class="g-shards"><i></i><i></i><i></i></div><div class="g-relics"></div></div></div>
    <div class="g-tr"><div class="g-timer">0:00.0</div><div class="g-par"></div><div class="g-fps"></div></div>
    <div class="g-msg"></div>
    <div class="g-relicmsg"><small></small><b></b></div>
    <div class="g-prompt"></div>
    <canvas class="g-map" width="200" height="200"></canvas>
    <div class="g-hints"></div>
    <div class="g-title"><small></small><h1></h1><p></p></div>
    <div class="g-lock"><span></span></div>
    <div class="g-complete"><div class="g-medal"></div><small></small><h1></h1><div class="g-stats"></div><div class="g-btns"><button class="g-btn g-btn2" data-a="menu"></button><button class="g-btn" data-a="next"></button></div></div>
    <div class="g-ov"><div class="ov-card">
      <div class="ov-head"><div class="ov-tabs"><i class="ov-ind"></i><button data-t="0">Records</button><button data-t="1">Collection</button></div>
      <div class="ov-keys"></div></div>
      <div class="ov-body"></div></div></div>
    <div class="g-fade"></div>`;
  container.appendChild(hud);
  const $h = s => hud.querySelector(s);
  const H = { lvl: $h('.g-lvl'), hearts: $h('.g-hearts'), shards: [...hud.querySelectorAll('.g-shards i')], relics: $h('.g-relics'), timer: $h('.g-timer'), par: $h('.g-par'), fps: $h('.g-fps'),
    msg: $h('.g-msg'), relicMsg: $h('.g-relicmsg'), prompt: $h('.g-prompt'), map: $h('.g-map'), hints: $h('.g-hints'), title: $h('.g-title'), lock: $h('.g-lock'),
    complete: $h('.g-complete'), fade: $h('.g-fade'), hit: $h('.g-hit') };
  const mapCtx = H.map.getContext('2d');
  let msgTimer = 0;
  function message(text, secs = 3) { H.msg.textContent = text; H.msg.classList.remove('show'); void H.msg.offsetWidth; H.msg.classList.add('show'); msgTimer = secs; }
  function fade(to, ms = 350) { H.fade.style.transition = `opacity ${ms}ms ease`; H.fade.style.opacity = to; return new Promise(r => setTimeout(r, ms)); }
  function renderHints() {
    const p = showPad();
    const k = p
      ? [['L', T('move')], ['R', T('look')], ['✕', T('jump')], ['R2', T('sprint')], ['Touchpad', 'Records'], ['☰', T('pause')]]
      : [['WASD', T('move')], ['Mouse', T('look')], ['Space', T('jump')], ['Shift', T('sprint')], ['Tab', 'Records'], ['Esc', T('pause')]];
    H.hints.innerHTML = k.map(([a, b]) => `<span><b>${a}</b>${b}</span>`).join('');
  }

  /* ---------- materials (per level palette) ---------- */
  let matCache = new Map();
  let pal = LEVELS[0].palette;
  function mat(orig, key = orig.name) {
    if (matCache.has(key)) return matCache.get(key);
    const m = orig.clone();
    switch (key) {
      case 'Stone': m.color.set(0x3b3e4c).lerp(new THREE.Color(pal.fog), .2); m.roughness = .88; m.metalness = .05; m.envMapIntensity = .4; break;
      case 'Rock': m.color.set(0x2a2230); m.roughness = .95; m.flatShading = true; break;
      case 'Trim': m.emissive.set(pal.trim); m.emissiveIntensity = .75; m.color.set(0x000000); break;
      case 'TrimWarn': m.emissive.set(0xff7a2e); m.emissiveIntensity = 1.4; m.color.set(0x000000); break;
      case 'Crystal': m.color.set(pal.crystal).multiplyScalar(.55); m.emissive.set(pal.crystal); m.emissiveIntensity = .55; m.roughness = .18; m.metalness = .35; m.flatShading = true; break;
      case 'Shard': m.emissive.set(0xffc35a); m.emissiveIntensity = 4; break;
      case 'PortalRing': m.emissive.set(pal.trim); m.color.set(pal.trim); m.emissiveIntensity = 1.2; break;
      case 'Pad': m.emissive.set(pal.crystal); m.emissiveIntensity = 3; break;
      case 'Bulb': m.emissive.set(pal.trim); m.emissiveIntensity = 3.5; break;
      case 'Thruster': m.emissive.set(pal.trim); m.emissiveIntensity = 4; break;
      case 'Visor': m.emissiveIntensity = 1.1; m.envMapIntensity = 2.5; break;
      case 'Danger': m.emissiveIntensity = 3.5; break;
      case 'Relic': m.emissive.set(pal.aur ? new THREE.Color(...pal.aur) : 0x7fffd4); m.emissiveIntensity = 3.5; break;
      case 'RelicGhost': m.transparent = true; m.opacity = .28; m.color.set(0xffffff); m.emissive.set(0x9fffe0); m.emissiveIntensity = .5; m.metalness = 0; m.depthWrite = false; break;
      default:
        // relic materials (made in Blender, named R*) glow harder in-game so bloom picks them up
        if (/^R[A-Z]/.test(key) && m.emissiveIntensity > 0) m.emissiveIntensity *= 4.5;
    }
    m.needsUpdate = true;
    matCache.set(key, m);
    return m;
  }
  function cloneModel(name, remap = {}) {
    const o = name === 'player' ? SkeletonUtils.clone(models[name]) : models[name].clone(true);
    o.traverse(c => { if (c.isMesh) { const k = remap['*'] || remap[c.material.name] || c.material.name; c.material = mat(c.material, k); c.castShadow = true; c.receiveShadow = true; } });
    return o;
  }
  function instanced(name, matrices, { cast = true, receive = true } = {}) {
    return PARTS[name].map(p => {
      const im = new THREE.InstancedMesh(p.geometry, mat(p.material), Math.max(matrices.length, 1));
      matrices.forEach((m, i) => im.setMatrixAt(i, m));
      im.count = matrices.length;
      im.castShadow = cast; im.receiveShadow = receive;
      im.instanceMatrix.needsUpdate = true;
      im.computeBoundingSphere();
      return im;
    });
  }

  /* ---------- level state ---------- */
  let L = null;
  let levelIndex = 0;
  const FLOORCH = '.SE*B#DRXH';
  const cellCh = (r, c) => (L.map[r] && L.map[r][c]) || ' ';
  const cellPos = (r, c) => new THREE.Vector3((c - (L.W - 1) / 2) * TILE, 0, (r - (L.H - 1) / 2) * TILE);
  const cellOf = (x, z) => [Math.round(z / TILE + (L.H - 1) / 2), Math.round(x / TILE + (L.W - 1) / 2)];
  // is this cell currently something you can stand on?
  function solidFloor(r, c) {
    const ch = cellCh(r, c);
    if (FLOORCH.includes(ch)) return true;
    if (ch === 'C') { const k = L.crumbles.get(r * 100 + c); return k && (k.state === 'idle' || k.state === 'shake'); }
    return false;
  }

  const asteroidState = [];
  let asteroidMeshes = [];

  function disposeLevel() {
    if (!L) return;
    scene.remove(L.group);
    for (const m of matCache.values()) m.dispose();
    matCache = new Map();
    L = null;
  }

  function buildLevel(i) {
    disposeLevel();
    levelIndex = i;
    const def = LEVELS[i];
    pal = def.palette;
    const map = def.map, Hh = map.length, W = Math.max(...map.map(r => r.length));
    L = { def, map, W, H: Hh, group: new THREE.Group(), shards: [], platforms: [], pads: [], crumbles: new Map(), drones: [], lasers: [], spikes: [], relics: [], portal: null, start: null, explored: new Set() };
    scene.add(L.group);
    const rnd = (() => { let s = 1234 + i * 99; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    const M4 = (x, y, z, ry = 0, s = 1, sy = s) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), new THREE.Vector3(s, sy, s));
    const saved = (getRelics && getRelics(i)) || [];

    const tiles = [[], [], []], crystals = [[], [], []], flora = [[], []];
    let relicIdx = 0;
    for (let r = 0; r < Hh; r++) for (let c = 0; c < W; c++) {
      const ch = cellCh(r, c), p = cellPos(r, c);
      if (FLOORCH.includes(ch)) tiles[Math.floor(rnd() * 3)].push(M4(p.x, 0, p.z, Math.floor(rnd() * 4) * Math.PI / 2));
      if (ch === '#') {
        crystals[Math.floor(rnd() * 3)].push(M4(p.x, 0, p.z, rnd() * 6.28, 1.3 + rnd() * .15, 1.15 + rnd() * .35));
        for (let k = 0; k < 2; k++) {
          const a = rnd() * 6.28;
          crystals[Math.floor(rnd() * 3)].push(M4(p.x + Math.cos(a) * 1.1, 0, p.z + Math.sin(a) * 1.1, rnd() * 6.28, .75 + rnd() * .25, .7 + rnd() * .5));
        }
      }
      if (ch === '.' && rnd() < .45) {
        const a = rnd() * 6.28, d = 1.1 + rnd() * .6;
        flora[Math.floor(rnd() * 2)].push(M4(p.x + Math.cos(a) * d, 0, p.z + Math.sin(a) * d, rnd() * 6.28, .8 + rnd() * .6));
      }
      if (ch === 'S') L.start = p.clone();
      if (ch === '*') {
        const o = cloneModel('shard'); o.position.set(p.x, 1.3, p.z);
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffc35a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .7 }));
        halo.scale.setScalar(2.4); o.add(halo);
        const light = new THREE.PointLight(0xffc35a, 8, 10, 2); light.position.y = .3; o.add(light);
        L.group.add(o); L.shards.push({ obj: o, home: p.clone(), taken: false, r, c });
      }
      if (ch === 'H') {
        const idx = relicIdx++, had = !!saved[idx];
        const gIdx = def.relicIds ? def.relicIds[idx] : Math.min(i * 2 + idx, 11);
        const o = cloneModel('relic_' + gIdx, had ? { '*': 'RelicGhost' } : {});
        o.scale.setScalar(1.25);
        o.position.set(p.x, 1.3, p.z);
        if (!had) {
          const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: new THREE.Color(...pal.aur), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .55 }));
          halo.scale.setScalar(2); o.add(halo);
        }
        L.group.add(o); L.relics.push({ obj: o, idx, gIdx, had, taken: false, r, c, name: def.relics[idx] || 'Relic' });
      }
      if (ch === 'B') { const o = cloneModel('pad'); o.position.set(p.x, 0, p.z); L.group.add(o); L.pads.push({ obj: o, pos: p.clone(), pulse: 0 }); }
      if (ch === 'C') {
        const o = cloneModel('tile_1', { Trim: 'TrimWarn' }); o.position.copy(p); L.group.add(o);
        L.crumbles.set(r * 100 + c, { obj: o, pos: p.clone(), state: 'idle', t: 0, vy: 0 });
      }
      if (ch === 'X') {
        const o = cloneModel('spikes'); o.position.set(p.x, -1.3, p.z); L.group.add(o);
        L.spikes.push({ obj: o, pos: p.clone(), phase: ((r * 7 + c * 3) % 10) / 10, h: -1.3, warned: false });
      }
      if (ch === 'R') {
        const o = cloneModel('emitter'); o.position.copy(p); L.group.add(o);
        const beam = new THREE.Group(); beam.position.set(p.x, .8, p.z);
        const bm = new THREE.MeshBasicMaterial({ color: 0xff3348, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false });
        const bcore = new THREE.MeshBasicMaterial({ color: 0xffd0d6, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false });
        const len = 7.2;
        const g1 = new THREE.CylinderGeometry(.11, .11, len * 2, 8, 1, true); g1.rotateZ(Math.PI / 2);
        const g2 = new THREE.CylinderGeometry(.04, .04, len * 2, 6, 1, true); g2.rotateZ(Math.PI / 2);
        beam.add(new THREE.Mesh(g1, bm), new THREE.Mesh(g2, bcore));
        const l = new THREE.PointLight(0xff3348, 5, 9, 2); beam.add(l);
        L.group.add(beam);
        L.lasers.push({ obj: o, beam, pos: p.clone(), len, angle: rnd() * 6.28, speed: (.95 + i * .09) * (def.hazard || 1) * (L.lasers.length % 2 ? -1 : 1) });
      }
      if (ch === 'D') {
        // patrol the longest straight run of walkable cells through this spot
        const run = (dr, dc) => { let a = 0, b = 0; while (FLOORCH.replace('#', '').includes(cellCh(r - (a + 1) * dr, c - (a + 1) * dc)) && cellCh(r - (a + 1) * dr, c - (a + 1) * dc) !== '#') a++; while (FLOORCH.replace('#', '').includes(cellCh(r + (b + 1) * dr, c + (b + 1) * dc)) && cellCh(r + (b + 1) * dr, c + (b + 1) * dc) !== '#') b++; return [a, b]; };
        const [h1, h2] = run(0, 1), [v1, v2] = run(1, 0);
        const horiz = h1 + h2 >= v1 + v2;
        const A_ = horiz ? cellPos(r, c - h1) : cellPos(r - v1, c), B_ = horiz ? cellPos(r, c + h2) : cellPos(r + v2, c);
        const o = cloneModel('drone'); o.position.set(p.x, 1.1, p.z); L.group.add(o);
        const light = new THREE.PointLight(0xff3348, 4, 7, 2); o.add(light);
        L.drones.push({ obj: o, a: A_, b: B_, pos: p.clone().setY(1.1), t: A_.distanceTo(p) / Math.max(A_.distanceTo(B_), .01), dir: 1, len: Math.max(A_.distanceTo(B_), .01), speed: (3 + i * .3) * (def.hazard || 1) });
      }
      if (ch === 'E') {
        const o = cloneModel('portal'); o.position.copy(p);
        const open = [[0, 1], [0, -1], [1, 0], [-1, 0]].find(([dr, dc]) => FLOORCH.includes(cellCh(r + dr, c + dc)) && cellCh(r + dr, c + dc) !== '#');
        if (open && open[0] === 0) o.rotation.y = Math.PI / 2;
        const u = { time: { value: 0 }, uActive: { value: 0 }, col: { value: new THREE.Color(pal.trim) } };
        const disc = new THREE.Mesh(new THREE.CircleGeometry(1.62, 64), new THREE.ShaderMaterial({ uniforms: u, vertexShader: UV_VERT, fragmentShader: PORTAL_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
        disc.position.y = 2.6; o.add(disc);
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.9, 60, 32, 1, true), new THREE.MeshBasicMaterial({ color: pal.trim, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
        beam.position.y = 30; o.add(beam);
        const light = new THREE.PointLight(pal.trim, 4, 16, 2); light.position.y = 2.6; o.add(light);
        L.group.add(o); L.portal = { obj: o, u, beam, light, pos: p.clone(), active: false, a: 0 };
      }
    }
    for (let r = 0; r < Hh; r++) for (let c = 0; c < W; c++) if (cellCh(r, c) === 'M') {
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        let a = [r, c], b = [r, c];
        while ('M~'.includes(cellCh(a[0] - dr, a[1] - dc))) a = [a[0] - dr, a[1] - dc];
        while ('M~'.includes(cellCh(b[0] + dr, b[1] + dc))) b = [b[0] + dr, b[1] + dc];
        if (a[0] === b[0] && a[1] === b[1]) continue;
        const o = cloneModel('platform');
        const pa = cellPos(...a), pb = cellPos(...b), len = pa.distanceTo(pb);
        L.group.add(o);
        L.platforms.push({ obj: o, a: pa, b: pb, len, t: pa.distanceTo(cellPos(r, c)) / len, dir: 1, wait: 0, pos: cellPos(r, c), delta: new THREE.Vector3() });
        o.position.copy(cellPos(r, c));
      }
    }
    tiles.forEach((m, k) => m.length && instanced('tile_' + (k + 1), m).forEach(x => L.group.add(x)));
    crystals.forEach((m, k) => m.length && instanced('crystal_' + (k + 1), m).forEach(x => L.group.add(x)));
    flora.forEach((m, k) => m.length && instanced('flora_' + (k + 1), m, { cast: false }).forEach(x => L.group.add(x)));

    const size = Math.max(W, Hh) * TILE;
    const far = [[], [], []];
    for (let k = 0; k < 34; k++) {
      const a = rnd() * 6.28, d = size * 1.15 + rnd() * size * 1.6;
      far[k % 3].push(M4(Math.cos(a) * d, -22 - rnd() * 45 + (rnd() < .3 ? 34 : 0), Math.sin(a) * d, rnd() * 6.28, 1.5 + rnd() * 3.5));
    }
    far.forEach((m, k) => instanced('tile_' + (k + 1), m, { cast: false }).forEach(x => L.group.add(x)));
    asteroidState.length = 0;
    const ast = [[], []];
    for (let k = 0; k < 90; k++) {
      const a = rnd() * 6.28, d = size * 1.1 + rnd() * size * 1.8;
      asteroidState.push({ p: new THREE.Vector3(Math.cos(a) * d, -50 + rnd() * 90, Math.sin(a) * d), s: .6 + rnd() * 3.2, rot: new THREE.Euler(rnd() * 6, rnd() * 6, rnd() * 6), spin: new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() - .5).multiplyScalar(.4), orbit: (rnd() - .5) * .01, v: k % 2, idx: ast[k % 2].length });
      ast[k % 2].push(new THREE.Matrix4());
    }
    asteroidMeshes = [instanced('asteroid_1', ast[0], { cast: false }), instanced('asteroid_2', ast[1], { cast: false })];
    asteroidMeshes.flat().forEach(x => L.group.add(x));

    skyU.c1.value.set(pal.sky1); skyU.c2.value.set(pal.sky2);
    skyU.n1.value.set(...pal.neb); skyU.n2.value.set(...pal.neb2); skyU.aur.value.set(...(pal.aur || [.3, 1, .7]));
    scene.fog = new THREE.FogExp2(pal.fog, .0055);
    planetU.col.value.set(pal.planet);
    const sunDir = new THREE.Vector3(i % 2 ? -.8 : .9, .55, i % 3 === 2 ? .7 : -.35).normalize();
    planetU.sunDir.value.copy(sunDir);
    sun.color.set(pal.sun); hemi.color.set(pal.trim).lerp(new THREE.Color(0xffffff), .6); hemi.groundColor.set(pal.fog);
    sun.position.copy(sunDir).multiplyScalar(size * 1.2); sun.target.position.set(0, 0, 0);
    const sc = sun.shadow.camera; sc.left = sc.bottom = -size * .8; sc.right = sc.top = size * .8; sc.near = 1; sc.far = size * 3; sc.updateProjectionMatrix();
    sunSprite.material.color.set(pal.sun);
    playerLight.color.set(pal.trim);
    planet.position.copy(new THREE.Vector3(-sunDir.x, -.25, -sunDir.z).normalize().multiplyScalar(900));
    dustMat.color.set(pal.trim);
    for (let k = 0; k < DUST_N; k++) dustPos.set([(rnd() - .5) * size * 1.6, -12 + rnd() * 26, (rnd() - .5) * size * 1.6], k * 3);
    dustGeo.attributes.position.needsUpdate = true;

    // player (rigged + animated)
    if (P.obj) { scene.remove(P.obj); }
    P.obj = new THREE.Group();
    P.model = cloneModel('player');
    P.obj.add(P.model); scene.add(P.obj);
    P.mixer = new THREE.AnimationMixer(P.model);
    P.actions = {};
    for (const clip of clips.player) P.actions[clip.name] = P.mixer.clipAction(clip);
    P.anim = null; playAnim('Idle', 0);
  }

  /* ---------- player ---------- */
  const P = {
    obj: null, model: null, mixer: null, actions: {}, anim: null,
    pos: new THREE.Vector3(), vel: new THREE.Vector3(), yaw: 0, grounded: false, coyote: 0, jumpBuf: 0,
    sprintToggle: false, launched: false, plat: null, lastSafe: new THREE.Vector3(), checkpoint: new THREE.Vector3(),
    stepT: 0, squash: 0, fallSfx: false, trailT: 0, shardsTaken: 0, relicsTaken: 0, dying: false, hearts: 3, invuln: 0, hitT: 0,
  };
  function playAnim(name, fadeT = .18) {
    if (P.anim === name || !P.actions[name]) return;
    const next = P.actions[name];
    next.reset().setEffectiveWeight(1).play();
    if (P.anim && P.actions[P.anim]) P.actions[P.anim].crossFadeTo(next, fadeT, false);
    P.anim = name;
  }
  const cam = { yaw: 0, pitch: .72, dist: 10, target: new THREE.Vector3(), shake: 0, fov: 75 };

  function spawn(at) {
    P.pos.copy(at); P.vel.set(0, 0, 0); P.grounded = true; P.launched = false; P.plat = null; P.fallSfx = false; P.dying = false;
    cam.target.copy(at).add(new THREE.Vector3(0, 1.3, 0));
  }

  function supportAt(x, z) {
    for (const p of L.platforms) if (Math.abs(x - p.pos.x) < 1.95 && Math.abs(z - p.pos.z) < 1.95) return { h: 0, plat: p };
    for (const [dx, dz] of [[0, 0], [.32, 0], [-.32, 0], [0, .32], [0, -.32]]) {
      const [r, c] = cellOf(x + dx, z + dz);
      if (solidFloor(r, c)) return { h: 0, plat: null };
    }
    return null;
  }
  function pushOut(cx, cz, half, R) {
    const qx = clamp(P.pos.x, cx - half, cx + half), qz = clamp(P.pos.z, cz - half, cz + half);
    let dx = P.pos.x - qx, dz = P.pos.z - qz; const d = Math.hypot(dx, dz);
    if (d >= R) return;
    if (d < 1e-4) { dx = P.pos.x - cx; dz = P.pos.z - cz; const n = Math.hypot(dx, dz) || 1; P.pos.x = cx + dx / n * (half + R); P.pos.z = cz + dz / n * (half + R); return; }
    P.pos.x += dx / d * (R - d); P.pos.z += dz / d * (R - d);
    const vn = (P.vel.x * dx + P.vel.z * dz) / d; if (vn < 0) { P.vel.x -= vn * dx / d; P.vel.z -= vn * dz / d; }
  }
  function collideWalls() {
    const [r0, c0] = cellOf(P.pos.x, P.pos.z);
    for (let r = r0 - 1; r <= r0 + 1; r++) for (let c = c0 - 1; c <= c0 + 1; c++) {
      if (cellCh(r, c) === '#' && P.pos.y < 3.6) { const cp = cellPos(r, c); pushOut(cp.x, cp.z, 1.75, .42); }
    }
    for (const l of L.lasers) if (P.pos.y < 1.6) pushOut(l.pos.x, l.pos.z, .45, .42);
  }

  /* ---------- input ---------- */
  const keys = new Set();
  let jumpPressed = false, interactPressed = false, sprintPressed = false, locked = false, suppressUnlockPause = false;
  const onKey = e => {
    if (!running) return;
    if (e.type === 'keydown' && e.defaultPrevented) return;
    const k = e.code;
    if (e.type === 'keydown') {
      if (state === 'complete' && !e.repeat) {
        if (['ArrowLeft', 'KeyA'].includes(k)) { e.preventDefault(); setCFocus(0); }
        if (['ArrowRight', 'KeyD'].includes(k)) { e.preventDefault(); setCFocus(1); }
        if (['Enter', 'Space', 'KeyE'].includes(k)) { e.preventDefault(); activateComplete(); }
        if (['Escape', 'KeyQ', 'Backspace'].includes(k)) { e.preventDefault(); quitFromComplete(); }
        return;
      }
      if (ov.open) {
        e.preventDefault();
        if (k === 'Tab' || k === 'Escape' || k === 'Backspace') closeOverlay();
        else if (k === 'ArrowRight' || k === 'KeyE' || k === 'Digit2') setOvTab(1);
        else if (k === 'ArrowLeft' || k === 'KeyQ' || k === 'Digit1') setOvTab(0);
        return;
      }
      if (k === 'Tab' && state === 'playing' && !paused && !e.repeat) { e.preventDefault(); openOverlay(); return; }
      if (k === 'Escape' || k === 'KeyP') { e.preventDefault(); pause(); return; }
      if (paused) return;
      if (k === 'Space' && !e.repeat) jumpPressed = true;
      if (k === 'KeyE' && !e.repeat) interactPressed = true;
      if ((k === 'ShiftLeft' || k === 'ShiftRight') && !e.repeat) sprintPressed = true;
      if (k === 'KeyR' && !e.repeat && state === 'playing') respawn('manual');
      keys.add(k);
      if (k.startsWith('Arrow') || k === 'Space') e.preventDefault();
    } else keys.delete(k);
  };
  addEventListener('keydown', onKey); addEventListener('keyup', onKey);
  renderer.domElement.addEventListener('click', () => { if (running && !paused && state === 'playing') requestLock(); });
  H.lock.addEventListener('click', () => requestLock());
  H.complete.querySelector('[data-a="next"]').addEventListener('click', () => continueAfterComplete());
  H.complete.querySelector('[data-a="next"]').addEventListener('pointerenter', () => { if (state === 'complete') setCFocus(1); });
  H.complete.querySelector('[data-a="menu"]').addEventListener('pointerenter', () => { if (state === 'complete') setCFocus(0); });
  H.complete.querySelector('[data-a="menu"]').addEventListener('click', () => quitFromComplete());
  function requestLock() {
    const el = renderer.domElement;
    const plain = () => { try { const q = el.requestPointerLock(); if (q && q.catch) q.catch(() => showLockHint()); } catch (_) { showLockHint(); } };
    try { const p = el.requestPointerLock({ unadjustedMovement: true }); if (p && p.catch) p.catch(plain); } catch (e) { plain(); }
  }
  function showLockHint() { if (running && !paused && state === 'playing' && !getPad()) H.lock.classList.add('show'); }
  document.addEventListener('pointerlockchange', () => {
    locked = document.pointerLockElement === renderer.domElement;
    H.lock.classList.toggle('show', running && !paused && !locked && state === 'playing' && !getPad());
    if (!locked && running && !paused && state === 'playing' && !suppressUnlockPause) pause();
    suppressUnlockPause = false;
  });
  addEventListener('mousemove', e => {
    if (!locked || paused) return;
    const inv = S.invert ? -1 : 1;
    cam.yaw -= e.movementX * .0024 * S.sensX / 6.5;
    cam.pitch = clamp(cam.pitch + e.movementY * .0024 * S.sensY / 6.5 * inv, .06, 1.3);
  });
  addEventListener('wheel', e => { if (running && !paused) cam.dist = clamp(cam.dist + Math.sign(e.deltaY) * .8, 5, 16); }, { passive: true });
  addEventListener('blur', () => { if (running && !paused && state === 'playing') pause(); });

  // controller icons are only shown when a pad is connected and Controller Prompts is on
  const showPad = () => !!getPad() && S.padPrompts !== false;
  const getPad = () => { const ps = navigator.getGamepads ? navigator.getGamepads() : []; for (const p of ps) if (p && p.connected) return p; return null; };
  let padPrev = [];
  function rumble(ms, strong, weak) {
    if (!S.vibration) return;
    const p = getPad(); if (p && p.vibrationActuator) { try { p.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: strong, weakMagnitude: weak }); } catch (e) {} }
  }
  function readPad(dt) {
    const p = getPad(); const out = { mx: 0, mz: 0, sprint: false };
    if (!p) return out;
    const b = i => !!(p.buttons[i] && (p.buttons[i].pressed || p.buttons[i].value > .5));
    const edge = i => b(i) && !padPrev[i];
    const dz = .1 + S.deadzone / 100;
    const lx = p.axes[0] || 0, ly = p.axes[1] || 0, lm = Math.hypot(lx, ly);
    if (lm > dz) { const k = Math.min((lm - dz) / (1 - dz), 1) / lm; out.mx = lx * k; out.mz = ly * k; }
    const rx = p.axes[2] || 0, ry = p.axes[3] || 0, rm = Math.hypot(rx, ry);
    if (rm > dz) {
      const k = Math.min((rm - dz) / (1 - dz), 1) / rm, inv = S.invert ? -1 : 1;
      cam.yaw -= rx * k * 2.8 * dt * S.sensX / 6.5;
      cam.pitch = clamp(cam.pitch + ry * k * 2.0 * dt * S.sensY / 6.5 * inv, .06, 1.3);
    }
    if (state === 'complete') {
      const sx = Math.abs(lx) > .55 ? Math.sign(lx) : 0;
      if (edge(14) || (sx < 0 && cStickPrev >= 0)) setCFocus(0);
      else if (edge(15) || (sx > 0 && cStickPrev <= 0)) setCFocus(1);
      cStickPrev = sx;
      if (edge(0)) activateComplete();
      else if (edge(1)) quitFromComplete();
      padPrev = p.buttons.map(x => x.pressed || x.value > .5);
      return out;
    }
    if (ov.open) {
      if (edge(5) || edge(15)) setOvTab(1);
      else if (edge(4) || edge(14)) setOvTab(0);
      else if (edge(17) || edge(1) || edge(9) || edge(8)) closeOverlay();
      padPrev = p.buttons.map(x => x.pressed || x.value > .5);
      return out;
    }
    if (edge(17) && state === 'playing') { padPrev = p.buttons.map(x => x.pressed || x.value > .5); openOverlay(); return out; }
    if (edge(0)) jumpPressed = true;
    if (edge(2)) interactPressed = true;
    if (edge(10)) sprintPressed = true;
    if (edge(9) || edge(8)) { padPrev = p.buttons.map(x => x.pressed); pause(); return out; }
    if (b(0)) out.jumpHeld = true;
    out.sprint = b(7) || b(5);
    padPrev = p.buttons.map(x => x.pressed || x.value > .5);
    return out;
  }

  /* ---------- sound ---------- */
  const rnd = Math.random;
  const snd = {
    step() { A.noise({ dur: .07, from: 1500 + rnd() * 500, to: 700, vol: .045, send: .05, q: .9 }); A.tone({ f: 110 + rnd() * 25, to: 70, dur: .06, vol: .05, send: 0 }); },
    jump() { A.tone({ f: 330, to: 660, type: 'triangle', dur: .14, vol: .07, send: .2 }); A.noise({ dur: .2, from: 700, to: 3000, vol: .04, send: .1 }); },
    land(v) { const k = clamp(v / 22, .15, 1); A.tone({ f: 120, to: 48, dur: .2, vol: .2 * k, send: 0 }); A.noise({ dur: .14, from: 1400, to: 250, vol: .07 * k, send: .05 }); },
    shard(n) {
      const base = [523.25, 587.33, 659.25][n % 3];
      [1, 1.25, 1.5, 2, 2.5].forEach((m, i) => A.tone({ f: base * m, at: i * .055, dur: .9, vol: .06, send: .7, type: i % 2 ? 'triangle' : 'sine' }));
      A.noise({ dur: .5, from: 2000, to: 9000, vol: .03, send: .5 });
    },
    relic() {
      [392, 493.88, 587.33, 739.99, 987.77, 1174.66, 1479.98].forEach((f, i) => A.tone({ f, at: i * .07, dur: 1.6, vol: .055, send: .9, type: i % 2 ? 'triangle' : 'sine' }));
      A.noise({ dur: 1.2, from: 400, to: 10000, vol: .05, send: .8, peak: .5 });
      A.tone({ f: 98, to: 60, dur: .9, vol: .25, send: .3 });
    },
    awaken() {
      A.tone({ f: 65, to: 45, dur: 2.2, vol: .3, send: .4 });
      A.noise({ dur: 2, from: 150, to: 6000, vol: .07, send: .8, peak: .6 });
      [261.63, 392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => A.tone({ f, at: .15 + i * .12, dur: 2.8, vol: .05, a: .05, send: .9 }));
    },
    bounce() { A.tone({ f: 170, to: 720, dur: .38, vol: .2, send: .3 }); A.tone({ f: 340, to: 1440, type: 'triangle', dur: .28, vol: .05, send: .3 }); },
    fall() { A.noise({ dur: 1.5, from: 3000, to: 120, vol: .08, send: .6 }); A.tone({ f: 620, to: 70, dur: 1.4, vol: .06, send: .7 }); },
    respawn() { A.noise({ dur: .6, from: 200, to: 6000, vol: .06, send: .6 }); A.tone({ f: 392, to: 784, dur: .6, vol: .06, send: .8 }); },
    hit() { A.tone({ f: 220, to: 70, type: 'sawtooth', dur: .35, vol: .12, send: .2 }); A.noise({ dur: .3, from: 3000, to: 300, vol: .12, send: .1 }); A.tone({ f: 90, to: 40, dur: .3, vol: .3, send: 0 }); },
    dead() { [392, 311.13, 261.63, 196].forEach((f, i) => A.tone({ f, at: i * .16, dur: .7, vol: .07, type: 'triangle', send: .7 })); },
    crack() { A.noise({ dur: .25, from: 3500, to: 800, vol: .08, send: .1, q: 3 }); A.tone({ f: 160, to: 90, type: 'square', dur: .08, vol: .03, send: 0 }); },
    crumble() { A.noise({ dur: .9, from: 900, to: 120, vol: .1, send: .5 }); },
    spikeWarn() { A.tone({ f: 880, dur: .06, vol: .03, type: 'square', send: .05 }); },
    spike() { A.noise({ dur: .12, from: 6000, to: 2000, vol: .06, send: .05, q: 4 }); },
    enter() {
      A.noise({ dur: 1.4, from: 100, to: 10000, vol: .1, send: .8, peak: .8 });
      [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98].forEach((f, i) => A.tone({ f, at: .5 + i * .07, dur: 2.2, vol: .06, send: .9 }));
      A.tone({ f: 90, to: 40, at: .45, dur: 1.2, vol: .4, send: .2 });
    },
    locked() { A.tone({ f: 220, to: 180, type: 'triangle', dur: .15, vol: .07, send: .1 }); A.tone({ f: 165, at: .12, dur: .2, vol: .06, type: 'triangle', send: .1 }); },
  };
  let laserHum = null;
  function ensureHum() {
    if (laserHum || !A.ctx) return;
    const ctx = A.ctx, o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = 55; o2.type = 'square'; o2.frequency.value = 110.5;
    f.type = 'lowpass'; f.frequency.value = 600; g.gain.value = 0;
    o.connect(f); o2.connect(f); f.connect(g); A.out(g, 'sfx', .1); o.start(); o2.start();
    laserHum = { g, f };
  }
  function setHum(v) { if (!laserHum) return; laserHum.g.gain.setTargetAtTime(v, A.ctx.currentTime, .1); }

  /* ---------- game flow ---------- */
  let running = false, paused = false, state = 'playing', time = 0, completeAt = 0;
  let lastT = performance.now(), lastRender = 0, fpsAcc = 0, fpsN = 0;

  function maxHearts() { return Math.min(HEARTS[S.difficulty] || 3, (L && L.def.hearts) || 99); }
  function updateHearts(pop) {
    const m = maxHearts();
    H.hearts.innerHTML = Array.from({ length: m }, (_, i) => `<i class="${i < P.hearts ? 'on' : ''}${pop === i ? ' lost' : ''}"></i>`).join('');
  }
  function updateRelicHud() {
    const total = L.relics.length, found = L.relics.filter(r => r.had || r.taken).length;
    H.relics.innerHTML = total ? `<span>◆</span> ${found}/${total}` : '';
  }

  async function start(i) {
    running = true; paused = false; state = 'playing';
    jumpPressed = false; interactPressed = false; sprintPressed = false; keys.clear();
    hud.classList.remove('dim');
    container.classList.add('on');
    H.fade.style.transition = 'none'; H.fade.style.opacity = 1;
    buildLevel(i);
    applySettings(getSettings());
    spawn(L.start);
    P.checkpoint.copy(L.start); P.lastSafe.copy(L.start); P.shardsTaken = 0; P.hearts = maxHearts(); P.invuln = 0; P.hitT = 0;
    const [sr, sc] = cellOf(L.start.x, L.start.z);
    const open = [[0, 1], [1, 0], [0, -1], [-1, 0]].find(([dr, dc]) => FLOORCH.includes(cellCh(sr + dr, sc + dc)) && cellCh(sr + dr, sc + dc) !== '#') || [1, 0];
    cam.yaw = Math.atan2(-open[1], -open[0]); P.yaw = Math.atan2(open[1], open[0]);
    cam.pitch = .72; cam.dist = 10;
    time = 0; P.deathsRun = 0; updateShardHud(); updateHearts(); updateRelicHud(); renderHints();
    closeOverlay(true);
    onAttempt && onAttempt(i);
    H.lvl.textContent = `${T('level')} ${i + 1} · ${L.def.name}`;
    H.par.textContent = `${T('par')} ${fmtTime(L.def.par)}`;
    H.complete.classList.remove('show');
    H.title.querySelector('small').textContent = `${T('level')} ${i + 1}`;
    H.title.querySelector('h1').textContent = L.def.name;
    H.title.querySelector('p').textContent = L.def.sub;
    H.title.classList.remove('show'); void H.title.offsetWidth; H.title.classList.add('show');
    ensureHum(); setHum(0);
    lastT = performance.now();
    renderFrame(0);
    fade(0, 900);
    if (!getPad()) requestLock();
  }
  function pause() {
    if (!running || paused) return;
    closeOverlay(true);
    paused = true; keys.clear(); setHum(0);
    if (document.pointerLockElement) { suppressUnlockPause = true; document.exitPointerLock(); }
    H.lock.classList.remove('show');
    hud.classList.add('dim');
    onPause();
  }
  function resume() {
    if (!running) return;
    paused = false; lastT = performance.now(); keys.clear(); jumpPressed = false;
    hud.classList.remove('dim');
    padPrev = (getPad() || { buttons: [] }).buttons.map(x => x.pressed);
    if (!getPad()) requestLock();
    renderHints();
  }
  function stop() {
    running = false; paused = false; setHum(0);
    if (document.pointerLockElement) { suppressUnlockPause = true; document.exitPointerLock(); }
    container.classList.remove('on');
    H.lock.classList.remove('show');
    H.complete.classList.remove('show');
    disposeLevel();
  }
  async function respawn(reason) {
    if (P.dying) return;
    P.dying = true;
    if (reason === 'fall') { P.hearts--; updateHearts(P.hearts); rumble(250, .6, .4); }
    const dead = P.hearts <= 0;
    if (reason !== 'manual') { P.deathsRun = (P.deathsRun || 0) + 1; onDeath && onDeath(levelIndex); }
    message(dead ? T('dead') : reason === 'fall' ? T('fell') : '', 2.2);
    if (dead) snd.dead();
    await fade(1, dead ? 600 : 320);
    if (dead) {
      if (S.difficulty === 'Hard') {
        L.shards.forEach(s => { s.taken = false; showPickup(s.obj, true); s.obj.scale.setScalar(1); });
        P.shardsTaken = 0; P.checkpoint.copy(L.start); L.portal.active = false; time = 0;
        updateShardHud();
      }
      P.hearts = maxHearts(); updateHearts();
      spawn(S.difficulty === 'Relaxed' ? P.lastSafe : P.checkpoint);
    } else spawn(P.lastSafe);
    P.invuln = 1.5;
    snd.respawn();
    emit(P.pos.clone().add(new THREE.Vector3(0, 1, 0)), pal.trim, 40, 5, 1);
    await fade(0, 420);
  }
  function hurt(from) {
    if (P.invuln > 0 || P.dying || state !== 'playing') return;
    P.hearts--; updateHearts(P.hearts);
    P.invuln = 1.6; P.hitT = .5;
    const d = new THREE.Vector3(P.pos.x - from.x, 0, P.pos.z - from.z); if (d.lengthSq() < .01) d.set(Math.sin(P.yaw), 0, Math.cos(P.yaw)).negate(); d.normalize();
    P.vel.set(d.x * 9, 7.5, d.z * 9); P.grounded = false; P.launched = false; P.plat = null;
    snd.hit(); rumble(300, .9, .6); cam.shake = Math.max(cam.shake, .8);
    H.hit.classList.remove('on'); void H.hit.offsetWidth; H.hit.classList.add('on');
    emit(P.pos.clone().setY(P.pos.y + 1), 0xff3348, 40, 6, .8);
    if (P.hearts <= 0) respawn('dead');
  }
  function updateShardHud() { H.shards.forEach((el, i) => { el.classList.toggle('on', i < P.shardsTaken); if (i >= P.shardsTaken) el.classList.remove('pop'); }); }

  // Hide a pickup without removing its light from the scene: changing the number of visible
  // lights makes three.js recompile every material, which froze big levels for a moment.
  function showPickup(o, on) { for (const ch of o.children) { if (ch.isLight) { ch.userData.i0 ??= ch.intensity; ch.intensity = on ? ch.userData.i0 : 0; } else ch.visible = on; } }
  function collectShard(s) {
    s.taken = true; P.shardsTaken++;
    P.checkpoint.copy(s.home);
    snd.shard(P.shardsTaken - 1); rumble(120, .2, .6);
    emit(s.obj.position, 0xffc35a, 90, 9, 1.4, 2);
    updateShardHud();
    const el = H.shards[P.shardsTaken - 1]; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    if (P.shardsTaken >= L.shards.length) {
      L.portal.active = true;
      setTimeout(() => { snd.awaken(); message(T('awake'), 3.5); rumble(600, .5, .5); cam.shake = Math.max(cam.shake, .5); }, 500);
    } else message(`${T('got')} · ${P.shardsTaken}/${L.shards.length}`, 2.2);
  }
  function collectRelic(rl) {
    rl.taken = true;
    emit(rl.obj.position, new THREE.Color(...pal.aur), 120, 10, 1.6, 2.5);
    if (rl.had) { A.tone({ f: 1318.5, dur: .4, vol: .05, send: .6 }); updateRelicHud(); return; }
    snd.relic(); rumble(400, .4, .8);
    // not saved yet: relics only count once the level is finished (see showComplete)
    H.relicMsg.querySelector('small').textContent = T('relic');
    H.relicMsg.querySelector('b').textContent = rl.name;
    H.relicMsg.classList.remove('show'); void H.relicMsg.offsetWidth; H.relicMsg.classList.add('show');
    updateRelicHud();
  }

  function enterPortal() {
    state = 'entering'; completeAt = 0; setHum(0);
    snd.enter(); rumble(900, .7, .9);
    playAnim('Cheer', .2);
    if (document.pointerLockElement) { suppressUnlockPause = true; document.exitPointerLock(); }
  }
  function showComplete() {
    state = 'complete';
    const medal = medalFor(time, L.def.par);
    const relicsNow = L.relics.filter(r => r.taken && !r.had).map(r => r.idx);
    if (onRelic) relicsNow.forEach(idx => onRelic(levelIndex, idx));
    const res = onLevelComplete(levelIndex, time, medal, relicsNow, P.deathsRun || 0) || {};
    const last = levelIndex === LEVELS.length - 1;
    const found = L.relics.filter(r => r.had || r.taken).length;
    H.complete.querySelector('.g-medal').className = 'g-medal ' + medal;
    H.complete.querySelector('.g-medal').innerHTML = `<span>${T(medal)}</span>`;
    H.complete.querySelector('small').textContent = `${T('level')} ${levelIndex + 1} · ${L.def.name}`;
    H.complete.querySelector('h1').textContent = last ? T('finalT') : T('complete');
    H.complete.querySelector('.g-stats').innerHTML =
      `<div><span>${T('time')}</span><b>${fmtTime(time)}</b></div><div><span>${T('par')}</span><b>${fmtTime(L.def.par)}</b></div><div><span>${T('best')}</span><b>${fmtTime(res.best ?? time)}</b></div><div><span>${T('relics')}</span><b>◆ ${found}/${L.relics.length}</b></div>` +
      (res.newBest ? `<em>${T('newBest')}</em>` : '') + (last ? `<p>${T('finalS')}</p>` : '');
    const padNow = showPad();
    H.complete.querySelector('[data-a="next"]').innerHTML = `<span class="gk">${padNow ? '✕' : 'Enter'}</span>${T('cont')}`;
    H.complete.querySelector('[data-a="menu"]').innerHTML = `<span class="gk">${padNow ? '○' : 'Esc'}</span>${T('menu')}`;
    setCFocus(1, true);
    // anything still held (e.g. the jump that carried you into the portal) must be released first
    const pp = getPad(); padPrev = pp ? pp.buttons.map(x => x.pressed || x.value > .5) : [];
    cStickPrev = 0;
    H.complete.classList.add('show');
  }
  async function continueAfterComplete() {
    if (state !== 'complete') return;
    state = 'leaving';
    A.tone({ f: 660, to: 990, type: 'triangle', dur: .1, vol: .08, send: .2 });
    await fade(1, 500);
    H.complete.classList.remove('show');
    if (levelIndex < LEVELS.length - 1) start(levelIndex + 1);
    else { stop(); onFinish(); H.fade.style.opacity = 0; }
  }
  async function quitFromComplete() {
    if (state !== 'complete') return;
    state = 'leaving';
    A.tone({ f: 660, to: 440, type: 'triangle', dur: .1, vol: .08, send: .2 });
    await fade(1, 400);
    stop(); onQuit && onQuit(); H.fade.style.opacity = 0;
  }
  // level-complete screen: 0 = Main Menu, 1 = Continue
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
  const fmtTime = t => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;

  /* ---------- simulation ---------- */
  const tmpV = new THREE.Vector3();
  let simT = 0;
  function stepHazards(dt) {
    simT += dt;
    // platforms
    for (const p of L.platforms) {
      const prev = p.pos.clone();
      if (p.wait > 0) p.wait -= dt;
      else { p.t += p.dir * dt * 3.2 / p.len; if (p.t >= 1 || p.t <= 0) { p.t = clamp(p.t, 0, 1); p.dir *= -1; p.wait = 1.1; } }
      const e = p.t * p.t * (3 - 2 * p.t);
      p.pos.lerpVectors(p.a, p.b, e);
      p.delta.subVectors(p.pos, prev);
    }
    // crumbling tiles
    for (const [key, k] of L.crumbles) {
      if (k.state === 'shake') { k.t -= dt; if (k.t <= 0) { k.state = 'fall'; k.t = 1.4; k.vy = 0; snd.crumble(); } }
      else if (k.state === 'fall') { k.vy -= 30 * dt; k.obj.position.y += k.vy * dt; k.obj.rotation.x += dt * .8; k.obj.rotation.z += dt * .5; k.t -= dt; if (k.t <= 0) { k.state = 'gone'; k.t = 3.2; k.obj.visible = false; } }
      else if (k.state === 'gone') { k.t -= dt; if (k.t <= 0) { k.state = 'rise'; k.t = 0; k.obj.visible = true; k.obj.rotation.set(0, 0, 0); } }
      else if (k.state === 'rise') { k.t += dt / .9; const e = 1 - Math.pow(1 - Math.min(k.t, 1), 3); k.obj.position.y = -8 * (1 - e); if (k.t >= 1) { k.state = 'idle'; k.obj.position.y = 0; } }
    }
    // drones: patrol, and speed up toward you when you're close
    for (const d of L.drones) {
      const near = P.pos.distanceTo(d.pos) < 8;
      if (near) {
        const ab = tmpV.subVectors(d.b, d.a); const tp = clamp(new THREE.Vector3().subVectors(P.pos, d.a).dot(ab) / (d.len * d.len), 0, 1);
        const dir = Math.sign(tp - d.t) || d.dir; d.dir = dir;
        d.t = clamp(d.t + dir * dt * d.speed * 1.55 / d.len, 0, 1);
      } else {
        d.t += d.dir * dt * d.speed / d.len;
        if (d.t >= 1 || d.t <= 0) { d.t = clamp(d.t, 0, 1); d.dir *= -1; }
      }
      d.pos.lerpVectors(d.a, d.b, d.t).setY(1.1);
      if (Math.hypot(P.pos.x - d.pos.x, P.pos.z - d.pos.z) < 1.05 && Math.abs(P.pos.y + .9 - d.pos.y) < 1.2) hurt(d.pos);
    }
    // lasers: jump over them
    for (const l of L.lasers) {
      l.angle += l.speed * dt;
      const dx = Math.cos(l.angle), dz = -Math.sin(l.angle);
      const rx = P.pos.x - l.pos.x, rz = P.pos.z - l.pos.z;
      const along = rx * dx + rz * dz, perp = Math.abs(rx * dz - rz * dx);
      if (Math.abs(along) < l.len && perp < .5 && P.pos.y < 1.05) hurt(new THREE.Vector3(l.pos.x + along * dx, 0, l.pos.z + along * dz).add(new THREE.Vector3(-dz, 0, dx).multiplyScalar(Math.sign(rx * dz - rz * dx) || 1)));
    }
    // spike traps
    for (const s of L.spikes) {
      const ph = ((simT / 2.6) + s.phase) % 1;
      let h;
      if (ph < .45) h = -1.3;
      else if (ph < .6) h = -1.3 + (ph - .45) / .15 * .35 + Math.sin(simT * 60) * .03;    // rumble warning
      else if (ph < .64) h = lerp(-.95, 0, (ph - .6) / .04);
      else if (ph < .88) h = 0;
      else h = lerp(0, -1.3, (ph - .88) / .12);
      if (s.h < -.3 && h >= -.3) { if (P.pos.distanceTo(s.pos) < 14) snd.spike(); }
      if (ph >= .45 && ph < .47 && !s.warned) { s.warned = true; if (P.pos.distanceTo(s.pos) < 10) snd.spikeWarn(); }
      if (ph < .45) s.warned = false;
      s.h = h; s.obj.position.y = h;
      if (h > -.4 && Math.abs(P.pos.x - s.pos.x) < 1.8 && Math.abs(P.pos.z - s.pos.z) < 1.8 && P.pos.y < h + 1.05) hurt(s.pos);
    }
  }

  function step(dt, inp) {
    stepHazards(dt);
    if (P.plat && P.grounded) P.pos.add(P.plat.delta);
    P.invuln = Math.max(0, P.invuln - dt); P.hitT = Math.max(0, P.hitT - dt);

    const fwd = tmpV.set(-Math.sin(cam.yaw), 0, -Math.cos(cam.yaw)).clone();
    const right = new THREE.Vector3(Math.cos(cam.yaw), 0, -Math.sin(cam.yaw));
    let ix = inp.mx, iz = -inp.mz;
    const im = Math.hypot(ix, iz); if (im > 1) { ix /= im; iz /= im; }
    const wish = new THREE.Vector3().addScaledVector(fwd, iz).addScaledVector(right, ix);
    const wishMag = Math.min(wish.length(), 1);
    if (sprintPressed) { sprintPressed = false; if (S.sprint) P.sprintToggle = !P.sprintToggle; }
    const sprinting = (S.sprint ? P.sprintToggle : inp.sprint) && wishMag > .1;
    if (wishMag < .05 && S.sprint && P.grounded) P.sprintToggle = false;
    const speed = sprinting ? 9.6 : 6.2;

    if (P.launched) {
      const hs = Math.hypot(P.vel.x, P.vel.z);
      if (wishMag > .1) { const d = wish.clone().normalize(); P.vel.x = damp(P.vel.x, d.x * hs, 2.5, dt); P.vel.z = damp(P.vel.z, d.z * hs, 2.5, dt); }
    } else if (P.hitT <= 0) {
      const acc = P.grounded ? 48 : 16;
      P.vel.x += clamp(wish.x * speed - P.vel.x, -acc * dt, acc * dt);
      P.vel.z += clamp(wish.z * speed - P.vel.z, -acc * dt, acc * dt);
    }

    if (jumpPressed) { P.jumpBuf = .14; jumpPressed = false; }
    P.jumpBuf -= dt; P.coyote = P.grounded ? .12 : P.coyote - dt;
    if (P.jumpBuf > 0 && P.coyote > 0 && P.hitT <= 0) {
      P.vel.y = 11.4; P.grounded = false; P.coyote = 0; P.jumpBuf = 0; P.plat = null;
      snd.jump(); P.squash = -.18;
      emit(P.pos, pal.trim, 12, 3, .6);
    }
    const holdJump = keys.has('Space') || inp.jumpHeld;
    const g = P.vel.y > 0 ? (holdJump || P.launched ? 27 : 46) : 40;
    const prevY = P.pos.y;
    P.vel.y = Math.max(P.vel.y - g * dt, -45);

    P.pos.x += P.vel.x * dt; P.pos.z += P.vel.z * dt;
    collideWalls();
    P.pos.y += P.vel.y * dt;

    const sup = supportAt(P.pos.x, P.pos.z);
    const wasGrounded = P.grounded;
    if (sup && P.pos.y <= sup.h && prevY >= sup.h - .5) {
      const impact = -P.vel.y;
      P.pos.y = sup.h; P.vel.y = 0; P.grounded = true; P.plat = sup.plat;
      if (!wasGrounded) {
        snd.land(impact); P.squash = clamp(impact / 40, .08, .3);
        if (impact > 14) { cam.shake = Math.max(cam.shake, clamp(impact / 60, 0, .5)); rumble(90, .4 * impact / 30, .2); }
        emit(P.pos, 0xffffff, Math.round(impact / 2), 2.2, .5);
        P.launched = false; P.fallSfx = false;
      }
    } else if (!sup || P.pos.y > sup.h + .01) { P.grounded = false; P.plat = null; }

    // step on a crumbling tile -> it starts to shake
    if (P.grounded && !P.plat) {
      for (const [dx, dz] of [[0, 0], [.32, 0], [-.32, 0], [0, .32], [0, -.32]]) {
        const [r, c] = cellOf(P.pos.x + dx, P.pos.z + dz);
        const k = L.crumbles.get(r * 100 + c);
        if (k && k.state === 'idle') { k.state = 'shake'; k.t = .55; snd.crack(); rumble(80, .2, .3); }
      }
    }

    if (P.grounded) for (const pd of L.pads) {
      if (Math.hypot(P.pos.x - pd.pos.x, P.pos.z - pd.pos.z) < 1.2) {
        const d = wishMag > .1 ? wish.clone().normalize() : new THREE.Vector3(Math.sin(P.yaw), 0, Math.cos(P.yaw));
        P.vel.set(d.x * 12.8, 18.5, d.z * 12.8);
        P.grounded = false; P.launched = true; P.plat = null; pd.pulse = 1;
        snd.bounce(); rumble(160, .5, .3); emit(pd.pos, pal.crystal, 50, 7, 1, 3);
      }
    }

    if (P.grounded && !P.plat) {
      const [r, c] = cellOf(P.pos.x, P.pos.z);
      const cp = cellPos(r, c);
      if ('.S*H'.includes(cellCh(r, c)) && Math.hypot(P.pos.x - cp.x, P.pos.z - cp.z) < 1.2) P.lastSafe.copy(cp);
    }

    if (P.pos.y < -4 && !P.fallSfx) { P.fallSfx = true; snd.fall(); }
    if (P.pos.y < -30) respawn('fall');

    const hs = Math.hypot(P.vel.x, P.vel.z);
    if (P.grounded && hs > 1) { P.stepT -= dt * hs / 6.2; if (P.stepT <= 0) { P.stepT = .34; snd.step(); } }
    if (hs > .5 && P.hitT <= 0) { const target = Math.atan2(P.vel.x, P.vel.z); let d = target - P.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); P.yaw += d * (1 - Math.exp(-12 * dt)); }
    return { sprinting, hs };
  }

  function interact() {
    let prompt = '';
    const head = tmpV.copy(P.pos).setY(P.pos.y + 1);
    for (const s of L.shards) {
      if (s.taken) continue;
      const d = s.obj.position.distanceTo(head);
      if (S.autoPick ? d < 1.6 : d < 2.4) {
        if (S.autoPick || interactPressed) collectShard(s);
        else prompt = `<b>${showPad() ? '▢' : 'E'}</b>${T('collect')}`;
      }
    }
    for (const rl of L.relics) {
      if (rl.taken) continue;
      const d = rl.obj.position.distanceTo(head);
      if (S.autoPick ? d < 1.6 : d < 2.4) {
        if (S.autoPick || interactPressed) collectRelic(rl);
        else prompt = `<b>${showPad() ? '▢' : 'E'}</b>${T('collect')}`;
      }
    }
    interactPressed = false;
    const pt = L.portal;
    const pd = Math.hypot(P.pos.x - pt.pos.x, P.pos.z - pt.pos.z);
    if (pd < 1.4 && P.pos.y > -1) {
      if (pt.active) enterPortal();
      else if (!pt.warned) { pt.warned = true; snd.locked(); message(T('locked'), 2.8); }
    } else if (pd > 3) pt.warned = false;
    if (!pt.active && pd < 4.5) prompt = prompt || `${P.shardsTaken}/${L.shards.length} · ${T('shards')}`;
    H.prompt.innerHTML = prompt;
    H.prompt.classList.toggle('show', !!prompt && !!S.tooltips);
  }

  /* ---------- visuals per frame ---------- */
  function animate(dt, t, info) {
    skyU.time.value = t; planetU.time.value = t;
    planet.rotation.y = t * .01;
    sky.position.copy(camera.position); stars.position.copy(camera.position);
    sunSprite.position.copy(camera.position).addScaledVector(planetU.sunDir.value, 1300);

    // player: animation state machine
    if (state === 'playing') {
      if (P.hitT > 0) playAnim('Hit', .08);
      else if (!P.grounded && (P.vel.y < -3 || P.pos.y < -.5)) playAnim(P.vel.y > 0 ? 'Jump' : 'Fall', .2);
      else if (!P.grounded) playAnim('Jump', .1);
      else if (info.hs > .8) playAnim('Run', .15);
      else playAnim('Idle', .25);
    }
    if (P.actions.Run) P.actions.Run.timeScale = clamp(info.hs / 6.6, .55, 1.6);
    P.mixer && P.mixer.update(dt);

    const o = P.obj;
    P.squash = damp(P.squash, 0, 9, dt);
    o.position.set(P.pos.x, P.pos.y, P.pos.z);
    o.rotation.set(0, P.yaw, 0);
    o.rotateX(clamp(info.hs / 10, 0, 1) * .12);
    const sq = P.grounded ? P.squash : -Math.min(Math.abs(P.vel.y) / 70, .1);
    if (state !== 'entering') o.scale.set(1 + sq * .5, 1 - sq, 1 + sq * .5);
    o.visible = !(P.invuln > 0 && Math.floor(t * 14) % 2) && state !== 'complete' && state !== 'leaving';
    playerLight.position.set(P.pos.x, P.pos.y + 2.6, P.pos.z);

    P.trailT -= dt;
    if (P.trailT <= 0 && (info.hs > 1 || !P.grounded) && state === 'playing') {
      P.trailT = info.sprinting ? .016 : .035;
      // thruster sparks from the backpack
      const back = new THREE.Vector3(-Math.sin(P.yaw) * .3, .85, -Math.cos(P.yaw) * .3).add(P.pos);
      emit(back, pal.trim, 1, .4, .5, -.3, .4);
    }

    for (const s of L.shards) {
      if (s.taken) { s.obj.scale.multiplyScalar(Math.exp(-10 * dt)); s.obj.position.y += dt * 3; if (s.obj.scale.x < .02) showPickup(s.obj, false); continue; }
      s.obj.rotation.y += dt * 1.6; s.obj.position.y = 1.3 + Math.sin(t * 2 + s.home.x) * .18;
      if (Math.random() < dt * 6) emit(s.obj.position, 0xffc35a, 1, .6, .9, .5, 2);
    }
    for (const rl of L.relics) {
      if (rl.taken) { rl.obj.scale.multiplyScalar(Math.exp(-8 * dt)); rl.obj.position.y += dt * 4; if (rl.obj.scale.x < .02) showPickup(rl.obj, false); continue; }
      rl.obj.rotation.y -= dt * 1.1; rl.obj.rotation.z = Math.sin(t * 1.3) * .2; rl.obj.position.y = 1.3 + Math.sin(t * 1.6 + rl.c) * .15;
      if (!rl.had && Math.random() < dt * 5) emit(rl.obj.position, new THREE.Color(...pal.aur), 1, .7, 1, .6, 2);
    }
    for (const pd of L.pads) { pd.pulse = damp(pd.pulse, 0, 4, dt); pd.obj.scale.set(1 + pd.pulse * .25, 1 - pd.pulse * .4, 1 + pd.pulse * .25); }
    for (const p of L.platforms) { p.obj.position.copy(p.pos); p.obj.position.y = Math.sin(t * 1.4 + p.a.x) * .04; }
    for (const [, k] of L.crumbles) if (k.state === 'shake') k.obj.position.set(k.pos.x + (Math.random() - .5) * .14, (Math.random() - .5) * .08, k.pos.z + (Math.random() - .5) * .14);
      else if (k.state === 'idle') k.obj.position.set(k.pos.x, 0, k.pos.z);
    for (const d of L.drones) {
      d.obj.position.set(d.pos.x, d.pos.y + Math.sin(t * 3 + d.a.x) * .12, d.pos.z);
      const dirv = new THREE.Vector3().subVectors(d.b, d.a).multiplyScalar(d.dir);
      d.obj.rotation.y = damp(d.obj.rotation.y, Math.atan2(dirv.x, dirv.z) + Math.PI, 6, dt);
      d.obj.rotation.z = Math.sin(t * 2) * .1;
    }
    let humNear = 99;
    for (const l of L.lasers) {
      l.beam.rotation.y = l.angle;
      l.beam.children[0].material.opacity = .75 + Math.sin(t * 40) * .2;
      humNear = Math.min(humNear, P.pos.distanceTo(l.pos));
    }
    setHum(state === 'playing' && L.lasers.length ? clamp(1 - humNear / 14, 0, 1) * .05 : 0);

    const pt = L.portal;
    pt.a = damp(pt.a, pt.active ? 1 : 0, 1.6, dt);
    pt.u.time.value = t; pt.u.uActive.value = pt.a;
    pt.beam.material.opacity = pt.a * (.10 + Math.sin(t * 3) * .03);
    pt.light.intensity = 3 + pt.a * 30;
    const ring = matCache.get('PortalRing'); if (ring) ring.emissiveIntensity = 1 + pt.a * 4;
    if (pt.a > .5 && Math.random() < dt * 25) emit(pt.pos.clone().setY(2.6 + (rnd() - .5) * 2), pal.trim, 1, 2, 1.2, 1, 3);
    const cr = matCache.get('Crystal'); if (cr) cr.emissiveIntensity = .55 + Math.sin(t * 1.3) * .12;
    const dg = matCache.get('Danger'); if (dg) dg.emissiveIntensity = 3 + Math.sin(t * 8) * 1.2;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sv = new THREE.Vector3();
    for (const a of asteroidState) {
      a.rot.x += a.spin.x * dt; a.rot.y += a.spin.y * dt; a.rot.z += a.spin.z * dt;
      a.p.applyAxisAngle(THREE.Object3D.DEFAULT_UP, a.orbit * dt);
      m4.compose(a.p, q.setFromEuler(a.rot), sv.setScalar(a.s));
      asteroidMeshes[a.v].forEach(im => im.setMatrixAt(a.idx, m4));
    }
    asteroidMeshes.flat().forEach(im => { im.instanceMatrix.needsUpdate = true; });
    for (let k = 0; k < DUST_N; k++) { dustPos[k * 3 + 1] += dt * .25; if (dustPos[k * 3 + 1] > 14) dustPos[k * 3 + 1] = -12; }
    dustGeo.attributes.position.needsUpdate = true;
    updateParticles(dt);

    const followY = Math.max(P.pos.y, -6);
    cam.target.x = damp(cam.target.x, P.pos.x, 12, dt); cam.target.z = damp(cam.target.z, P.pos.z, 12, dt); cam.target.y = damp(cam.target.y, followY + 1.3, 7, dt);
    const cp = Math.cos(cam.pitch);
    camera.position.set(cam.target.x + Math.sin(cam.yaw) * cp * cam.dist, cam.target.y + Math.sin(cam.pitch) * cam.dist, cam.target.z + Math.cos(cam.yaw) * cp * cam.dist);
    cam.shake = damp(cam.shake, 0, 5, dt);
    const sh = cam.shake * (S.reduceMotion ? 0 : S.shake / 50);
    if (sh > .001) camera.position.add(new THREE.Vector3((rnd() - .5) * sh, (rnd() - .5) * sh, (rnd() - .5) * sh));
    camera.lookAt(cam.target);
    cam.fov = damp(cam.fov, S.fov + (info.sprinting ? 7 : 0) + (P.launched ? 10 : 0), 4, dt);
    if (Math.abs(camera.fov - cam.fov) > .01) { camera.fov = cam.fov; camera.updateProjectionMatrix(); }
  }

  function drawMap() {
    if (!S.minimap) return;
    const ctx = mapCtx, cw = 200, n = Math.max(L.W, L.H), s = cw / n;
    const [pr, pc] = cellOf(P.pos.x, P.pos.z);
    for (let r = pr - 2; r <= pr + 2; r++) for (let c = pc - 2; c <= pc + 2; c++) L.explored.add(r * 100 + c);
    ctx.clearRect(0, 0, cw, cw);
    const ox = (cw - L.W * s) / 2, oy = (cw - L.H * s) / 2;
    const HAZ = { D: 'rgba(255,70,90,.55)', R: 'rgba(255,70,90,.55)', X: 'rgba(255,70,90,.55)', C: 'rgba(255,150,70,.45)' };
    for (let r = 0; r < L.H; r++) for (let c = 0; c < L.W; c++) {
      if (!L.explored.has(r * 100 + c)) continue;
      const ch = cellCh(r, c);
      if (ch === ' ' || ch === '~' || ch === 'M') continue;
      ctx.fillStyle = ch === '#' ? 'rgba(170,130,255,.55)' : HAZ[ch] || 'rgba(255,255,255,.16)';
      ctx.fillRect(ox + c * s + .5, oy + r * s + .5, s - 1, s - 1);
    }
    const dot = (r, c, col, rad) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(ox + (c + .5) * s, oy + (r + .5) * s, rad, 0, 7); ctx.fill(); };
    L.shards.forEach(sh => { if (!sh.taken && L.explored.has(sh.r * 100 + sh.c)) dot(sh.r, sh.c, '#ffc35a', s * .28); });
    L.relics.forEach(rl => { if (!rl.taken && L.explored.has(rl.r * 100 + rl.c)) dot(rl.r, rl.c, rl.had ? 'rgba(127,255,212,.35)' : '#7fffd4', s * .24); });
    const [er, ec] = cellOf(L.portal.pos.x, L.portal.pos.z);
    if (L.explored.has(er * 100 + ec)) dot(er, ec, L.portal.active ? '#7ff' : 'rgba(120,220,255,.5)', s * .34);
    L.platforms.forEach(p => { const [r, c] = cellOf(p.pos.x, p.pos.z); if (L.explored.has(r * 100 + c)) { ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(ox + c * s + 2, oy + r * s + 2, s - 4, s - 4); } });
    const px = ox + (P.pos.x / TILE + (L.W - 1) / 2 + .5) * s, py = oy + (P.pos.z / TILE + (L.H - 1) / 2 + .5) * s;
    ctx.save(); ctx.translate(px, py); ctx.rotate(-P.yaw + Math.PI);
    ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(0, -s * .45); ctx.lineTo(s * .3, s * .3); ctx.lineTo(-s * .3, s * .3); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function renderFrame(dt) { composer.render(dt); }

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
    audio.SFX.open();
    setHum(0);
  }
  function closeOverlay(silent) {
    if (!ov.open) return;
    ov.open = false; hud.classList.remove('ov-on'); lastT = performance.now();
    if (!silent) { audio.SFX.close(); if (running && !paused && ov.relockAfter && !getPad()) requestLock(); }
  }
  function setOvTab(t) {
    if (t === ov.tab) { audio.SFX.bump(); return; }
    ov.tab = t; renderOverlay();
    audio.SFX.change(t ? 1 : -1);
    rumble(40, 0, .3);
  }
  const medalDot = m => m ? `<i class="ov-medal ${m}"></i>` : '';
  function renderOverlay() {
    const prog = (getProgress && getProgress()) || {};
    hud.querySelector('.ov-keys').innerHTML = showPad()
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

  /* ---------- main loop ---------- */
  function loop(now) {
    requestAnimationFrame(loop);
    if (!running || paused) { lastT = now; return; }
    const cap = S.fpsCap === 'Unlimited' ? 0 : +S.fpsCap;
    if (cap && now - lastRender < 1000 / cap - 1) return;
    lastRender = now;
    const dt = Math.min((now - lastT) / 1000, 1 / 20); lastT = now;
    const inp = readPad(dt);
    if (paused) return;
    if (ov.open) { const live = hud.querySelector('.ov-live'); if (live) live.textContent = fmtTime(time); return; }
    const kx = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
    const kz = (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0);
    if (kx || kz) { inp.mx = kx; inp.mz = kz; }
    if (keys.has('ShiftLeft') || keys.has('ShiftRight')) inp.sprint = true;

    let info = { sprinting: false, hs: 0 };
    if (state === 'playing') {
      time += dt;
      let left = dt;
      while (left > 1e-5) { const h = Math.min(left, 1 / 120); info = step(h, inp); left -= h; }
      interact();
    } else if (state === 'entering') {
      completeAt += dt;
      const pt = L.portal.pos;
      P.pos.x = damp(P.pos.x, pt.x, 3, dt); P.pos.z = damp(P.pos.z, pt.z, 3, dt); P.pos.y = damp(P.pos.y, 2, 2, dt);
      P.yaw += dt * 6;
      P.obj.scale.setScalar(Math.max(0.001, 1 - completeAt / 1.2));
      if (completeAt > .6 && completeAt - dt <= .6) emit(pt.clone().setY(2.6), 0xffffff, 150, 12, 1.5);
      if (completeAt > 1.3) showComplete();
    }
    animate(dt, now / 1000, info);
    drawMap();
    renderFrame(dt);

    H.timer.textContent = fmtTime(time);
    H.timer.classList.toggle('over', time > L.def.par);
    if (msgTimer > 0) { msgTimer -= dt; if (msgTimer <= 0) H.msg.classList.remove('show'); }
    fpsAcc += dt; fpsN++;
    if (fpsAcc > .5) { H.fps.textContent = Math.round(fpsN / fpsAcc) + ' FPS'; fpsAcc = 0; fpsN = 0; }
  }
  requestAnimationFrame(loop);
  window.__auroraTeleport = (r, c) => spawn(cellPos(r, c));
  window.__auroraDebug = () => ({ pos: P.pos.toArray().map(v => +v.toFixed(2)), state, time: +time.toFixed(2), grounded: P.grounded, shards: P.shardsTaken, hearts: P.hearts, anim: P.anim, paused, running });

  /* ---------- settings ---------- */
  function resize() {
    const q = QUALITY[S.quality] || QUALITY.High;
    const resH = parseInt(String(S.res).split('×')[1] || '1080', 10);
    const pr = clamp(Math.min(q.pr, devicePixelRatio || 1, resH / innerHeight), .5, 2);
    renderer.setPixelRatio(pr);
    renderer.setSize(innerWidth, innerHeight);
    composer.setPixelRatio(pr);
    composer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  }
  addEventListener('resize', () => { if (running) resize(); });
  function applySettings(s) {
    const prevDiff = S.difficulty;
    S = { ...s };
    renderHints();
    const q = QUALITY[S.quality] || QUALITY.High;
    renderer.toneMappingExposure = Math.pow(S.brightness / 100, 1.3) * .95;
    renderer.shadowMap.enabled = q.shadows > 0;
    sun.castShadow = q.shadows > 0;
    if (q.shadows && sun.shadow.mapSize.x !== q.shadows) { sun.shadow.mapSize.set(q.shadows, q.shadows); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
    bloom.enabled = q.bloom;
    afterimage.enabled = !!S.motionBlur;
    dustGeo.setDrawRange(0, Math.floor(DUST_N * q.particles * (S.reduceMotion ? .4 : 1) / 1.4));
    starGeo.setDrawRange(0, Math.floor(STAR_N * Math.min(q.particles, 1)));
    hud.style.setProperty('--ui', S.uiScale / 100);
    H.map.style.display = S.minimap ? '' : 'none';
    H.fps.style.display = S.showFps ? '' : 'none';
    H.hints.style.display = S.tooltips ? '' : 'none';
    H.lock.querySelector('span').textContent = T('click');
    if (L) {
      H.lvl.textContent = `${T('level')} ${levelIndex + 1} · ${L.def.name}`;
      if (prevDiff !== S.difficulty) P.hearts = Math.min(P.hearts, maxHearts());
      updateHearts();
    }
    renderHints();
    resize();
  }

  return {
    start, pause, resume, stop, applySettings,
    restart: () => start(levelIndex),
    get running() { return running; }, get paused() { return paused; }, get level() { return levelIndex; },
  };
}

import pkg from '../package.json';
window.AuroraGame = { createGame, levels: LEVELS, TILE, medalFor, version: pkg.version };
