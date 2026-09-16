import numpy as np, json
# Ground-plane estimates; roof tops are deliberately excluded.
picks=[
 ('Main west pavilion',[167.25,38.6],[668,614]),
 ('Main east pavilion',[225.75,40.2],[797,650]),
 ('Water tower base',[148,-55.2],[817,492]),
 ('Chimney base',[177.5,-35.5],[846,533]),
 ('Church centre',[-4.9,-119.2],[526,317]),
 ('1829 front entrance',[0,19.5],[338,499])]
a=[];b=[]
for _,(x,z),(u,v) in picks:
 a.extend([[x,z,1,0,0,0,-u*x,-u*z],[0,0,0,x,z,1,-v*x,-v*z]])
 b.extend([u,v])
h=np.append(np.linalg.lstsq(a,b,rcond=None)[0],1).reshape(3,3)
def project(x,z):
 p=h@np.array([x,z,1]);return (p[:2]/p[2]).tolist()
print('Ground control residuals',[(name,project(*p),q) for name,p,q in picks])
print('Annexe centres',[(p,project(*p)) for p in [[368.37,-7.91],[425,-21],[434,-19]]])
json.dump({'landmarks':picks,'matrix':h.tolist(),'annexe':project(425,-21)},open('Browser/artifacts/photo-ground-fit.json','w'),indent=2)
