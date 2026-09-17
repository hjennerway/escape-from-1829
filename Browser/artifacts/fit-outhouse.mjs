import {writeFileSync} from 'node:fs';
// Shop roof corners and its road-facing wall base register the supplied crop.
const world=[[101.7,4.43,27.7],[116.9,4.43,27.7],[116.9,4.43,57.1],[101.7,4.43,57.1],[102,0,56.8],[116.6,0,56.8]];
const pixels=[[330,59],[392,35],[495,83],[432,112],[432,137],[495,111]];
function solve(a,b){a=a.map((r,i)=>[...r,b[i]]);for(let k=0;k<b.length;k++){let p=k;for(let i=k+1;i<b.length;i++)if(Math.abs(a[i][k])>Math.abs(a[p][k]))p=i;[a[k],a[p]]=[a[p],a[k]];const d=a[k][k];for(let j=k;j<=b.length;j++)a[k][j]/=d;for(let i=0;i<b.length;i++)if(i!==k){const t=a[i][k];for(let j=k;j<=b.length;j++)a[i][j]-=t*a[k][j];}}return a.map(r=>r[b.length]);}
const rows=world.map(p=>[...p,1]),a=Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>rows.reduce((s,r)=>s+r[i]*r[j],0)));
const fit=[0,1].map(axis=>solve(a,Array.from({length:4},(_,i)=>rows.reduce((s,r,n)=>s+r[i]*pixels[n][axis],0))));
const hRows=[],hValues=[];
for(let i=0;i<4;i++){const [x,,z]=world[i],[u,v]=pixels[i];hRows.push([x,z,1,0,0,0,-u*x,-u*z],[0,0,0,x,z,1,-v*x,-v*z]);hValues.push(u,v);}
const h=[...solve(hRows,hValues),1],verticalRows=[],verticalValues=[];
for(let i=4;i<6;i++){const [x,,z]=world[i],[u,v]=pixels[i],d=h[6]*x+h[7]*z+1;verticalRows.push([4.43,0,-4.43*u],[0,4.43,-4.43*v]);verticalValues.push(h[0]*x+h[1]*z+h[2]-u*d,h[3]*x+h[4]*z+h[5]-v*d);}
const normal=Array.from({length:3},(_,i)=>Array.from({length:3},(_,j)=>verticalRows.reduce((s,r)=>s+r[i]*r[j],0))),vertical=solve(normal,Array.from({length:3},(_,i)=>verticalRows.reduce((s,r,n)=>s+r[i]*verticalValues[n],0)));
const hg=[...h];for(let i=0;i<3;i++)hg[i*3+2]-=vertical[i]*4.43;
const ground=([u,v])=>solve([[hg[0]-u*hg[6],hg[1]-u*hg[7]],[hg[3]-v*hg[6],hg[4]-v*hg[7]]],[u*hg[8]-hg[2],v*hg[8]-hg[5]]);
const marks=Object.fromEntries(Object.entries({circle:[486,301],front:[468,312],rear:[500,288],purple:[426,341],blue:[440,283],yellow:[488,374],junction:[473,211]}).map(([k,p])=>[k,ground(p)]));
const result={method:'Approximate projective ground fit of the fixed Hospital Shop to the location crop',worldPoints:world,imagePoints:pixels,affine:fit,groundHomography:hg,marks};
writeFileSync(new URL('../../Research/outhouse/location-fit.json',import.meta.url),JSON.stringify(result,null,2));console.log(result);
