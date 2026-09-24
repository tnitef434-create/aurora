# Generates all Aurora game models procedurally and exports them as .glb
# Run:  blender --background --factory-startup --python build_models.py -- <out_dir>
import bpy, math, random, os, sys
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1]
os.makedirs(OUT, exist_ok=True)


# ---------------------------------------------------------------- helpers
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, color, rough=.6, metal=0.0, emit=None, strength=0.0):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    if m.node_tree is None:
        try:
            m.use_nodes = True
        except Exception:
            pass
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1)
        b.inputs['Emission Strength'].default_value = strength
    return m


def active():
    return bpy.context.view_layer.objects.active


def activate(o):
    for x in bpy.context.view_layer.objects:
        x.select_set(False)
    o.select_set(True)
    bpy.context.view_layer.objects.active = o


def apply_all(o):
    activate(o)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    for m in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)


def give(o, m):
    o.data.materials.clear()
    o.data.materials.append(m)


def smooth(o, on=True):
    for p in o.data.polygons:
        p.use_smooth = on


def displace(o, strength, size, seed, subdiv=0):
    if subdiv:
        s = o.modifiers.new('sub', 'SUBSURF')
        s.subdivision_type = 'SIMPLE'
        s.levels = subdiv
        s.render_levels = subdiv
    t = bpy.data.textures.new(f'noise{seed}{o.name}', 'CLOUDS')
    t.noise_scale = size
    t.noise_depth = 2
    d = o.modifiers.new('disp', 'DISPLACE')
    d.texture = t
    d.strength = strength
    d.texture_coords = 'GLOBAL'
    # shift the object through noise space so every seed looks different
    off = Vector((seed * 13.7, seed * 7.3, seed * 3.1))
    o.location += off
    apply_all(o)
    o.location -= off


def bevel(o, width, segs=2):
    b = o.modifiers.new('bev', 'BEVEL')
    b.width = width
    b.segments = segs
    b.limit_method = 'ANGLE'


def join(objs):
    activate(objs[0])
    for o in objs:
        o.select_set(True)
    bpy.ops.object.join()
    return active()


def export(o, name):
    activate(o)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, name + '.glb'), export_format='GLB',
                              use_selection=True, export_apply=True, export_yup=True)
    print('exported', name)


def cube(size, loc, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_cube_add(size=size, location=loc)
    o = active(); o.scale = scale; apply_all(o); return o


def cyl(r, d, loc, v=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=v, radius=r, depth=d, location=loc)
    return active()


def cone(r1, r2, d, loc, v=6, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=v, radius1=r1, radius2=r2, depth=d, location=loc, rotation=rot)
    return active()


def sphere(r, loc, scale=(1, 1, 1), seg=32, rings=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, radius=r, location=loc)
    o = active(); o.scale = scale; apply_all(o); return o


def ico(r, loc, sub=2):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub, radius=r, location=loc)
    return active()


def torus(R, r, loc, rot=(0, 0, 0), maj=64, mn=12):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=maj, minor_segments=mn,
                                     location=loc, rotation=rot)
    return active()


# shared palettes (tinted per level in the engine)
def M():
    return dict(
        stone=mat('Stone', (.30, .31, .38), rough=.85),
        rock=mat('Rock', (.12, .10, .15), rough=.95),
        trim=mat('Trim', (.2, .9, 1.0), rough=.3, emit=(.35, .85, 1.0), strength=4),
        crystal=mat('Crystal', (.55, .35, 1.0), rough=.15, emit=(.55, .3, 1.0), strength=2.5),
        shard=mat('Shard', (1.0, .8, .35), rough=.2, emit=(1.0, .75, .3), strength=6),
        portal=mat('PortalRing', (.4, .9, 1.0), rough=.2, metal=.3, emit=(.4, .85, 1.0), strength=5),
        suit=mat('Suit', (.92, .93, .97), rough=.45),
        suit2=mat('SuitDark', (.28, .30, .38), rough=.5, metal=.4),
        visor=mat('Visor', (.02, .05, .1), rough=.05, metal=.8, emit=(.15, .7, 1.0), strength=1.6),
        glow=mat('Glow', (1, .5, .9), emit=(1.0, .45, .85), strength=6),
        pad=mat('Pad', (1, .4, .9), emit=(1.0, .35, .85), strength=5),
        thruster=mat('Thruster', (.4, .8, 1), emit=(.4, .8, 1.0), strength=6),
        bulb=mat('Bulb', (.6, 1, .9), emit=(.45, 1.0, .85), strength=5),
        stem=mat('Stem', (.12, .25, .3), rough=.7),
        danger=mat('Danger', (1, .15, .2), rough=.3, emit=(1.0, .12, .18), strength=6),
        metal=mat('HazardMetal', (.12, .12, .15), rough=.3, metal=.85),
        relicm=mat('Relic', (.6, 1, .9), rough=.1, metal=.2, emit=(.55, 1.0, .85), strength=4),
        gold=mat('RelicGold', (1, .8, .45), rough=.25, metal=1.0),
    )


# ---------------------------------------------------------------- models
def tile(seed):
    reset(); m = M(); rnd = random.Random(seed)
    top = cube(1, (0, 0, -0.35), (4, 4, .7)); bevel(top, .14, 3); apply_all(top); give(top, m['stone'])
    under = cone(0.3, 2.05, 3.4, (0, 0, -0.7 - 1.7), v=10)
    under.rotation_euler.z = rnd.random() * 6.28
    displace(under, .55, .9, seed, subdiv=2); give(under, m['rock'])
    parts = [top, under]
    # glowing seams around the rim
    for (x, y, sx, sy) in [(0, 1.93, 3.6, .07), (0, -1.93, 3.6, .07), (1.93, 0, .07, 3.6), (-1.93, 0, .07, 3.6)]:
        t = cube(1, (x, y, .005), (sx, sy, .03)); give(t, m['trim']); parts.append(t)
    # little hanging rocks
    for i in range(3):
        a = rnd.random() * 6.28
        p = ico(rnd.uniform(.15, .3), (math.cos(a) * 1.6, math.sin(a) * 1.6, -rnd.uniform(1.2, 2.6)), 1)
        displace(p, .08, .3, seed * 10 + i); give(p, m['rock']); parts.append(p)
    export(join(parts), f'tile_{seed}')


def crystal(seed):
    reset(); m = M(); rnd = random.Random(seed)
    base = cyl(1.55, .5, (0, 0, .2), v=9); displace(base, .25, .6, seed, subdiv=1); give(base, m['rock'])
    parts = [base]
    specs = [(0, 0, .55, 3.7, 0)] + [(rnd.uniform(-1, 1), rnd.uniform(-1, 1), rnd.uniform(.28, .5), rnd.uniform(1.4, 2.9), rnd.uniform(8, 24)) for _ in range(6)]
    for (x, y, r, h, tilt) in specs:
        c = cone(r, r * .12, h, (0, 0, h / 2), v=6)
        c.rotation_euler = (math.radians(tilt) * (1 if x > 0 else -1), math.radians(tilt) * (1 if y > 0 else -1), rnd.random() * 6.28)
        c.location = (x, y, 0.15)
        give(c, m['crystal']); parts.append(c)
    export(join(parts), f'crystal_{seed}')


def shard():
    reset(); m = M()
    a = cone(.32, 0, .75, (0, 0, .375), v=5); b = cone(.32, 0, .55, (0, 0, -.275), v=5, rot=(math.pi, 0, 0))
    parts = [a, b]
    for i in range(3):
        ang = i * 2.094
        s = cone(.1, 0, .3, (math.cos(ang) * .45, math.sin(ang) * .45, .05), v=4)
        parts.append(s)
    o = join(parts); give(o, m['shard']); export(o, 'shard')


def portal():
    reset(); m = M(); rnd = random.Random(7)
    ped = cyl(2.1, .45, (0, 0, .22), v=12); bevel(ped, .1); apply_all(ped); give(ped, m['stone'])
    step = cyl(1.6, .3, (0, 0, .55), v=12); bevel(step, .08); apply_all(step); give(step, m['stone'])
    ring = torus(1.75, .17, (0, 0, 2.6), rot=(math.pi / 2, 0, 0)); smooth(ring); give(ring, m['portal'])
    inner = torus(1.5, .045, (0, 0, 2.6), rot=(math.pi / 2, 0, 0), mn=8); give(inner, m['portal'])
    parts = [ped, step, ring, inner]
    for i in range(8):
        a = i / 8 * 6.28
        st = ico(.16, (math.cos(a) * 2.2, 0, 2.6 + math.sin(a) * 2.2), 1); displace(st, .05, .2, i); give(st, m['rock']); parts.append(st)
    for x in (-1.9, 1.9):
        pil = cone(.28, .12, 1.4, (x, 0, 1.1), v=6); give(pil, m['stone']); parts.append(pil)
    export(join(parts), 'portal')


def player():
    reset(); m = M()
    body = sphere(.36, (0, 0, .62), (1, .9, 1.15)); give(body, m['suit'])
    head = sphere(.34, (0, 0, 1.2)); give(head, m['suit'])
    visor = sphere(.27, (0, -.13, 1.22), (1, .72, .78)); give(visor, m['visor'])
    belt = torus(.34, .05, (0, 0, .52), mn=8); give(belt, m['suit2'])
    pack = cube(1, (0, .33, .72), (.46, .24, .52)); bevel(pack, .07, 3); apply_all(pack); give(pack, m['suit2'])
    ant = cyl(.022, .38, (.14, .26, 1.58), v=8); give(ant, m['suit2'])
    tip = sphere(.07, (.14, .26, 1.8), seg=12, rings=8); give(tip, m['glow'])
    parts = [body, head, visor, belt, pack, ant, tip]
    for sx in (-1, 1):
        arm = sphere(.13, (sx * .42, -.02, .72), (1, 1, 1.5)); give(arm, m['suit']); parts.append(arm)
        leg = sphere(.15, (sx * .17, 0, .16), (1, 1.1, 1.2)); give(leg, m['suit2']); parts.append(leg)
    for p in parts:
        smooth(p)
    export(join(parts), 'player')


def asteroid(seed):
    reset(); m = M()
    a = ico(1, (0, 0, 0), 3); displace(a, .45, .7, seed); give(a, m['rock']); export(a, f'asteroid_{seed}')


def platform():
    reset(); m = M()
    top = cyl(1.95, .5, (0, 0, -.25), v=6); bevel(top, .1); apply_all(top); give(top, m['stone'])
    ring = torus(1.72, .05, (0, 0, .01), maj=6, mn=6); give(ring, m['trim'])
    parts = [top, ring]
    for i in range(3):
        a = i * 2.094
        t = cone(.3, .08, .5, (math.cos(a) * 1.1, math.sin(a) * 1.1, -.72), v=8, rot=(math.pi, 0, 0)); give(t, m['thruster']); parts.append(t)
    export(join(parts), 'platform')


def pad():
    reset(); m = M()
    base = cyl(1.35, .28, (0, 0, .14), v=24); bevel(base, .06); apply_all(base); give(base, m['stone'])
    disc = cyl(.95, .3, (0, 0, .16), v=24); give(disc, m['pad'])
    r1 = torus(1.15, .04, (0, 0, .3), mn=6); give(r1, m['pad'])
    export(join([base, disc, r1]), 'pad')


def flora(seed):
    reset(); m = M(); rnd = random.Random(seed)
    parts = []
    for i in range(rnd.randint(2, 4)):
        x, y = rnd.uniform(-.35, .35), rnd.uniform(-.35, .35)
        h = rnd.uniform(.5, 1.2)
        st = cyl(.03, h, (x, y, h / 2), v=6); st.rotation_euler = (rnd.uniform(-.25, .25), rnd.uniform(-.25, .25), 0)
        give(st, m['stem'])
        tip = st.matrix_world @ Vector((0, 0, h / 2))
        b = sphere(rnd.uniform(.08, .15), tip, (1, 1, 1.3), seg=12, rings=8); give(b, m['bulb']); smooth(b)
        parts += [st, b]
    export(join(parts), f'flora_{seed}')



def drone():
    reset(); m = M()
    body = sphere(.42, (0, 0, 0), (1, 1, .85)); give(body, m['metal']); smooth(body)
    eye = sphere(.2, (0, -.34, .02), (1, .5, 1)); give(eye, m['danger']); smooth(eye)
    band = torus(.44, .045, (0, 0, 0), mn=8); give(band, m['danger'])
    parts = [body, eye, band]
    for i in range(4):
        a = i * math.pi / 2 + math.pi / 4
        fin = cube(1, (math.cos(a) * .5, math.sin(a) * .5, 0), (.06, .06, .5))
        fin.rotation_euler.z = a; give(fin, m['metal']); parts.append(fin)
    spike = cone(.12, 0, .3, (0, 0, -.5), v=6, rot=(math.pi, 0, 0)); give(spike, m['danger']); parts.append(spike)
    export(join(parts), 'drone')


def emitter():
    reset(); m = M()
    base = cyl(.75, .3, (0, 0, .15), v=8); bevel(base, .06); apply_all(base); give(base, m['metal'])
    col = cone(.35, .18, 1.0, (0, 0, .75), v=8); give(col, m['metal'])
    orb = sphere(.24, (0, 0, 1.35)); give(orb, m['danger']); smooth(orb)
    ring = torus(.34, .04, (0, 0, 1.35), rot=(math.pi / 2, 0, 0), mn=8); give(ring, m['metal'])
    export(join([base, col, orb, ring]), 'emitter')


def spikes():
    reset(); m = M(); rnd = random.Random(5)
    plate = cube(1, (0, 0, -.05), (3.4, 3.4, .1)); give(plate, m['metal'])
    parts = [plate]
    for i in range(5):
        for j in range(5):
            x, y = (i - 2) * .68 + rnd.uniform(-.08, .08), (j - 2) * .68 + rnd.uniform(-.08, .08)
            c = cone(.16, 0, rnd.uniform(.8, 1.15), (x, y, .45), v=5); give(c, m['metal'] if (i + j) % 2 else m['danger']); parts.append(c)
    export(join(parts), 'spikes')


def relic():
    reset(); m = M()
    top = cone(.28, 0, .5, (0, 0, .25), v=8); bot = cone(.28, 0, .42, (0, 0, -.21), v=8, rot=(math.pi, 0, 0))
    gem = join([top, bot]); give(gem, m['relicm'])
    r1 = torus(.5, .03, (0, 0, 0), rot=(math.pi / 2, 0, 0), mn=8); give(r1, m['gold'])
    r2 = torus(.44, .025, (0, 0, 0), rot=(math.pi / 2, 0, math.pi / 2), mn=8); give(r2, m['gold'])
    parts = [gem, r1, r2]
    for i in range(4):
        a = i * math.pi / 2
        c = cone(.05, 0, .16, (math.cos(a) * .5, 0, math.sin(a) * .5), v=4, rot=(0, -a + math.pi / 2, 0)); give(c, m['gold']); parts.append(c)
    export(join(parts), 'relic')


for s in (1, 2, 3):
    tile(s)
for s in (1, 2, 3):
    crystal(s)
for s in (1, 2):
    asteroid(s)
for s in (1, 2):
    flora(s)
shard(); portal(); platform(); pad(); drone(); emitter(); spikes(); relic()
print('ALL DONE')
