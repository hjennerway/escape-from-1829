import json, math
from PIL import Image, ImageDraw
import numpy as np
root='Research/historic-footprints/'
im=Image.open(root+'clean.png').convert('RGB')
a=np.asarray(im).mean(axis=2)
# Trace the dark masonry, restricting selection to the user's blue area.
blue=[[65,151],[94,138],[132,135],[151,141],[166,157],[174,178],[175,197],[181,208],[176,221],[160,233],[153,259],[145,287],[139,303],[124,319],[124,333],[139,357],[148,376],[143,386],[125,394],[111,389],[102,371],[92,349],[81,323],[66,302],[49,290],[44,267],[46,232],[47,207],[54,173]]
mask=Image.new('L',im.size);ImageDraw.Draw(mask).polygon([tuple(p) for p in blue],fill=255)
b=(a<125)
# A 2x2 opening removes map text/tree specks while keeping narrow wall ranges.
erode=b.copy()
erode[:-1,:-1]=b[:-1,:-1]&b[1:,:-1]&b[:-1,1:]&b[1:,1:]
opened=erode.copy();opened[1:,:]|=erode[:-1,:];opened[:,1:]|=erode[:,:-1];opened[1:,1:]|=erode[:-1,:-1]
seen=set();components=[]
for y,x in zip(*np.where(opened)):
 if (x,y) in seen: continue
 stack=[(int(x),int(y))];seen.add((x,y));part=[]
 while stack:
  q=stack.pop();part.append(q)
  for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)]:
   nx,ny=q[0]+dx,q[1]+dy
   if 0<=nx<im.width and 0<=ny<im.height and opened[ny,nx] and (nx,ny) not in seen:seen.add((nx,ny));stack.append((nx,ny))
 if len(part)>=24 and any(np.asarray(mask)[y,x]>0 for x,y in part):components.append(part)
# Directed pixel edges yield outer contours and courtyard holes.
def simplify(points,tolerance=1):
 def distance(p,a,b):
  dx,dy=b[0]-a[0],b[1]-a[1];t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy))) if dx or dy else 0
  return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)
 if len(points)<3:return points
 dist,i=max((distance(points[i],points[0],points[-1]),i) for i in range(1,len(points)-1))
 return simplify(points[:i+1],tolerance)[:-1]+simplify(points[i:],tolerance) if dist>tolerance else [points[0],points[-1]]
def straighten(points):
 # Work in the registered estate axes; snap wall directions in 45-degree steps.
 # A least-squares projection fits all corners together so closed contours stay
 # closed, rather than accumulating drift by snapping one edge at a time.
 a,b=-.6013081600905106,-1.285207184273794
 transform=np.array([[a,b],[-b,a]])
 original=np.asarray(points,dtype=float)@transform.T
 n=len(original);constraints=np.zeros((n,n*2))
 for i in range(n):
  j=(i+1)%n;delta=original[j]-original[i]
  angle=round(math.atan2(delta[1],delta[0])/(math.pi/4))*(math.pi/4)
  normal=np.array([-math.sin(angle),math.cos(angle)])
  constraints[i,i*2:i*2+2]=-normal;constraints[i,j*2:j*2+2]=normal
 flat=original.reshape(-1)
 fitted=(flat-constraints.T@np.linalg.lstsq(constraints@constraints.T,constraints@flat,rcond=None)[0]).reshape(-1,2)
 # Remove collapsed corners and redundant points along straight walls.
 result=[p for p in fitted]
 changed=True
 while changed and len(result)>3:
  changed=False
  for i in range(len(result)):
   prev=result[i-1];cur=result[i];nxt=result[(i+1)%len(result)]
   v=cur-prev;w=nxt-cur
   if np.linalg.norm(v)<1e-6 or (abs(float(v[0]*w[1]-v[1]*w[0]))<1e-6 and np.dot(v,w)>=0):
    result.pop(i);changed=True;break
 return (np.asarray(result)@np.linalg.inv(transform).T).tolist()

records=[]
for part in components:
 cells=set(part);edges={}
 for x,y in part:
  for neighbor,start,end in [((x,y-1),(x,y),(x+1,y)),((x+1,y),(x+1,y),(x+1,y+1)),((x,y+1),(x+1,y+1),(x,y+1)),((x-1,y),(x,y+1),(x,y))]:
   if neighbor not in cells:edges.setdefault(start,[]).append(end)
 loops=[]
 while edges:
  start=next(iter(edges));loop=[start];p=start
  while True:
   ends=edges[p];q=ends.pop()
   if not ends:del edges[p]
   loop.append(q);p=q
   if p==start:break
  if len(loop)>8:loops.append(straighten(simplify(loop,1.65)[:-1]))
 records.append({'pixelArea':len(part),'loops':loops})
records.sort(key=lambda r:min(p[1] for loop in r['loops'] for p in loop))
Path=__import__('pathlib').Path
Path('Browser/dist/historic-footprint-data.mjs').write_text('// OS masonry regularized to 90/45-degree estate axes; see Tools/trace_historic_footprints.py.\nexport const OS_BLUE_REGION='+json.dumps(blue)+';\nexport const OS_FOOTPRINTS='+json.dumps(records)+';\n',encoding='utf-8')
json.dump({'blue':blue,'footprints':records},open(root+'traced-pixels.json','w'),indent=2)
# Review the extraction on the original reference; annotations are QA only.
review=im.resize((864,1203));draw=ImageDraw.Draw(review)
for i,r in enumerate(records):
 for loop in r['loops']:
  draw.line([(x*3,y*3) for x,y in loop+[loop[0]]],fill=(215,70,10),width=3)
 p=r['loops'][0][0];draw.text((p[0]*3,p[1]*3),str(i+1),fill=(0,80,255),stroke_width=1,stroke_fill='white')
review.save(root+'trace-review.jpg',quality=90)
print([(i+1,r['pixelArea'],[len(loop) for loop in r['loops']]) for i,r in enumerate(records)])
