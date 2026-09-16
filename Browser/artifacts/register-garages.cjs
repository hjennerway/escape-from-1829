const pairs=[[[106,350],[102,56.8]],[[674,198],[198,38.7]],[[1070,400],[241.1983,98.1807]]];
const rows=pairs.map(([[u,v],[x,z]])=>[u,v,1,x,z]);for(let i=0;i<3;i++){const d=rows[i][i];rows[i]=rows[i].map(x=>x/d);for(let j=0;j<3;j++)if(j!==i){const q=rows[j][i];rows[j]=rows[j].map((x,k)=>x-q*rows[i][k]);}}
const map=([u,v])=>[3,4].map(i=>rows[0][i]*u+rows[1][i]*v+rows[2][i]);for(const p of [[678,450],[1020,436],[684,510],[1020,500],[558,480],[632,480],[558,540],[632,540],[1000,387],[720,402],[478,229],[698,305]])console.log(p,map(p).map(n=>+n.toFixed(2)));
