"""Run with Blender 3.4+: blender -b --python Tools/create_level.py.
Historical spatial inspiration, deliberately fictional gameplay dimensions.
The JSON navigation grid and Blender geometry share one source of truth.
"""
import bpy, json, math, os, random
from mathutils import Vector
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
random.seed(1829)
W,H,S=41,33,2.5
grid=[[0]*W for _ in range(H)]
def carve(x0,z0,x1,z1):
    for z in range(z0,z1+1):
        for x in range(x0,x1+1): grid[z][x]=1
# Transverse gallery, paired longitudinal wings and central administration.
carve(5,15,35,17)
for a in (6,30):
    carve(a,4,a+4,28)
    # Room partitions leave the main longitudinal corridor open.
    for z in (8,12,20,24):
        grid[z][a]=grid[z][a+1]=grid[z][a+3]=grid[z][a+4]=0
carve(18,10,22,25)
carve(15,20,25,22)
# Mirrored approaches branch north from the gallery on either side of Reception.
# Lengths are gameplay approximations, not surveyed dimensions.
for x in (14,26): carve(x,12,x,14)
# Five escape vestibules, all linked to the same navigable component.
exits=[dict(x=8,z=4,name='WEST GARDEN'),dict(x=32,z=4,name='EAST GARDEN'),
       dict(x=8,z=28,name='WEST COURT'),dict(x=32,z=28,name='EAST COURT'),
       dict(x=20,z=25,name='MAIN PORTICO')]
spawn=dict(x=20,z=11)
stairs=[dict(x=14,z=12,name='LEFT RECEPTION STAIR',direction='UP',mirror=1,source='Uploaded footage; left-of-reception location confirmed by user'),
        dict(x=26,z=12,name='RIGHT RECEPTION STAIR',direction='UP',mirror=-1,source='Mirrored at user request')]
data=dict(width=W,height=H,cellSize=S,cells=[v for row in grid for v in row],exits=exits,spawn=spawn,stairs=stairs)
data['geometrySource']='layout'
os.makedirs(os.path.join(ROOT,'Assets','Resources'),exist_ok=True)
with open(os.path.join(ROOT,'Assets','Resources','layout.json'),'w') as f: json.dump(data,f,indent=2)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
materials={}
palette={'Plaster':(.40,.43,.38,1),'Panel':(.095,.17,.155,1),'Stone':(.28,.27,.23,1),
         'Floor':(.19,.16,.12,1),'Brass':(.46,.32,.12,1),'Ceiling':(.29,.30,.27,1),
         'Darkwood':(.075,.052,.033,1),'Glass':(.13,.29,.32,1),'Exit':(.08,.65,.36,1)}
for name,c in palette.items():
    m=bpy.data.materials.new(name); m.diffuse_color=c; m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value=c
    bs.inputs['Roughness'].default_value=.72
    materials[name]=m
def box(name,x,y,z,sx,sy,sz,mat):
    # Input coordinates are Unity x/up/z; Blender is x/-z/up.
    bpy.ops.mesh.primitive_cube_add(size=1,location=(x,-z,y))
    o=bpy.context.object; o.name=name; o.dimensions=(sx,sz,sy)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(materials[mat]); return o
for z in range(H):
    for x in range(W):
        if not grid[z][x]: continue
        px,pz=x*S,z*S
        box('Floor',px,-.12,pz,S,.24,S,'Floor' if (x+z)%2 else 'Stone')
        box('Ceiling',px,3.55,pz,S,.15,S,'Ceiling')
        for dx,dz in ((1,0),(-1,0),(0,1),(0,-1)):
            if 0<=x+dx<W and 0<=z+dz<H and grid[z+dz][x+dx]: continue
            wx,wz=px+dx*S/2,pz+dz*S/2
            sx,sz=(.16,S) if dx else (S,.16)
            box('Wall',wx,1.8,wz,sx,3.6,sz,'Plaster')
            box('Wainscot',wx-dx*.10,.63,wz-dz*.10,sx,.98,sz,'Panel')
            box('Dado',wx-dx*.12,1.18,wz-dz*.12,sx+.06,.07,sz+.06,'Brass')
            box('Skirting',wx-dx*.12,.12,wz-dz*.12,sx+.06,.15,sz+.06,'Darkwood')
            # Decorative blind sash windows, no collision intrusion.
            if (x+z)%3==0:
                box('SashWindow',wx-dx*.13,2.36,wz-dz*.13,.09 if dx else 1.15,1.28,1.15 if dx else .09,'Glass')
                box('SashBar',wx-dx*.19,2.36,wz-dz*.19,.07 if dx else 1.2,.045,1.2 if dx else .07,'Brass')
        if z==16 and x%4==0:
            box('GalleryBeam',px,3.33,pz,.20,.24,7.5,'Darkwood')
for e in exits:
    z=e['z']*S+(-.7 if e['z']==4 else .7)
    box('ExitDoor',e['x']*S,1.25,z,1.7,2.5,.14,'Panel')
    box('PushBar',e['x']*S,1.05,z+(-.1 if e['z']>4 else .1),1.3,.08,.08,'Brass')
# Bevel all architectural meshes for readable highlights, join by material.
for mat in palette:
    bpy.ops.object.select_all(action='DESELECT')
    obs=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.data.materials[0].name==mat]
    if not obs: continue
    for o in obs: o.select_set(True)
    bpy.context.view_layer.objects.active=obs[0]; bpy.ops.object.join()
    obs[0].name=mat
    bevel=obs[0].modifiers.new('Soft masonry edges','BEVEL'); bevel.width=.025; bevel.segments=1
    bpy.ops.object.modifier_apply(modifier=bevel.name)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'Art','1829-Level.blend'))
bpy.ops.export_scene.fbx(filepath=os.path.join(ROOT,'Assets','Resources','1829-Level.fbx'),use_selection=False,object_types={'MESH'},axis_forward='-Z',axis_up='Y',add_leaf_bones=False)
# A cutaway overview for review; the saved source and exported FBX retain ceilings.
for o in bpy.context.scene.objects:
    if o.name=='Ceiling': o.hide_render=True
bpy.ops.object.camera_add(location=(110,-110,120))
cam=bpy.context.object; target=Vector((50,-40,0)); cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.type='ORTHO'; cam.data.ortho_scale=126; bpy.context.scene.camera=cam
bpy.ops.object.light_add(type='AREA',location=(45,-30,90)); bpy.context.object.data.energy=80000; bpy.context.object.data.size=90
scene=bpy.context.scene; scene.render.engine='BLENDER_EEVEE'; scene.eevee.use_gtao=True
scene.world.color=(.25,.25,.25); scene.render.resolution_x=1400; scene.render.resolution_y=1000; scene.render.resolution_percentage=100
scene.render.filepath=os.path.join(ROOT,'Art','level-overview.png'); bpy.ops.render.render(write_still=True)
print('LEVEL_GENERATED: %d walkable cells, five exits'%sum(data['cells']))
