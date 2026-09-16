import {readFileSync,writeFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('annexe-fit-data.json',import.meta.url))),H=JSON.parse(readFileSync(new URL('photo-ground-fit.json',import.meta.url))).matrix;
const src=readFileSync(new URL('../../Research/annexe-photo-placement/aerial.png',import.meta.url)).toString('base64');
const project=([x,z])=>{const d=H[2][0]*x+H[2][1]*z+H[2][2];return [(H[0][0]*x+H[0][1]*z+H[0][2])/d,(H[1][0]*x+H[1][1]*z+H[1][2])/d-23];};
const c=Math.cos(data.original.rotation),s=Math.sin(data.original.rotation);
for(const [label,x,z,scale] of [['a',376,-5,.62],['b',392,-6,.64],['c',410,-12,.66]]){
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1320" height="570" viewBox="750 600 880 380"><image href="data:image/png;base64,${src}" width="1631" height="918"/>`;
 for(const r of data.ranges){const points=r.points.map(([u,v])=>project([x+scale*(c*u+s*v),z+scale*(-s*u+c*v)]));svg+=`<polygon points="${points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${/Central hall|Entrance range|front pavilion/.test(r.name)?'#5fefff':'#fe7'}" stroke-width="1.3"/>`;}
 svg+=`<text x="780" y="950" font-family="Arial" font-size="15">${label} root ${x},${z} scale ${scale} — approximate ground-plane projection with eaves offset</text></svg>`;
 writeFileSync(new URL('annexe-photo-overlay-'+label+'.svg',import.meta.url),svg);
}
