from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont

out=Path(__file__).resolve().parent
measurement=json.loads((out/'measurements.json').read_text())
models=json.loads((out/'source-validation.json').read_text())['data']
photo=measurement['photo_course_estimates']
before=models['before']['features'];after=models['after']['features'];pitch=.1375
rows=[('Black door height',24,before['doorHeight']/pitch,after['doorHeight']/pitch),
      ('White door head',photo['door_head'],before['doorHead']/pitch,after['doorHead']/pitch),
      ('Entrance arch crown',photo['entrance_arch_crown'],before['entranceArchCrown']/pitch,after['entranceArchCrown']/pitch),
      ('Blocked arch crown',photo['blocked_arch_crown'],before['blockedArchCrown']/pitch,after['blockedArchCrown']/pitch),
      ('Main horizontal band',photo['string_course'],before['stringCourse']/pitch,after['stringCourse']/pitch)]
result={'course_height_in_model':pitch,'rows':[{'feature':name,'photo_estimate':p,'model_before':b,'model_after':a} for name,p,b,a in rows],
        'door_before_ratio':before['doorHeight']/before['doorWidth'],'door_after_ratio':after['doorHeight']/after['doorWidth'],
        'door_height_reduction_percent':(1-after['doorHeight']/before['doorHeight'])*100,
        'door_width_increase_percent':(after['doorWidth']/before['doorWidth']-1)*100}
(out/'course-comparison.json').write_text(json.dumps(result,indent=2))
def font(size,bold=False):return ImageFont.truetype('C:/Windows/Fonts/'+('segoeuib.ttf' if bold else 'segoeui.ttf'),size)
im=Image.new('RGB',(1280,780),'#faf9f5');d=ImageDraw.Draw(im)
d.text((35,24),'Water tower: brick-course comparison',font=font(29,True),fill='#26352d')
d.text((35,65),'Photo estimates checked against the mortar joints; model counts from geometry and texture pitch.',font=font(18),fill='#555e58')
colours=['#8c795c','#bd765d','#448572']
for i,(label,c) in enumerate(zip(['Photograph','Previous model','Revised model'],colours)):
    x=350+i*245;d.rectangle((x,102,x+16,118),fill=c);d.text((x+25,98),label,font=font(18),fill='#35433b')
for i,(name,p,b,a) in enumerate(rows):
    y=155+i*108;d.text((35,y+17),name,font=font(21,True),fill='#26352d')
    for j,(value,c) in enumerate(zip([p,b,a],colours)):
        yy=y+j*24;d.rounded_rectangle((350,yy,350+value*5,yy+16),radius=3,fill=c)
        d.text((360+value*5,yy-4),str(round(value)),font=font(18),fill='#35433b')
    d.line((35,y+86,1230,y+86),fill='#dedfd8',width=1)
d.text((35,708),'All arch and string-course levels are counted from ground. The door row measures the black leaf only.',font=font(17),fill='#555e58')
d.text((35,737),'Photograph counts are approximate (typically ±1–2 courses); perspective, repairs and faint joints limit precision.',font=font(17),fill='#555e58')
im.save(out/'course-comparison.png')

# A continuous ruler fitted through the checked courses avoids counting noise
# peaks as mortar and interpolates the few joints hidden by dark brick/repairs.
import numpy as np
ys=np.array(measurement['checked_mortar_rows']);ns=np.arange(len(ys))
a,b,c=np.linalg.lstsq(np.column_stack((np.ones_like(ns),ns,-ys*ns)),ys,rcond=None)[0]
root=out.parents[2]
photo_im=Image.open(root/'Research/water-tower/entrance-door-reference.png').convert('RGB').crop((140,290,558,891)).resize((836,1202),Image.Resampling.LANCZOS)
draw=ImageDraw.Draw(photo_im)
for n in range(1,138):
    y=(a+b*n)/(1+c*n);yy=round((y-290)*2)
    draw.line((242,yy,268,yy),fill='#ffe46d',width=1)
    if n%10==0:draw.text((272,yy-9),str(n),font=font(18,True),fill='#ffe46d',stroke_width=1,stroke_fill='#29251e')
photo_im.save(out/'photo-checked-course-ruler.png')
print(json.dumps(result,indent=2))
