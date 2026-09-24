import {ANNEXE_ACCESS as a} from '../dist/annexe-access.mjs';
const from=[[436,193],[614,270],[123,347],[446,515]],to=[[a.centreX-a.forecourtWidth/2,64],[a.centreX+a.forecourtWidth/2,64],[-34.095845114838895,109.59217419127062],[19.40084716480514,109.59217419127032]];
const m=[];for(let i=0;i<4;i++){const [x,y]=from[i],[u,v]=to[i];m.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);}
for(let c=0;c<8;c++){let p=c;for(let r=c+1;r<8;r++)if(Math.abs(m[r][c])>Math.abs(m[p][c]))p=r;[m[p],m[c]]=[m[c],m[p]];const d=m[c][c];m[c]=m[c].map(n=>n/d);for(let r=0;r<8;r++)if(r!==c){const q=m[r][c];m[r]=m[r].map((v,k)=>v-q*m[c][k]);}}
const h=m.map(r=>r[8]);for(const [name,x,y] of [['red-left',472,128],['red-right',673,209],['blue-left',293,550],['blue-right',590,587]]){const d=h[6]*x+h[7]*y+1;console.log(name,[(h[0]*x+h[1]*y+h[2])/d,(h[3]*x+h[4]*y+h[5])/d]);}
