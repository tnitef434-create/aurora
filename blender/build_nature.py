# Chapter 2 (jungle island) models for Aurora: grass tiles, jungle trees, bushes, thorn traps,
# the insect enemy, the floating island base and small background islets.
# Run:  blender --background --factory-startup --python build_nature.py -- <out_dir>
import bpy, bmesh, math, random, os, sys
from mathutils import Vector, Matrix

OUT = sys.argv[sys.argv.index('--') + 1]
os.makedirs(OUT, exist_ok=True)
R = math.radians


# ---------------------------------------------------------------- helpers
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, color, rough=.7, metal=0.0, emit=None, strength=0.0):
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
    for md in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=md.name)


def give(o, m, smooth=False):
    o.data.materials.clear()
    o.data.materials.append(m)
    for p in o.data.polygons:
        p.use_smooth = smooth
    return o


def displace(o, strength, size, seed, subdiv=0, simple=True):
    if subdiv:
        s = o.modifiers.new('sub', 'SUBSURF')
        s.subdivision_type = 'SIMPLE' if simple else 'CATMULL_CLARK'
        s.levels = s.render_levels = subdiv
    t = bpy.data.textures.new(f'n{seed}{o.name}', 'CLOUDS')
    t.noise_scale = size
    t.noise_depth = 2
    d = o.modifiers.new('disp', 'DISPLACE')
    d.texture = t
    d.strength = strength
    d.texture_coords = 'GLOBAL'
    off = Vector((seed * 13.7, seed * 7.3, seed * 3.1))
    o.location += off
    apply_all(o)
    o.location -= off


def bevel(o, width, segs=2):
    b = o.modifiers.new('bev', 'BEVEL')
    b.width = width
    b.segments = segs
    b.limit_method = 'ANGLE'
    apply_all(o)


def join(objs):
    activate(objs[0])
    for o in objs:
        o.select_set(True)
    bpy.ops.object.join()
    return active()


def export(objs, name):
    for x in bpy.context.view_layer.objects:
        x.select_set(False)
    for o in objs:
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    for o in objs:
        o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, name + '.glb'), export_format='GLB',
                              use_selection=True, export_apply=True, export_yup=True)
    print('exported', name, sum(len(o.data.polygons) for o in objs), 'faces')


def cube(loc, scale):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = active(); o.scale = scale; apply_all(o); return o


def cyl(r, d, loc, v=16, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=v, radius=r, depth=d, location=loc, rotation=rot)
    return active()


def cone(r1, r2, d, loc, v=8, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=v, radius1=r1, radius2=r2, depth=d, location=loc, rotation=rot)
    return active()


def sphere(r, loc, scale=(1, 1, 1), seg=20, rings=10):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, radius=r, location=loc)
    o = active(); o.scale = scale; apply_all(o); return o


def ico(r, loc, sub=2, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub, radius=r, location=loc)
    o = active(); o.scale = scale; apply_all(o); return o


def torus(Rr, r, loc, rot=(0, 0, 0), maj=24, mn=6):
    bpy.ops.mesh.primitive_torus_add(major_radius=Rr, minor_radius=r, major_segments=maj, minor_segments=mn,
                                     location=loc, rotation=rot)
    return active()


def tube(points, r0, r1, v=6):
    """A tapered tube along a list of points (for roots, vines, legs, antennae)."""
    bm = bmesh.new()
    rings = []
    n = len(points)
    for i, p in enumerate(points):
        p = Vector(p)
        d = (Vector(points[min(i + 1, n - 1)]) - Vector(points[max(i - 1, 0)])).normalized()
        q = d.to_track_quat('Z', 'Y')
        rr = r0 + (r1 - r0) * i / (n - 1)
        rings.append([bm.verts.new(p + q @ Vector((math.cos(a) * rr, math.sin(a) * rr, 0)))
                      for a in (k / v * math.tau for k in range(v))])
    for a, b in zip(rings, rings[1:]):
        for k in range(v):
            bm.faces.new((a[k], a[(k + 1) % v], b[(k + 1) % v], b[k]))
    bm.faces.new(list(reversed(rings[0])))
    me = bpy.data.meshes.new('tube'); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new('tube', me); bpy.context.collection.objects.link(o)
    return o


def leaf(length, width, loc, yaw, pitch, droop=.35, segs=3):
    """A curved, pointed leaf blade with a midrib fold."""
    bm = bmesh.new()
    left, mid, right = [], [], []
    for i in range(segs + 1):
        t = i / segs
        w = math.sin(t * math.pi) * width * (1 - t * .3)
        z = -droop * t * t * length
        y = t * length
        mid.append(bm.verts.new((0, y, z + .02 * math.sin(t * math.pi))))
        left.append(bm.verts.new((-w, y, z - w * .25)))
        right.append(bm.verts.new((w, y, z - w * .25)))
    for i in range(segs):
        bm.faces.new((left[i], mid[i], mid[i + 1], left[i + 1]))
        bm.faces.new((mid[i], right[i], right[i + 1], mid[i + 1]))
    me = bpy.data.meshes.new('leaf'); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new('leaf', me); bpy.context.collection.objects.link(o)
    o.rotation_euler = (pitch, 0, yaw)
    o.location = loc
    apply_all(o)
    return o


def M():
    return dict(
        grass=mat('Grass', (.12, .30, .08), .9),
        blade=mat('GrassBlade', (.20, .45, .10), .8),
        blade2=mat('GrassBlade2', (.32, .56, .14), .8),
        dirt=mat('Dirt', (.26, .17, .10), .95),
        irock=mat('IslandRock', (.33, .30, .27), .92),
        irock2=mat('IslandRockDark', (.20, .18, .17), .95),
        moss=mat('Moss', (.14, .34, .10), .95),
        bark=mat('Bark', (.30, .19, .11), .9),
        bark2=mat('BarkDark', (.19, .12, .07), .95),
        leaf=mat('Leaf', (.08, .30, .08), .75),
        leaf2=mat('Leaf2', (.16, .42, .10), .75),
        leaf3=mat('Leaf3', (.05, .22, .07), .8),
        vine=mat('Vine', (.20, .40, .10), .85),
        petal=mat('Petal', (1.0, .45, .65), .5, emit=(1.0, .35, .6), strength=.6),
        petal2=mat('PetalGold', (1.0, .82, .3), .5, emit=(1.0, .7, .2), strength=.6),
        shroom=mat('Mushroom', (.45, .95, .9), .4, emit=(.3, 1.0, .85), strength=3),
        stalk=mat('Stalk', (.85, .82, .72), .7),
        pebble=mat('Pebble', (.55, .52, .48), .9),
        water=mat('Water', (.45, .8, 1.0), .1, emit=(.35, .75, 1.0), strength=1.2),
        thorn=mat('Thorn', (.42, .28, .16), .7),
        thornTip=mat('ThornTip', (.9, .25, .15), .4, emit=(1.0, .2, .1), strength=2.5),
        carapace=mat('Carapace', (.10, .45, .32), .25, .6),
        carapace2=mat('Carapace2', (.05, .16, .12), .3, .5),
        eye=mat('InsectEye', (1.0, .35, .1), .2, emit=(1.0, .35, .08), strength=5),
        wing=mat('Wing', (.75, .95, 1.0), .1, emit=(.3, .6, .7), strength=.4),
        leg=mat('InsectLeg', (.06, .08, .07), .5, .3),
    )


# ---------------------------------------------------------------- grass tile (4x4, top at z=0)
def grass_tile(seed):
    reset(); m = M(); rnd = random.Random(seed)
    top = cube((0, 0, -.25), (4.02, 4.02, .5)); bevel(top, .12, 2)
    # gentle lumps in the turf
    bm = bmesh.new(); bm.from_mesh(top.data)
    for v in bm.verts:
        if v.co.z > -.05:
            v.co.z += .04 * math.sin(v.co.x * 2.1 + seed) * math.cos(v.co.y * 1.7 - seed)
    bm.to_mesh(top.data); bm.free()
    give(top, m['grass'])
    parts = [top]
    blades = []
    for i in range(45):
        x, y = rnd.uniform(-1.9, 1.9), rnd.uniform(-1.9, 1.9)
        h = rnd.uniform(.18, .42)
        b = cone(.035, 0, h, (x, y, h / 2), v=3)
        b.rotation_euler = (rnd.uniform(-.35, .35), rnd.uniform(-.35, .35), rnd.random() * 6.28)
        give(b, m['blade'] if rnd.random() < .6 else m['blade2'])
        blades.append(b)
    parts.append(join(blades))
    for i in range(rnd.randint(2, 4)):
        p = ico(rnd.uniform(.06, .14), (rnd.uniform(-1.8, 1.8), rnd.uniform(-1.8, 1.8), .02), 1, (1, 1, .6))
        displace(p, .03, .2, seed * 10 + i); give(p, m['pebble']); parts.append(p)
    if seed == 2:   # little flowers
        for i in range(5):
            x, y = rnd.uniform(-1.6, 1.6), rnd.uniform(-1.6, 1.6)
            st = cyl(.012, .22, (x, y, .11), v=5); give(st, m['vine']); parts.append(st)
            pm = m['petal'] if i % 2 else m['petal2']
            for k in range(5):
                a = k / 5 * math.tau
                pe = sphere(.045, (x + math.cos(a) * .05, y + math.sin(a) * .05, .23), (1.2, .6, .25), seg=6, rings=3)
                give(pe, pm); parts.append(pe)
            c = sphere(.03, (x, y, .235), seg=8, rings=4); give(c, m['petal2']); parts.append(c)
    if seed == 3:   # clover / moss patch
        for i in range(12):
            x, y = rnd.uniform(-1.5, 1.5), rnd.uniform(-1.5, 1.5)
            c = sphere(rnd.uniform(.12, .22), (x, y, 0), (1, 1, .35), seg=10, rings=5); give(c, m['moss']); parts.append(c)
    export([join(parts)], f'grass_{seed}')


# ---------------------------------------------------------------- jungle tree (fills one 4x4 wall cell)
def tree(seed):
    reset(); m = M(); rnd = random.Random(seed * 31)
    parts = []
    h = rnd.uniform(5.2, 6.4)
    # trunk: a gently bent tapered tube with bark bumps
    pts, x, y = [], 0, 0
    for i in range(7):
        t = i / 6
        x += rnd.uniform(-.12, .12); y += rnd.uniform(-.12, .12)
        pts.append((x, y, t * h))
    trunk = tube(pts, .62, .26, v=9)
    displace(trunk, .12, .35, seed, subdiv=1)
    give(trunk, m['bark'], True); parts.append(trunk)
    top = Vector(pts[-1])
    # buttress roots spreading over the cell
    for i in range(6):
        a = i / 6 * math.tau + rnd.uniform(-.3, .3)
        L = rnd.uniform(1.3, 1.9)
        rp = [(math.cos(a) * .25, math.sin(a) * .25, 1.0),
              (math.cos(a) * .7, math.sin(a) * .7, .45),
              (math.cos(a) * L * .8, math.sin(a) * L * .8, .08),
              (math.cos(a) * L, math.sin(a) * L, -.12)]
        root = tube(rp, .26, .06, v=6); give(root, m['bark2'], True); parts.append(root)
    # branches
    for i in range(4):
        a = i / 4 * math.tau + rnd.uniform(-.4, .4)
        z0 = h * rnd.uniform(.55, .8)
        bp = [(pts[4][0], pts[4][1], z0), (math.cos(a) * .9, math.sin(a) * .9, z0 + .6), (math.cos(a) * 1.6, math.sin(a) * 1.6, z0 + 1.2)]
        br = tube(bp, .16, .06, v=6); give(br, m['bark'], True); parts.append(br)
    # canopy: clusters of lumpy foliage blobs in three greens
    blobs = [(0, 0, h + .6, 1.9)]
    for i in range(5):
        a = i / 5 * math.tau + rnd.uniform(-.3, .3)
        d = rnd.uniform(1.0, 1.7)
        blobs.append((math.cos(a) * d, math.sin(a) * d, h + rnd.uniform(-.5, .5), rnd.uniform(1.0, 1.45)))
    for k, (bx, by, bz, br) in enumerate(blobs):
        b = ico(br, (bx, by, bz), 2, (1, 1, .72))
        displace(b, .6, .7, seed * 20 + k)
        give(b, [m['leaf'], m['leaf2'], m['leaf3']][k % 3]); parts.append(b)
    # leaf cards poking out of the canopy so it reads as foliage, not blobs
    for i in range(30):
        bx, by, bz, br = blobs[rnd.randrange(len(blobs))]
        a = rnd.random() * math.tau; e = rnd.uniform(-.2, .9)
        px, py, pz = bx + math.cos(a) * math.cos(e) * br * .95, by + math.sin(a) * math.cos(e) * br * .95, bz + math.sin(e) * br * .7
        lf = leaf(rnd.uniform(.45, .7), .17, (px, py, pz), a - math.pi / 2, R(rnd.uniform(-10, 35)), .5)
        give(lf, [m['leaf'], m['leaf2'], m['leaf3']][i % 3]); parts.append(lf)
    # broad hanging leaves + vines under the canopy
    for i in range(6):
        a = rnd.random() * math.tau; d = rnd.uniform(1.2, 2.2)
        lf = leaf(rnd.uniform(.6, .9), .22, (math.cos(a) * d, math.sin(a) * d, h - .4 + rnd.uniform(-.3, .2)), a - math.pi / 2, R(-25), .6)
        give(lf, m['leaf2']); parts.append(lf)
    for i in range(5):
        a = rnd.random() * math.tau; d = rnd.uniform(1.0, 1.9); L = rnd.uniform(1.6, 3.2)
        vx, vy = math.cos(a) * d, math.sin(a) * d
        vp = [(vx, vy, h), (vx + .08, vy, h - L * .5), (vx - .05, vy + .05, h - L)]
        v = tube(vp, .035, .02, v=4); give(v, m['vine'], True); parts.append(v)
        for j in range(3):
            lf = leaf(.22, .09, (vx, vy, h - L * (j + 1) / 4), rnd.random() * 6.28, R(-40), .3); give(lf, m['leaf']); parts.append(lf)
    # moss collar and a fern at the base
    moss = torus(.62, .16, (0, 0, .35), maj=14, mn=4); displace(moss, .08, .2, seed + 5); give(moss, m['moss']); parts.append(moss)
    for i in range(5):
        a = i / 5 * math.tau
        lf = leaf(.8, .2, (math.cos(a) * .7, math.sin(a) * .7, .1), a - math.pi / 2, R(25), .9); give(lf, m['leaf2']); parts.append(lf)
    export([join(parts)], f'tree_{seed}')


# ---------------------------------------------------------------- bushes / ferns / glow mushrooms (decoration)
def bush(seed):
    reset(); m = M(); rnd = random.Random(seed * 7)
    parts = []
    if seed == 1:     # fern
        for i in range(9):
            a = i / 9 * math.tau + rnd.uniform(-.2, .2)
            lf = leaf(rnd.uniform(.7, 1.0), .18, (0, 0, .05), a - math.pi / 2, R(rnd.uniform(25, 45)), .8)
            give(lf, m['leaf2'] if i % 2 else m['leaf']); parts.append(lf)
    else:             # glowing mushroom cluster with a few leaves
        for i in range(rnd.randint(3, 5)):
            x, y = rnd.uniform(-.35, .35), rnd.uniform(-.35, .35); hh = rnd.uniform(.25, .6)
            st = cone(.05, .035, hh, (x, y, hh / 2), v=8); give(st, m['stalk'], True); parts.append(st)
            cap = sphere(rnd.uniform(.12, .22), (x, y, hh), (1, 1, .55), seg=14, rings=7); give(cap, m['shroom'], True); parts.append(cap)
        for i in range(4):
            a = rnd.random() * math.tau
            lf = leaf(.5, .14, (0, 0, .02), a, R(30), .6); give(lf, m['leaf']); parts.append(lf)
    export([join(parts)], f'bush_{seed}')


# ---------------------------------------------------------------- thorn trap ("jungle spikes"), same footprint as spikes.glb
def thorns():
    reset(); m = M(); rnd = random.Random(11)
    base = cyl(1.75, .12, (0, 0, -.06), v=20); displace(base, .06, .3, 3, subdiv=1); give(base, m['dirt'])
    parts = [base]
    for i in range(5):
        for j in range(5):
            x, y = (i - 2) * .68 + rnd.uniform(-.1, .1), (j - 2) * .68 + rnd.uniform(-.1, .1)
            h = rnd.uniform(.85, 1.2)
            s = cone(.13, .0, h, (x, y, h / 2), v=5)
            s.rotation_euler = (rnd.uniform(-.18, .18), rnd.uniform(-.18, .18), rnd.random() * 6.28)
            give(s, m['thorn']); parts.append(s)
            tip = cone(.045, 0, .22, (0, 0, 0), v=5)
            tip.location = s.matrix_world @ Vector((0, 0, h / 2 - .1)); tip.rotation_euler = s.rotation_euler
            give(tip, m['thornTip']); parts.append(tip)
    # a tangle of thorny vines around the stakes
    for k in range(3):
        pts = []
        for i in range(10):
            a = i / 9 * math.tau * 1.1 + k
            rr = 1.2 + .25 * math.sin(i * 1.7 + k)
            pts.append((math.cos(a) * rr, math.sin(a) * rr, .18 + .12 * math.sin(i * 2.3 + k)))
        v = tube(pts, .05, .04, v=5); give(v, m['vine'], True); parts.append(v)
        for i in range(0, 10, 2):
            p = Vector(pts[i])
            t = cone(.03, 0, .14, (p.x, p.y, p.z + .07), v=4); give(t, m['thornTip']); parts.append(t)
    export([join(parts)], 'thorns')


# ---------------------------------------------------------------- insect enemy (body + two separate wings for flapping)
def insect():
    reset(); m = M()

    def pivot(o, at):
        """Move an object's origin to a joint so the engine can rotate it there."""
        bpy.context.scene.cursor.location = at
        activate(o); bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
        return o

    def smooth_mod(o, lv=1):
        sm = o.modifiers.new('sm', 'SUBSURF'); sm.levels = sm.render_levels = lv
        apply_all(o)
        for pl in o.data.polygons: pl.use_smooth = True
        return o

    # body faces -Y (head at -Y, abdomen at +Y); smooth, rounded shapes
    parts = []
    th = sphere(.2, (0, -.06, .04), (1, 1.1, .92), seg=32, rings=16); give(th, m['carapace2'], True); parts.append(th)
    collar = torus(.15, .03, (0, -.2, .05), rot=(R(90), 0, 0), maj=32, mn=10); give(collar, m['carapace'], True); parts.append(collar)
    hd = sphere(.165, (0, -.33, .06), (1.05, .95, .92), seg=32, rings=16); give(hd, m['carapace'], True); parts.append(hd)
    for sx in (-1, 1):
        e = sphere(.095, (sx * .115, -.4, .1), (1, 1.1, 1.2), seg=24, rings=12); give(e, m['eye'], True); parts.append(e)
        md = tube([(sx * .05, -.46, -.02), (sx * .09, -.53, -.05), (sx * .04, -.58, -.07)], .03, .006, v=8); smooth_mod(md); give(md, m['leg'], True); parts.append(md)
        ant = tube([(sx * .06, -.43, .18), (sx * .12, -.54, .33), (sx * .2, -.62, .42), (sx * .28, -.64, .44)], .014, .007, v=8); smooth_mod(ant); give(ant, m['leg'], True); parts.append(ant)
        tip = sphere(.024, (sx * .28, -.64, .44), seg=12, rings=6); give(tip, m['eye'], True); parts.append(tip)
    body = join(parts); body.name = 'Body'
    # abdomen: separate so it can pulse and curl, pivot where it meets the thorax
    ab_parts = []
    ab = sphere(.32, (0, .38, -.02), (.82, 1.25, .78), seg=32, rings=16); give(ab, m['carapace'], True); ab_parts.append(ab)
    for i in range(4):
        y = .2 + i * .15; rr = .26 - abs(i - 1.2) * .045
        bnd = torus(rr, .022, (0, y, -.02), rot=(R(90), 0, 0), maj=40, mn=10); give(bnd, m['carapace2'], True); ab_parts.append(bnd)
    sting = tube([(0, .74, -.06), (0, .86, -.1), (0, .93, -.17)], .045, .004, v=10); smooth_mod(sting); give(sting, m['eye'], True); ab_parts.append(sting)
    abd = join(ab_parts); abd.name = 'Abdomen'; pivot(abd, (0, .1, 0))
    # legs: one object per side, pivot at the hips so they can swing and tuck
    legs = []
    for sx, name in ((-1, 'LegsL'), (1, 'LegsR')):
        lp_ = []
        for k, yy in enumerate((-.14, -.05, .04)):
            spread = (k - 1) * .35
            pts = [(sx * .13, yy, -.03), (sx * .3, yy + spread * .25, .06), (sx * .42, yy + spread * .55, -.16), (sx * .47, yy + spread * .7, -.34)]
            lg = tube(pts, .024, .01, v=8); smooth_mod(lg); give(lg, m['leg'], True); lp_.append(lg)
            ft = sphere(.022, pts[-1], seg=10, rings=5); give(ft, m['leg'], True); lp_.append(ft)
        lgo = join(lp_); lgo.name = name; pivot(lgo, (sx * .13, -.05, -.03)); legs.append(lgo)
    # two pairs of veined wings, pivots at the roots
    wings = []
    for pair, (sz, y0, z0) in enumerate(((1.0, -.08, .21), (.72, .06, .19))):
        for sx, name in ((1, 'WingR'), (-1, 'WingL')):
            name = name + ('2' if pair else '')
            bm = bmesh.new()
            n = 28
            outline = []
            for i in range(n):
                t = i / (n - 1) * math.pi
                x = sx * (.04 + .6 * sz * math.sin(t) ** .75)
                y = (.46 * sz * (1 - math.cos(t)) * .5 - .04 + .09 * sz * math.sin(t))
                outline.append(bm.verts.new((x, y, 0)))
            bm.faces.new(outline if sx > 0 else list(reversed(outline)))
            me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
            w = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(w)
            sol = w.modifiers.new('sol', 'SOLIDIFY'); sol.thickness = .005
            apply_all(w); give(w, m['wing'], True)
            vparts = [w]
            for k in range(3):   # veins
                a0 = (k + 1) / 4
                vn = tube([(sx * .04, .0, .003), (sx * .3 * sz, (a0 - .3) * .3 * sz, .003), (sx * .55 * sz, (a0 - .2) * .45 * sz, .003)], .004, .002, v=4)
                give(vn, m['leg'], True); vparts.append(vn)
            wo = join(vparts); wo.name = name
            wo.location = (sx * .1, y0, z0); wo.rotation_euler = (0, sx * R(-10), 0)
            activate(wo); bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
            wings.append(wo)
    export([body, abd] + legs + wings, 'insect')


# ---------------------------------------------------------------- floating island base (unit radius, grass top at z=0)
def island(name, seed, radius=1.0, detail=1.0, waterfall=True, v=72, sub=2):
    reset(); m = M(); rnd = random.Random(seed)
    parts = []
    # irregular outline
    prof = [1 + .08 * math.sin(k * 3 / v * math.tau + seed) + .05 * math.sin(k * 7 / v * math.tau + seed * 2) for k in range(v)]
    bm = bmesh.new()
    top = [bm.verts.new((math.cos(k / v * math.tau) * prof[k] * radius, math.sin(k / v * math.tau) * prof[k] * radius, 0)) for k in range(v)]
    bm.faces.new(top)
    me = bpy.data.meshes.new('cap'); bm.to_mesh(me); bm.free()
    cap = bpy.data.objects.new('cap', me); bpy.context.collection.objects.link(cap)
    sol = cap.modifiers.new('sol', 'SOLIDIFY'); sol.thickness = .035 * radius; sol.offset = -1
    apply_all(cap); give(cap, m['grass']); parts.append(cap)
    # dirt band and layered rock body tapering down to a point
    layers = [(-.035, 1.0, m['dirt']), (-.11, .97, m['dirt']), (-.2, .92, m['irock']), (-.38, .8, m['irock']),
              (-.58, .62, m['irock2']), (-.8, .42, m['irock']), (-1.05, .22, m['irock2']), (-1.3, .06, m['irock2'])]
    for (z0, s0, mt), (z1, s1, _) in zip(layers, layers[1:]):
        bm = bmesh.new()
        ra = [bm.verts.new((math.cos(k / v * math.tau) * prof[k] * s0 * radius, math.sin(k / v * math.tau) * prof[k] * s0 * radius, z0 * radius)) for k in range(v)]
        rb = [bm.verts.new((math.cos(k / v * math.tau) * prof[k] * s1 * radius, math.sin(k / v * math.tau) * prof[k] * s1 * radius, z1 * radius)) for k in range(v)]
        for k in range(v):
            bm.faces.new((ra[k], rb[k], rb[(k + 1) % v], ra[(k + 1) % v]))
        me = bpy.data.meshes.new('band'); bm.to_mesh(me); bm.free()
        o = bpy.data.objects.new('band', me); bpy.context.collection.objects.link(o)
        displace(o, .085 * radius, .16 * radius, seed + int(z0 * 100), subdiv=sub)
        give(o, mt); parts.append(o)
    # hanging roots and rocks under the island
    for i in range(int(26 * detail)):
        a = rnd.random() * math.tau; d = rnd.uniform(.3, .9)
        z0 = -(.15 + (1 - d) * .8) * radius
        L = rnd.uniform(.15, .45) * radius
        x, y = math.cos(a) * d * radius * .85, math.sin(a) * d * radius * .85
        rt = tube([(x, y, z0), (x + rnd.uniform(-.03, .03) * radius, y, z0 - L * .5), (x, y + rnd.uniform(-.03, .03) * radius, z0 - L)], .012 * radius, .003 * radius, v=5)
        give(rt, m['bark2'], True); parts.append(rt)
    for i in range(int(10 * detail)):
        a = rnd.random() * math.tau; d = rnd.uniform(.2, .7)
        rk = ico(rnd.uniform(.03, .08) * radius, (math.cos(a) * d * radius, math.sin(a) * d * radius, -rnd.uniform(.9, 1.4) * radius), 1)
        displace(rk, .015 * radius, .05 * radius, seed * 7 + i); give(rk, m['irock2']); parts.append(rk)
    # boulders and moss around the rim
    for i in range(int(18 * detail)):
        a = rnd.random() * math.tau
        k = int(a / math.tau * v) % v
        rr = prof[k] * radius * rnd.uniform(.9, .98)
        b = ico(rnd.uniform(.012, .03) * radius, (math.cos(a) * rr, math.sin(a) * rr, 0), 1, (1, 1, .7))
        displace(b, .006 * radius, .02 * radius, seed * 3 + i); give(b, m['irock'] if i % 3 else m['moss']); parts.append(b)
    if waterfall:
        a = .3; k = int(a / math.tau * v)
        rr = prof[k] * radius
        wf = cube((math.cos(a) * rr * 1.01, math.sin(a) * rr * 1.01, -.6 * radius), (.11 * radius, .01 * radius, 1.2 * radius))
        wf.rotation_euler.z = a + math.pi / 2; apply_all(wf); give(wf, m['water']); parts.append(wf)
        pool = cyl(.07 * radius, .01 * radius, (math.cos(a) * rr * .9, math.sin(a) * rr * .9, .002 * radius), v=16); give(pool, m['water']); parts.append(pool)
    export([join(parts)], name)


def islet(seed):
    """Small background floating island with a tree on top."""
    island(f'islet_{seed}', 40 + seed, radius=1.0, detail=.4, waterfall=seed == 1, v=36, sub=1)


grass_tile(1); grass_tile(2); grass_tile(3)
tree(1); tree(2); tree(3)
bush(1); bush(2)
thorns()
insect()
island('island', 7, radius=1.0, detail=1.4, waterfall=True)
islet(1); islet(2)
print('NATURE DONE')
