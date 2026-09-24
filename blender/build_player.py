# Detailed, rigged + animated astronaut for Aurora.
# Run:  blender --background --factory-startup --python build_player.py -- <out_dir> [render]
import bpy, math, os, sys
from mathutils import Vector

args = sys.argv[sys.argv.index('--') + 1:]
OUT = args[0]
RENDER = 'render' in args[1:]
NATURE = 'nature' in args[1:]   # Chapter 2 look: explorer suit with bark, moss and leaves
os.makedirs(OUT, exist_ok=True)
R = math.radians

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.fps = 30


def mat(name, color, rough=.5, metal=0.0, emit=None, strength=0.0):
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
    return m


SUIT = mat('Suit', (.93, .94, .97), .42)
DARK = mat('SuitDark', (.16, .17, .22), .45, .6)
ACC = mat('SuitAccent', (.70, .60, 1.0), .35, .2)
VISOR = mat('Visor', (.02, .04, .09), .04, .9, emit=(.25, .75, 1.0), strength=1.2)
GLOW = mat('Glow', (1, .5, .9), emit=(1.0, .5, .85), strength=6)
GLOW2 = mat('GlowCyan', (.5, .9, 1), emit=(.45, .9, 1.0), strength=6)
if NATURE:
    for mm, c in ((SUIT, (.80, .74, .56)), (DARK, (.28, .18, .10)), (ACC, (.30, .62, .20))):
        mm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*c, 1)
    DARK.node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value = 0
    for mm, c in ((GLOW, (1.0, .85, .3)), (GLOW2, (.55, 1.0, .35))):
        b = mm.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (*c, 1); b.inputs['Emission Color'].default_value = (*c, 1)
    VISOR.node_tree.nodes['Principled BSDF'].inputs['Emission Color'].default_value = (.5, 1.0, .45, 1)
LEAF = mat('Leaf', (.20, .55, .16), .7)
LEAF2 = mat('Leaf2', (.32, .66, .18), .7)
VINE = mat('Vine', (.18, .38, .10), .8)
PETAL = mat('Petal', (1.0, .45, .65), .5, emit=(1.0, .35, .6), strength=1.5)


def act():
    return bpy.context.view_layer.objects.active


def sel(o):
    for x in bpy.context.view_layer.objects: x.select_set(False)
    o.select_set(True); bpy.context.view_layer.objects.active = o


def apply(o):
    sel(o)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    for md in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=md.name)


PARTS = []


def part(o, material, bone, smooth=True, bevel=0):
    if bevel:
        b = o.modifiers.new('bev', 'BEVEL'); b.width = bevel; b.segments = 3
    apply(o)
    o.data.materials.clear(); o.data.materials.append(material)
    for p in o.data.polygons: p.use_smooth = smooth
    vg = o.vertex_groups.new(name=bone)
    vg.add(list(range(len(o.data.vertices))), 1.0, 'REPLACE')
    PARTS.append(o)
    return o


def sphere(r, loc, scale=(1, 1, 1), seg=32, rings=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, radius=r, location=loc)
    o = act(); o.scale = scale; return o


def cyl(r, depth, loc, rot=(0, 0, 0), v=24, r2=None):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=v, radius=r, depth=depth, location=loc, rotation=rot)
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=v, radius1=r, radius2=r2, depth=depth, location=loc, rotation=rot)
    return act()


def box(size, loc, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = act(); o.scale = size; return o


def torus(R_, r, loc, rot=(0, 0, 0), maj=32, mn=10):
    bpy.ops.mesh.primitive_torus_add(major_radius=R_, minor_radius=r, major_segments=maj, minor_segments=mn, location=loc, rotation=rot)
    return act()


# ------------------------------------------------------------------ mesh (Z up, facing -Y)
# torso
part(box((.44, .30, .40), (0, 0, 1.13)), SUIT, 'spine', bevel=.09)
part(box((.34, .06, .22), (0, -.16, 1.17)), DARK, 'spine', bevel=.03)                 # chest panel
part(box((.20, .02, .025), (0, -.195, 1.22)), GLOW2, 'spine')                          # chest light strip
for i, x in enumerate((-.08, 0, .08)):
    part(sphere(.018, (x, -.195, 1.12), seg=12, rings=6), GLOW if i == 1 else ACC, 'spine')
part(torus(.13, .035, (0, 0, 1.35)), DARK, 'spine')                                    # neck ring
# shoulder pads
for sx in (-1, 1):
    part(sphere(.12, (sx * .27, 0, 1.30), (1.1, 1, .8)), ACC, 'spine')
# backpack
part(box((.36, .16, .40), (0, .22, 1.14)), DARK, 'spine', bevel=.05)
part(box((.30, .03, .30), (0, .31, 1.16)), SUIT, 'spine', bevel=.02)
for sx in (-1, 1):
    part(cyl(.055, .20, (sx * .11, .26, .90)), DARK, 'spine')
    part(cyl(.045, .03, (sx * .11, .26, .795)), GLOW, 'spine')                          # thruster glow
part(cyl(.012, .30, (.13, .25, 1.47), v=8), DARK, 'spine')                               # antenna
part(sphere(.035, (.13, .25, 1.63), seg=12, rings=8), GLOW, 'spine')
# hips
part(box((.36, .26, .16), (0, 0, .87)), DARK, 'hips', bevel=.05)
part(torus(.215, .03, (0, 0, .95), maj=40), ACC, 'hips')                                # belt
part(box((.07, .03, .05), (0, -.19, .95)), GLOW2, 'hips')                               # buckle light
# head / helmet
part(sphere(.23, (0, 0, 1.57)), SUIT, 'head')
part(sphere(.185, (0, -.075, 1.575), (1.05, .78, .82)), VISOR, 'head')
part(torus(.215, .02, (0, -.02, 1.575), rot=(R(90), 0, 0), maj=40), ACC, 'head')        # visor rim
for sx in (-1, 1):
    part(cyl(.05, .05, (sx * .225, 0, 1.58), rot=(0, R(90), 0), v=16), DARK, 'head')     # ear pods
    part(cyl(.03, .052, (sx * .228, 0, 1.58), rot=(0, R(90), 0), v=16), GLOW2, 'head')
# arms
for sx, s in ((1, 'L'), (-1, 'R')):
    part(cyl(.075, .22, (sx * .31, 0, 1.17)), SUIT, f'upperarm.{s}')
    part(sphere(.07, (sx * .315, 0, 1.03)), DARK, f'forearm.{s}')                      # elbow
    part(cyl(.07, .20, (sx * .32, 0, .92), r2=.062), SUIT, f'forearm.{s}')
    part(torus(.066, .018, (sx * .32, 0, .83), maj=20, mn=6), GLOW2, f'forearm.{s}')     # wrist light
    part(sphere(.07, (sx * .32, -.01, .77), (1, 1, 1.15)), DARK, f'forearm.{s}')        # glove
# legs
for sx, s in ((1, 'L'), (-1, 'R')):
    part(cyl(.09, .30, (sx * .11, 0, .66), r2=.08), SUIT, f'thigh.{s}')
    part(sphere(.08, (sx * .11, -.02, .48), (1, .9, 1)), ACC, f'shin.{s}')             # knee pad
    part(cyl(.078, .28, (sx * .11, 0, .31), r2=.07), SUIT, f'shin.{s}')
    part(box((.15, .24, .12), (sx * .11, -.035, .08)), DARK, f'shin.{s}', bevel=.045)  # boot
    part(box((.13, .05, .02), (sx * .11, -.155, .06)), GLOW2, f'shin.{s}')              # toe light

def lsphere(r, loc, sc=(1, 1, 1)):   # low-poly sphere for the many small leaves
    return sphere(r, loc, sc, seg=10, rings=5)


if NATURE:
    # leaf sprout on the helmet
    part(cyl(.012, .14, (-.06, .02, 1.83), rot=(R(-12), R(-10), 0), v=6), VINE, 'head')
    for k, (yaw, pitch) in enumerate(((R(30), R(-35)), (R(200), R(-40)), (R(110), R(-20)))):
        lf = lsphere(.08, (-.07, .02, 1.9), (1, .38, .07)); lf.rotation_euler = (pitch, 0, yaw)
        lf.location = (-.07 + math.cos(yaw) * .06, .02 + math.sin(yaw) * .06, 1.9)
        part(lf, LEAF if k % 2 else LEAF2, 'head')
    # moss and leaves on the shoulders
    for sx in (-1, 1):
        for k in range(3):
            lf = lsphere(.07, (sx * (.25 + k * .04), -.02 + k * .05, 1.39), (1, .45, .08))
            lf.rotation_euler = (R(-20 + k * 15), sx * R(25), R(k * 50))
            part(lf, LEAF2 if k % 2 else LEAF, 'spine')
    # a vine wrapped around the torso and belt
    part(torus(.235, .018, (0, 0, 1.05), rot=(R(12), R(-8), 0), maj=32, mn=6), VINE, 'spine')
    part(torus(.225, .016, (0, 0, .9), rot=(R(-10), R(6), 0), maj=32, mn=6), VINE, 'hips')
    for k in range(5):
        a = k / 5 * math.tau
        lf = lsphere(.05, (math.cos(a) * .24, math.sin(a) * .24, 1.05 + math.sin(a) * .04), (1, .4, .07)); lf.rotation_euler = (0, R(60), a)
        part(lf, LEAF, 'spine')
    # a flower growing out of the backpack
    for k in range(5):
        a = k / 5 * math.tau
        part(lsphere(.035, (.13 + math.cos(a) * .035, .25, 1.66 + math.sin(a) * .035), (1, .5, 1)), PETAL, 'spine')
    # leaf cuffs on wrists and boots
    for sx, s_ in ((1, 'L'), (-1, 'R')):
        part(torus(.075, .02, (sx * .32, 0, .86), maj=16, mn=5), VINE, f'forearm.{s_}')
        for k in range(3):
            lf = lsphere(.05, (sx * .11 + (k - 1) * .05, -.02, .2), (1, .4, .07)); lf.rotation_euler = (R(70), 0, R((k - 1) * 30))
            part(lf, LEAF2, f'shin.{s_}')

sel(PARTS[0])
for o in PARTS: o.select_set(True)
bpy.ops.object.join()
body = act(); body.name = 'Astronaut'

# ------------------------------------------------------------------ armature
bpy.ops.object.armature_add(enter_editmode=True, location=(0, 0, 0))
arm = act(); arm.name = 'Rig'; arm.data.name = 'RigData'
eb = arm.data.edit_bones
eb.remove(eb[0])


def bone(name, head, tail, parent=None):
    b = eb.new(name); b.head = head; b.tail = tail; b.roll = 0
    if parent: b.parent = eb[parent]; b.use_connect = False
    return b


bone('hips', (0, 0, .87), (0, 0, 1.0))
bone('spine', (0, 0, 1.0), (0, 0, 1.36), 'hips')
bone('head', (0, 0, 1.38), (0, 0, 1.75), 'spine')
for sx, s in ((1, 'L'), (-1, 'R')):
    bone(f'upperarm.{s}', (sx * .30, 0, 1.29), (sx * .315, 0, 1.03), 'spine')
    bone(f'forearm.{s}', (sx * .315, 0, 1.03), (sx * .32, 0, .75), f'upperarm.{s}')
    bone(f'thigh.{s}', (sx * .11, 0, .82), (sx * .11, 0, .48), 'hips')
    bone(f'shin.{s}', (sx * .11, 0, .48), (sx * .11, 0, .05), f'thigh.{s}')
bpy.ops.object.mode_set(mode='OBJECT')

body.parent = arm
mdf = body.modifiers.new('Armature', 'ARMATURE'); mdf.object = arm

# ------------------------------------------------------------------ animation
BONES = ['hips', 'spine', 'head', 'upperarm.L', 'forearm.L', 'upperarm.R', 'forearm.R', 'thigh.L', 'shin.L', 'thigh.R', 'shin.R']
arm.animation_data_create()
for pb in arm.pose.bones: pb.rotation_mode = 'XYZ'


def key(frame, rot, hip=(0, 0, 0)):
    for n in BONES:
        pb = arm.pose.bones[n]
        pb.rotation_euler = tuple(R(a) for a in rot.get(n, (0, 0, 0)))
        pb.keyframe_insert('rotation_euler', frame=frame)
    hp = arm.pose.bones['hips']
    hp.location = hip
    hp.keyframe_insert('location', frame=frame)


def action(name, keys):
    a = bpy.data.actions.new(name)
    a.use_fake_user = True
    arm.animation_data.action = a
    for f, rot, *hip in keys:
        key(f, rot, hip[0] if hip else (0, 0, 0))
    tr = arm.animation_data.nla_tracks.new(); tr.name = name
    tr.strips.new(name, 1, a)
    arm.animation_data.action = None
    return a


def mirror(rot):
    out = {}
    for n, v in rot.items():
        if n.endswith('.L'): out[n[:-2] + '.R'] = (v[0], -v[1], -v[2])
        elif n.endswith('.R'): out[n[:-2] + '.L'] = (v[0], -v[1], -v[2])
        else: out[n] = (v[0], -v[1], -v[2])
    return out


# Bones point down the limbs, so +X rotation swings a limb backward; knees bend with -X on the shin... verified by render.
contact = {'spine': (-8, 0, 4), 'head': (4, 0, -3),
           'thigh.L': (-38, 0, 0), 'shin.L': (8, 0, 0), 'thigh.R': (30, 0, 0), 'shin.R': (55, 0, 0),
           'upperarm.L': (32, 0, 6), 'forearm.L': (-40, 0, 0), 'upperarm.R': (-34, 0, -6), 'forearm.R': (-55, 0, 0)}
passing = {'spine': (-8, 0, 0), 'head': (4, 0, 0),
           'thigh.L': (0, 0, 0), 'shin.L': (20, 0, 0), 'thigh.R': (-10, 0, 0), 'shin.R': (85, 0, 0),
           'upperarm.L': (4, 0, 6), 'forearm.L': (-45, 0, 0), 'upperarm.R': (-6, 0, -6), 'forearm.R': (-45, 0, 0)}
action('Run', [(1, contact, (0, -.035, 0)), (6, passing, (0, .045, 0)), (11, mirror(contact), (0, -.035, 0)),
               (16, mirror(passing), (0, .045, 0)), (21, contact, (0, -.035, 0))])

idle0 = {'spine': (0, 0, 0), 'head': (0, 0, 0), 'upperarm.L': (0, 0, 5), 'upperarm.R': (0, 0, -5), 'forearm.L': (-12, 0, 0), 'forearm.R': (-12, 0, 0), 'shin.L': (2, 0, 0), 'shin.R': (2, 0, 0)}
idle1 = {'spine': (3, 0, 0), 'head': (-4, 10, 0), 'upperarm.L': (-3, 0, 8), 'upperarm.R': (3, 0, -8), 'forearm.L': (-18, 0, 0), 'forearm.R': (-15, 0, 0), 'shin.L': (2, 0, 0), 'shin.R': (2, 0, 0)}
idle2 = {'spine': (0, 0, 0), 'head': (2, -12, 0), 'upperarm.L': (0, 0, 6), 'upperarm.R': (0, 0, -6), 'forearm.L': (-12, 0, 0), 'forearm.R': (-14, 0, 0), 'shin.L': (2, 0, 0), 'shin.R': (2, 0, 0)}
action('Idle', [(1, idle0, (0, 0, 0)), (31, idle1, (0, -.012, 0)), (61, idle2, (0, 0, 0)), (91, idle0, (0, 0, 0))])

jump = {'spine': (-12, 0, 0), 'head': (8, 0, 0),
        'thigh.L': (-60, 0, 0), 'shin.L': (80, 0, 0), 'thigh.R': (-20, 0, 0), 'shin.R': (50, 0, 0),
        'upperarm.L': (-140, 0, 20), 'forearm.L': (-20, 0, 0), 'upperarm.R': (-40, 0, -30), 'forearm.R': (-50, 0, 0)}
jump2 = dict(jump); jump2['upperarm.L'] = (-150, 0, 24); jump2['thigh.L'] = (-65, 0, 0)
action('Jump', [(1, jump), (8, jump2), (15, jump)])

fall0 = {'spine': (6, 0, 0), 'head': (-10, 0, 0),
         'thigh.L': (-20, 0, 6), 'shin.L': (35, 0, 0), 'thigh.R': (-5, 0, -6), 'shin.R': (25, 0, 0),
         'upperarm.L': (-20, 0, 75), 'forearm.L': (-30, 0, 0), 'upperarm.R': (-20, 0, -75), 'forearm.R': (-30, 0, 0)}
fall1 = {'spine': (6, 0, 0), 'head': (-6, 0, 0),
         'thigh.L': (-5, 0, 6), 'shin.L': (20, 0, 0), 'thigh.R': (-25, 0, -6), 'shin.R': (40, 0, 0),
         'upperarm.L': (-35, 0, 95), 'forearm.L': (-50, 0, 0), 'upperarm.R': (-35, 0, -95), 'forearm.R': (-50, 0, 0)}
action('Fall', [(1, fall0), (9, fall1), (17, fall0)])

hit = {'spine': (18, 0, 0), 'head': (-20, 0, 0), 'upperarm.L': (-60, 0, 40), 'upperarm.R': (-60, 0, -40),
       'forearm.L': (-70, 0, 0), 'forearm.R': (-70, 0, 0), 'thigh.L': (-15, 0, 0), 'shin.L': (30, 0, 0), 'thigh.R': (-15, 0, 0), 'shin.R': (30, 0, 0)}
action('Hit', [(1, hit), (10, hit)])

cheer = {'upperarm.L': (-170, 0, 25), 'upperarm.R': (-170, 0, -25), 'forearm.L': (-10, 0, 0), 'forearm.R': (-10, 0, 0), 'head': (-12, 0, 0), 'spine': (-5, 0, 0)}
cheer2 = dict(cheer); cheer2['upperarm.L'] = (-150, 0, 40); cheer2['upperarm.R'] = (-150, 0, -40)
action('Cheer', [(1, cheer), (8, cheer2, (0, .08, 0)), (15, cheer)])

# ------------------------------------------------------------------ export
sel(arm); body.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'player_nature.glb' if NATURE else 'player.glb'), export_format='GLB', use_selection=True,
                          export_animations=True, export_animation_mode='NLA_TRACKS', export_skins=True, export_yup=True)
print('exported player')

# ------------------------------------------------------------------ preview renders (to check poses)
if RENDER:
    bpy.ops.object.camera_add(location=(2.6, -3.2, 1.3), rotation=(R(83), 0, R(39)))
    scene.camera = act()
    bpy.ops.object.light_add(type='SUN', rotation=(R(40), R(10), R(30))); act().data.energy = 4
    scene.render.engine = 'BLENDER_WORKBENCH'
    scene.display.shading.light = 'STUDIO'; scene.display.shading.color_type = 'MATERIAL'
    scene.render.resolution_x = 360; scene.render.resolution_y = 420
    for tr in arm.animation_data.nla_tracks: tr.mute = True
    for tr in arm.animation_data.nla_tracks:
        arm.animation_data.action = bpy.data.actions[tr.name]
        for f in ((1, 6) if tr.name == 'Run' else (1,)):
            scene.frame_set(f)
            scene.render.filepath = os.path.join(OUT, f'_preview_{tr.name}_{f}.png')
            bpy.ops.render.render(write_still=True)
    print('rendered previews')
