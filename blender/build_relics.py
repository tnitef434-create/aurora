# 12 unique relic collectibles for Aurora: exports relic_N.glb and renders relic_N.png icons.
# Run:  blender --background --factory-startup --python build_relics.py -- <glb_dir> <png_dir>
import bpy, bmesh, math, os, sys
from mathutils import Vector

args = sys.argv[sys.argv.index('--') + 1:]
OUT, ICONS = args[0], args[1]
os.makedirs(OUT, exist_ok=True); os.makedirs(ICONS, exist_ok=True)
R = math.radians


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, color, rough=.3, metal=0.0, emit=None, strength=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    if m.node_tree is None:
        try: m.use_nodes = True
        except Exception: pass
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1)
        b.inputs['Emission Strength'].default_value = strength
    m.diffuse_color = (*(emit or color), 1)
    return m


def act(): return bpy.context.view_layer.objects.active


def sel(o):
    for x in bpy.context.view_layer.objects: x.select_set(False)
    o.select_set(True); bpy.context.view_layer.objects.active = o


def fin(o, m, smooth=False, mods=True):
    sel(o)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if mods:
        for md in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=md.name)
    o.data.materials.clear(); o.data.materials.append(m)
    for p in o.data.polygons: p.use_smooth = smooth
    PARTS.append(o); return o


def sphere(r, loc, sc=(1, 1, 1), seg=24, rings=12):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, radius=r, location=loc); o = act(); o.scale = sc; return o


def ico(r, loc, sub=1, sc=(1, 1, 1)):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub, radius=r, location=loc); o = act(); o.scale = sc; return o


def cone(r1, r2, d, loc, v=8, rot=(0, 0, 0), sc=(1, 1, 1)):
    bpy.ops.mesh.primitive_cone_add(vertices=v, radius1=r1, radius2=r2, depth=d, location=loc, rotation=rot); o = act(); o.scale = sc; return o


def cyl(r, d, loc, v=24, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=v, radius=r, depth=d, location=loc, rotation=rot); return act()


def torus(Rr, r, loc, rot=(0, 0, 0), maj=48, mn=10):
    bpy.ops.mesh.primitive_torus_add(major_radius=Rr, minor_radius=r, major_segments=maj, minor_segments=mn, location=loc, rotation=rot); return act()


def cube(sc, loc, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot); o = act(); o.scale = sc; return o


def star_prism(outer, inner, depth, loc, points=5, rot=(R(90), 0, 0)):
    me = bpy.data.meshes.new('star'); bm = bmesh.new()
    vs = []
    for i in range(points * 2):
        a = i / (points * 2) * math.tau + math.pi / 2
        rr = outer if i % 2 == 0 else inner
        vs.append(bm.verts.new((math.cos(a) * rr, math.sin(a) * rr, 0)))
    f = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [e for e in ext['geom'] if isinstance(e, bmesh.types.BMVert)]: v.co.z += depth
    bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, -depth / 2))
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new('star', me); bpy.context.collection.objects.link(o)
    o.location = loc; o.rotation_euler = rot
    return o


PARTS = []

# palettes
GOLD = lambda: mat('RGold', (1, .78, .4), .22, 1.0)
SILVER = lambda: mat('RSilver', (.85, .9, 1), .2, 1.0)
DARK = lambda: mat('RDark', (.12, .12, .16), .35, .8)


def glow(name, c, s=5): return mat(name, c, .1, .1, emit=c, strength=s * .22)


def glass(name, c): return mat(name, c, .05, .2, emit=tuple(v * .35 for v in c), strength=.8)


# ------------------------------------------------------------------ designs
def compass():        # 0 Driftglass Compass
    g = GOLD(); cy = glass('RGlassCyan', (.4, .95, 1)); red = glow('RRed', (1, .3, .4))
    fin(torus(.45, .05, (0, 0, 0), rot=(R(90), 0, 0)), g, True)
    fin(cyl(.42, .05, (0, 0, 0), rot=(R(90), 0, 0), v=32), cy, True)
    fin(cone(.07, 0, .38, (0, -.04, .19), v=4), red)
    fin(cone(.07, 0, .38, (0, -.04, -.19), v=4, rot=(R(180), 0, 0)), glow('RCyan', (.4, .95, 1)))
    for a in range(4):
        ang = a * math.pi / 2
        fin(cone(.05, 0, .16, (math.sin(ang) * .56, 0, math.cos(ang) * .56), v=4, rot=(0, ang, 0)), g)
    fin(sphere(.05, (0, -.06, 0)), g, True)


def first_star():     # 1 Echo of the First Star
    w = glow('RStar', (1, .95, .7), 6)
    fin(star_prism(.46, .2, .16, (0, 0, 0)), w)
    fin(torus(.62, .02, (0, .06, 0), rot=(R(90), 0, 0)), GOLD(), True)
    for i in range(5):
        a = i / 5 * math.tau
        fin(sphere(.045, (math.cos(a) * .72, 0, math.sin(a) * .72)), glow('RPink', (1, .5, .85)), True)


def seedlight():      # 2 Garden Seedlight
    g = GOLD(); leaf = mat('RLeaf', (.2, .8, .5), .4, .1, emit=(.1, .5, .3), strength=1)
    fin(sphere(.2, (0, 0, 0)), glow('RSeed', (.5, 1, .8), 6), True)
    for i in range(3): fin(torus(.36, .018, (0, 0, 0), rot=(R(90), 0, i * math.pi / 3)), g, True)
    fin(torus(.36, .018, (0, 0, 0)), g, True)
    for i in range(3):
        a = i * math.tau / 3
        fin(cone(.08, 0, .32, (math.cos(a) * .1, math.sin(a) * .1, .5), v=6, rot=(math.sin(a) * .5, -math.cos(a) * .5, 0), sc=(1, .4, 1)), leaf)
    fin(cyl(.03, .14, (0, 0, .4), v=8), g)


def tidal_bloom():    # 3 Tidal Bloom
    pet = glass('RPetal', (.5, .7, 1))
    for i in range(8):
        a = i / 8 * math.tau
        o = sphere(.2, (math.cos(a) * .24, math.sin(a) * .24, .05), (1, .45, .18))
        o.rotation_euler = (0, R(-35), a); fin(o, pet, True)
    for i in range(6):
        a = i / 6 * math.tau + .3
        o = sphere(.14, (math.cos(a) * .13, math.sin(a) * .13, .14), (1, .45, .18))
        o.rotation_euler = (0, R(-55), a); fin(o, glass('RPetal2', (.7, .55, 1)), True)
    fin(sphere(.09, (0, 0, .16)), glow('RCore', (.6, .9, 1)), True)
    fin(cyl(.03, .45, (0, 0, -.22), v=8), GOLD())
    fin(torus(.36, .02, (0, 0, -.02)), GOLD(), True)


def ember():          # 4 Ember of the Core
    fl = glow('RFlame', (1, .45, .15), 7)
    o = sphere(.2, (0, 0, -.08)); fin(o, fl, True)
    fin(cone(.2, 0, .45, (0, 0, .2), v=24), fl, True)
    fin(sphere(.1, (0, 0, -.02)), glow('RFlameCore', (1, .9, .5), 8), True)
    fin(torus(.4, .04, (0, 0, 0), rot=(R(90), 0, R(25))), GOLD(), True)
    fin(torus(.46, .02, (0, 0, 0), rot=(R(70), R(40), 0)), DARK(), True)


def hourglass():      # 5 Magma Hourglass
    gl = glass('RGlassAmber', (1, .6, .3)); g = GOLD()
    fin(cone(.26, .03, .42, (0, 0, .21), v=24, rot=(R(180), 0, 0)), gl, True)
    fin(cone(.26, .03, .42, (0, 0, -.21), v=24), gl, True)
    fin(cone(.18, .02, .16, (0, 0, -.33), v=16), glow('RSand', (1, .5, .1), 6), True)
    for z in (.44, -.44): fin(cyl(.33, .05, (0, 0, z), v=6), g)
    for i in range(3):
        a = i * math.tau / 3
        fin(cyl(.025, .88, (math.cos(a) * .3, math.sin(a) * .3, 0), v=8), g)


def halo_shard():     # 6 Frozen Halo Shard
    ice = glass('RIce', (.6, .9, 1))
    specs = [(0, 0, .12, .7), (.13, .05, .07, .45), (-.12, .06, .06, .4), (.04, -.13, .06, .38), (-.06, -.1, .05, .3)]
    for x, y, r, h in specs:
        o = cone(r, 0, h, (x, y, h / 2 - .2), v=6); o.rotation_euler = (y * 1.5, -x * 1.5, 0); fin(o, ice)
    fin(torus(.38, .025, (0, 0, .12)), glow('RHalo', (.7, .95, 1), 6), True)
    fin(cyl(.2, .06, (0, 0, -.22), v=6), SILVER())


def lantern():        # 7 Glacier Lantern
    frame = cube((.36, .36, .5), (0, 0, 0))
    w = frame.modifiers.new('wire', 'WIREFRAME'); w.thickness = .035
    fin(frame, SILVER())
    fin(sphere(.13, (0, 0, 0)), glow('RLantern', (.55, .9, 1), 7), True)
    fin(cone(.26, .05, .14, (0, 0, .32), v=4, rot=(0, 0, R(45))), SILVER())
    fin(torus(.08, .015, (0, 0, .44), rot=(R(90), 0, 0)), SILVER(), True)
    fin(cyl(.2, .05, (0, 0, -.28), v=4, rot=(0, 0, R(45))), SILVER())


def prism_thorn():    # 8 Prism Thorn
    pr = glass('RPrism', (1, .35, .6))
    fin(cyl(.24, .72, (0, 0, 0), v=3), pr)
    for i in range(9):
        a = i / 9 * math.tau; z = -.28 + (i % 3) * .28
        o = cone(.04, 0, .2, (math.cos(a) * .2, math.sin(a) * .2, z), v=4)
        o.rotation_euler = (math.sin(a) * -R(90), math.cos(a) * R(90), 0); fin(o, DARK())
    fin(sphere(.08, (0, 0, .42)), glow('RPrismTip', (1, .5, .8), 7), True)
    fin(sphere(.08, (0, 0, -.42)), glow('RPrismTip', (1, .5, .8), 7), True)


def lotus():          # 9 Laser Lotus
    for ring, (n, rr, tilt, name, c) in enumerate([(8, .3, 55, 'RLotusOut', (1, .3, .6)), (6, .18, 35, 'RLotusIn', (1, .6, .85))]):
        for i in range(n):
            a = i / n * math.tau + ring * .3
            o = cone(.1, 0, .34, (math.cos(a) * rr, math.sin(a) * rr, .08 + ring * .06), v=4, sc=(1, .35, 1))
            o.rotation_euler = (R(tilt) * -math.sin(a), R(tilt) * math.cos(a), a); fin(o, glass(name, c))
    fin(sphere(.08, (0, 0, .14)), glow('RLaser', (1, .25, .35), 8), True)
    fin(cyl(.012, .6, (0, 0, .45), v=6), glow('RLaser', (1, .25, .35), 8))
    fin(cyl(.3, .04, (0, 0, -.02), v=32), DARK())


def heart():          # 10 Heart of Aurora
    h = glow('RHeart', (.4, 1, .75), 5)
    fin(sphere(.2, (-.14, 0, .1)), h, True); fin(sphere(.2, (.14, 0, .1)), h, True)
    fin(cone(.3, 0, .42, (0, 0, -.2), v=24, rot=(R(180), 0, 0), sc=(1, .7, 1)), h, True)
    fin(torus(.5, .025, (0, 0, 0), rot=(R(90), 0, 0)), GOLD(), True)
    fin(torus(.56, .012, (0, 0, 0), rot=(R(90), 0, R(90))), glow('RPink', (1, .5, .85)), True)


def crown():          # 11 Northern Crown
    g = GOLD()
    band = cyl(.34, .16, (0, 0, -.1), v=32)
    s = band.modifiers.new('sol', 'SOLIDIFY'); s.thickness = .04
    bm_ = bmesh.new(); bm_.from_mesh(band.data)
    bmesh.ops.delete(bm_, geom=[f for f in bm_.faces if abs(f.normal.z) > .9], context='FACES'); bm_.to_mesh(band.data); bm_.free()
    fin(band, g, True)
    for i in range(7):
        a = i / 7 * math.tau
        fin(cone(.06, 0, .28, (math.cos(a) * .34, math.sin(a) * .34, .1), v=4), g)
        cols = [(.4, 1, .75), (.72, .6, 1), (1, .5, .85), (.5, .85, 1)]
        fin(ico(.045, (math.cos(a) * .34, math.sin(a) * .34, .26)), glow(f'RGem{i % 4}', cols[i % 4], 6))
    fin(ico(.08, (0, -.36, -.1), sc=(1, .6, 1)), glow('RGemBig', (.4, 1, .75), 6))


DESIGNS = [compass, first_star, seedlight, tidal_bloom, ember, hourglass, halo_shard, lantern, prism_thorn, lotus, heart, crown]


def render_icon(path):
    scn = bpy.context.scene
    bpy.ops.object.camera_add(location=(1.7, -2.4, 1.1)); cam = act()
    d = Vector((0, 0, 0)) - cam.location
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    cam.data.lens = 70
    scn.camera = cam
    bpy.ops.object.light_add(type='AREA', location=(2, -2, 3)); l = act(); l.data.energy = 300; l.data.size = 3
    l.rotation_euler = (Vector((0, 0, 0)) - l.location).to_track_quat('-Z', 'Y').to_euler()
    bpy.ops.object.light_add(type='AREA', location=(-2.5, 1, 1)); l2 = act(); l2.data.energy = 180; l2.data.size = 3
    l2.rotation_euler = (Vector((0, 0, 0)) - l2.location).to_track_quat('-Z', 'Y').to_euler()
    world = bpy.data.worlds.new('w'); scn.world = world
    world.color = (0.02, 0.02, 0.04)
    for eng in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE', 'BLENDER_WORKBENCH'):
        try: scn.render.engine = eng; break
        except Exception: continue
    scn.render.film_transparent = True
    scn.render.resolution_x = scn.render.resolution_y = 256
    scn.render.image_settings.file_format = 'PNG'; scn.render.image_settings.color_mode = 'RGBA'
    try: scn.view_settings.view_transform = 'Standard'; scn.view_settings.look = 'None'
    except Exception: pass
    scn.render.filepath = path
    bpy.ops.render.render(write_still=True)
    return scn.render.engine


for i, fn in enumerate(DESIGNS):
    reset(); PARTS.clear()
    fn()
    sel(PARTS[0])
    for o in PARTS: o.select_set(True)
    bpy.ops.object.join(); o = act()
    # normalise: centre and scale so the largest dimension is ~1.1
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS'); o.location = (0, 0, 0)
    k = 1.1 / max(o.dimensions); o.scale = (k, k, k)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, f'relic_{i}.glb'), export_format='GLB', use_selection=True, export_apply=True, export_yup=True)
    eng = render_icon(os.path.join(ICONS, f'relic_{i}.png'))
    print('relic', i, fn.__name__, eng)
print('RELICS DONE')
