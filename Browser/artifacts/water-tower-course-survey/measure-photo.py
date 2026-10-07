from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageDraw
def smooth(values,sigma):
    radius=int(np.ceil(3*sigma))
    x=np.arange(-radius,radius+1)
    kernel=np.exp(-.5*(x/sigma)**2);kernel/=kernel.sum()
    return np.convolve(np.pad(values,radius,mode='edge'),kernel,mode='valid')

def find_peaks(values):
    candidates=[i for i in range(3,len(values)-3) if values[i]>values[i-1] and values[i]>=values[i+1]
        and values[i]-max(min(values[i-3:i]),min(values[i+1:i+4]))>3]
    selected=[]
    for i in sorted(candidates,key=lambda i:values[i],reverse=True):
        if all(abs(i-j)>=2 for j in selected):selected.append(i)
    return np.array(sorted(selected))

root=Path(__file__).resolve().parents[3]
out=Path(__file__).resolve().parent
im=Image.open(root/'Research/water-tower/entrance-door-reference.png').convert('RGB')
pixels=np.asarray(im,dtype=float)
landmarks={'ground':885,'door_head':743,'entrance_arch_crown':690,'blocked_arch_base':671,'blocked_arch_spring':539,'blocked_arch_crown':469,'string_course':297}
summary={}
for left,right in [(261,277),(264,274),(266,272),(450,470)]:
    strip=pixels[:,left:right]
    light=strip.mean(axis=(1,2))
    signal=smooth(light,.4)-smooth(light,4)
    peaks=find_peaks(signal)
    peaks=peaks[(peaks>304)&(peaks<885)]
    counts={name:int(np.sum((peaks>y)&(peaks<landmarks['ground']))) for name,y in landmarks.items()}
    summary[f'{left}:{right}']={'counts':counts,'peaks':peaks.tolist()}
    if left==264:
        crop=im.crop((140,290,558,891)).resize((836,1202),Image.Resampling.NEAREST)
        draw=ImageDraw.Draw(crop)
        for i,y in enumerate(peaks[::-1],1):
            yy=(int(y)-290)*2
            draw.line((240,yy,268,yy),fill=(255,225,0),width=1)
            if i%5==0:draw.text((270,yy-6),str(i),fill=(255,255,0))
        crop.save(out/'photo-course-diagnostic.png')
print(json.dumps(summary,indent=2))
(out/'photo-course-detection.json').write_text(json.dumps({'landmarks':landmarks,'strips':summary},indent=2))

# Manually checked mortar lines below the upper window, including faint lines
# missed by a brightness-only detector (748, 771 and 836). Their number order
# follows the continuous brown masonry strip, not the differently bonded repair.
checked_y=np.array([885,879,873,867,860,854,848,842,836,830,824,818,812,806,800,794,788,782,776,771,765,760,754,748,743,738,732,727,722,716,711,706,700,695,690,685,680,675,670,665,660,655,651,646,641,636,631,627,622,617,613,608,603,599,594,590,586,581,577,572,568,564,560,555,551,547,543,538],dtype=float)
n=np.arange(len(checked_y))
a,b,c=np.linalg.lstsq(np.column_stack((np.ones_like(n),n,-checked_y*n)),checked_y,rcond=None)[0]
def courses_at(y):return (a-y)/(c*y-b)
fit=(a+b*n)/(1+c*n)
photo_counts={name:float(courses_at(y)) for name,y in landmarks.items()}

# Approximate shaft corners establish a plane rectification. The obscured lower
# right corner is extrapolated from its visible edge, so dimensions are estimates.
src=np.array([[251,29],[484,29],[555,887],[149,887]],dtype=float)
dst=np.array([[-5.1,33.8],[5.1,33.8],[5.1,0],[-5.1,0]],dtype=float)
rows=[];rhs=[]
for (x,y),(u,v) in zip(src,dst):
    rows.extend([[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]]);rhs.extend([u,v])
h=np.append(np.linalg.solve(np.array(rows),np.array(rhs)),1).reshape((3,3))
def rectify(points):
    p=np.column_stack((np.array(points),np.ones(len(points))))@h.T
    return p[:,:2]/p[:,2:]
door=rectify([[329,744],[376,744],[377,882],[326,882]])
width=(np.linalg.norm(door[1]-door[0])+np.linalg.norm(door[2]-door[3]))/2
height=(np.linalg.norm(door[3]-door[0])+np.linalg.norm(door[2]-door[1]))/2
measurements={'photo_course_estimates':photo_counts,'fit_max_residual_pixels':float(np.max(np.abs(fit-checked_y))),
    'checked_mortar_rows':checked_y.tolist(),'door_plane_estimate':{'width':float(width),'height':float(height),'height_width_ratio':float(height/width)},
    'photo_raw_door_ratio':138/49,'model_before':{'course_height':.1375,'door_width':1.08,'door_height':4.22,'door_height_width_ratio':4.22/1.08,
        'door_head':4.43/.1375,'entrance_arch_crown':6.205/.1375,'blocked_arch_base':7.15/.1375,'blocked_arch_spring':12/.1375,'blocked_arch_crown':13.955/.1375,'string_course':20.15/.1375}}
(out/'measurements.json').write_text(json.dumps(measurements,indent=2))
print('MEASUREMENTS '+json.dumps(measurements,indent=2))
