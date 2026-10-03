"""GPL-3.0: tessellate the unchanged Panca_50 STEP assembly for the browser.

Run with FreeCAD's Python: python Browser/convert-panca.py
Original CAD and licence: Research/room-furnishings/sources/medieval_furniture.
"""
from pathlib import Path
import json, math, struct, zipfile
import FreeCAD, Part

root = Path(__file__).resolve().parent
source = root.parent / 'Research/room-furnishings/sources/medieval_furniture/stp_files/Panca_50.stp'
shape = Part.Shape()
shape.read(str(source))
box = shape.BoundBox
centre_x, centre_y = (box.XMin + box.XMax) / 2, (box.YMin + box.YMax) / 2
positions, normals, colours = [], [], []
for solid_index, solid in enumerate(shape.Solids):
    vertices, triangles = solid.tessellate(0.5)
    points = [((p.x-centre_x)/1000, (p.z-box.ZMin)/1000, -(p.y-centre_y)/1000) for p in vertices]
    for face in triangles:
        a,b,c = [points[i] for i in face]
        u,v = [b[i]-a[i] for i in range(3)], [c[i]-a[i] for i in range(3)]
        n = (u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])
        length = math.sqrt(sum(t*t for t in n))
        if length < 1e-12: continue
        for p in (a,b,c):
            positions.extend(p); normals.extend(t/length for t in n)
            shade = [0.76,0.89,0.82,0.82,0.67,0.67][solid_index]
            colours.extend((shade,shade,shade))
arrays = [positions,normals,colours]
payload = b''.join(struct.pack('<%sf'%len(a),*a) for a in arrays)
count = len(positions)//3
views,accessors,offset = [],[],0
for i,a in enumerate(arrays):
    views.append({'buffer':0,'byteOffset':offset,'byteLength':len(a)*4,'target':34962})
    accessor = {'bufferView':i,'componentType':5126,'count':count,'type':'VEC3'}
    if i==0:
        accessor['min'] = [min(positions[j::3]) for j in range(3)]
        accessor['max'] = [max(positions[j::3]) for j in range(3)]
    accessors.append(accessor); offset += len(a)*4
gltf = {'asset':{'version':'2.0','generator':'FreeCAD Panca STEP tessellation; GPL-3.0'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0,'name':'Panca_50 six-solid STEP assembly'}],
        'buffers':[{'uri':'panca_50.bin','byteLength':len(payload)}],'bufferViews':views,'accessors':accessors,
        'materials':[{'name':'Panca wood','pbrMetallicRoughness':{'baseColorFactor':[1,1,1,1],'metallicFactor':0,'roughnessFactor':.96}}],
        'meshes':[{'primitives':[{'attributes':{'POSITION':0,'NORMAL':1,'COLOR_0':2},'material':0}]}],
        'extras':{'license':'GPL-3.0','source':'https://github.com/Compagnia-d-Arme-del-Santo-Luca/medieval_furniture/blob/081fd0bc28486aff01fa4dde2d64227809a7ac01/stp_files/Panca_50.stp','millimetresToMetres':True,'solidCount':len(shape.Solids)}}
destination = root/'dist/models/furniture'
destination.mkdir(parents=True,exist_ok=True)
(destination/'panca_50.bin').write_bytes(payload)
(destination/'panca_50.gltf').write_text(json.dumps(gltf,separators=(',',':'))+'\n',encoding='utf-8')
with zipfile.ZipFile(destination/'panca-source.zip','w',compression=zipfile.ZIP_DEFLATED) as archive:
    for name,data in [('Panca_50.stp',source.read_bytes()),('convert-panca.py',Path(__file__).read_bytes()),('LICENSE',(source.parent.parent/'LICENSE').read_bytes())]:
        entry=zipfile.ZipInfo(name,date_time=(1980,1,1,0,0,0));entry.compress_type=zipfile.ZIP_DEFLATED;archive.writestr(entry,data)
print(f'Converted the Panca assembly: {len(shape.Solids)} solids, {count//3} triangles, {len(payload)} bytes; 0.40 x 0.30 x 0.45 metres.')
