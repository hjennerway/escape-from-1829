import bpy,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT,'Art','1829-Level.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'Browser','dist','level.glb'),export_format='GLB',export_yup=True)
print('WEB_MODEL_EXPORTED')
