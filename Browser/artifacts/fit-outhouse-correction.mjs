import {writeFileSync} from 'node:fs';
const points=[[-.2,3.33,-2.77],[8.3,3.33,-2.77],[8.3,5.88,0],[8.3,3.33,2.77],[-.2,3.33,2.77],[-.2,5.88,0],[0,0,-2.55],[0,0,2.55]];
const pixels=[[430,281],[454,205],[497,193],[522,225],[504,301],[476,270],[425,304],[495,327]];
function solve(a,b){a=a.map((r,i)=>[...r,b[i]]);for(let k=0;k<b.length;k++){let p=k;for(let i=k+1;i<b.length;i++)if(Math.abs(a[i][k])>Math.abs(a[p][k]))p=i;[a[k],a[p]]=[a[p],a[k]];const d=a[k][k];for(let j=k;j<=b.length;j++)a[k][j]/=d;for(let i=0;i<b.length;i++)if(i!==k){const t=a[i][k];for(let j=k;j<=b.length;j++)a[i][j]-=t*a[k][j];}}return a.map(r=>r[b.length]);}
const a=[],b=[];for(let i=0;i<points.length;i++){const [x,y,z]=points[i],[u,v]=pixels[i];a.push([x,y,z,1,0,0,0,0,-u*x,-u*y,-u*z],[0,0,0,0,x,y,z,1,-v*x,-v*y,-v*z]);b.push(u,v);}
const normal=Array.from({length:11},(_,i)=>Array.from({length:11},(_,j)=>a.reduce((s,r)=>s+r[i]*r[j],0)));
const p=[...solve(normal,Array.from({length:11},(_,i)=>a.reduce((s,r,n)=>s+r[i]*b[n],0))),1];
const project=([x,y,z])=>{const d=p[8]*x+p[9]*y+p[10]*z+1;return [(p[0]*x+p[1]*y+p[2]*z+p[3])/d,(p[4]*x+p[5]*y+p[6]*z+p[7])/d];};
const ground=([u,v])=>solve([[p[0]-u*p[8],p[2]-u*p[10]],[p[4]-v*p[8],p[6]-v*p[10]]],[u-p[3],v-p[7]]);
const targetLocal=ground([326,210]),reference={x:64.5,z:110.5,rotation:.1};
const c=Math.cos(.1),s=Math.sin(.1),centre=[reference.x+c*targetLocal[0]+s*targetLocal[1],reference.z-s*targetLocal[0]+c*targetLocal[1]];
const origin=[centre[0]-c*4.05,centre[1]+s*4.05];
const result={referencePlacement:reference,projection:p,points,pixels,residuals:points.map((q,i)=>project(q).map((n,k)=>n-pixels[i][k])),targetLocal,targetCentre:centre,targetOrigin:origin};
writeFileSync(new URL('../../Research/outhouse/correction-fit.json',import.meta.url),JSON.stringify(result,null,2));console.log(result);
