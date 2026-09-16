const pairs=[[[210,289],[175,-238]],[[629,437],[270,-132]],[[708,282],[325,-176]],[[1435,21],[625,-183]]];
const rows=[];for(const [[u,v],[x,z]] of pairs){rows.push([u,v,1,0,0,0,-x*u,-x*v,x]);rows.push([0,0,0,u,v,1,-z*u,-z*v,z]);}
for(let i=0;i<8;i++){let k=i;for(let j=i+1;j<8;j++)if(Math.abs(rows[j][i])>Math.abs(rows[k][i]))k=j;[rows[i],rows[k]]=[rows[k],rows[i]];const d=rows[i][i];rows[i]=rows[i].map(x=>x/d);for(let j=0;j<8;j++)if(j!==i){const q=rows[j][i];rows[j]=rows[j].map((x,k)=>x-q*rows[i][k]);}}
const h=rows.map(r=>r[8]);const map=([u,v])=>[(h[0]*u+h[1]*v+h[2])/(h[6]*u+h[7]*v+1),(h[3]*u+h[4]*v+h[5])/(h[6]*u+h[7]*v+1)];
for(const p of [[984,161],[166,302],[290,351],[458,427],[654,475],[720,463],[884,429],[926,406],[1258,179],[1340,179],[1410,192],[1483,217],[1543,232],[822,461],[887,479],[898,499]])console.log(p,map(p).map(n=>+n.toFixed(2)));
