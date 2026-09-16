// Independent ground-level brown OS corners visible in location.png.
// Map the marked screenshot back to the estate ground plane (perspective fit).
const controls=[
  [[259,51],[253.94,-36.32]],[[368,55],[235.19,-36.32]],
  [[365,92],[235.19,-42.97]],[[287,88],[248.51,-42.97]],
  [[280,158],[248.51,-56.08]],[[338,161],[238.67,-56.08]],
  [[340,134],[238.67,-51.03]],[[368,135],[233.79,-51.03]],
  [[363,199],[233.79,-62.76]],[[243,195],[253.94,-62.76]],
  [[212,216],[258.84,-67.13]],[[249,218],[252.49,-67.13]],
  [[245,268],[252.49,-76.04]],[[207,267],[258.84,-76.04]],
  [[180,414],[260,-101.41]],[[156,642],[260,-137.55]],
  [[240,646],[247.75,-137.55]]
];
const rows=[],values=[];
for(const [[u,v],[x,z]] of controls){
  rows.push([u,v,1,0,0,0,-x*u,-x*v],[0,0,0,u,v,1,-z*u,-z*v]);values.push(x,z);
}
const matrix=Array.from({length:8},(_,i)=>Array.from({length:9},(_,j)=>rows.reduce((s,row,k)=>s+row[i]*(j===8?values[k]:row[j]),0)));
for(let i=0;i<8;i++){
  let pivot=i;for(let j=i+1;j<8;j++)if(Math.abs(matrix[j][i])>Math.abs(matrix[pivot][i]))pivot=j;
  [matrix[i],matrix[pivot]]=[matrix[pivot],matrix[i]];
  const scale=matrix[i][i];for(let j=i;j<9;j++)matrix[i][j]/=scale;
  for(let k=0;k<8;k++)if(k!==i){const factor=matrix[k][i];for(let j=i;j<9;j++)matrix[k][j]-=factor*matrix[i][j];}
}
const h=matrix.map(row=>row[8]);
const point=([u,v])=>[(h[0]*u+h[1]*v+h[2])/(h[6]*u+h[7]*v+1),(h[3]*u+h[4]*v+h[5])/(h[6]*u+h[7]*v+1)];
const yellow=[[178,398],[245,401],[235,489],[292,489],[298,403],[337,404],[332,488],[420,488],[420,428],[531,433],[529,478],[480,477],[475,556],[499,557],[501,589],[474,586],[477,619],[426,615],[429,558],[245,550],[240,646],[139,640],[143,554],[165,557]];
console.log('Fit error (scene units)',Math.sqrt(controls.reduce((s,[p,q])=>s+point(p).reduce((t,n,i)=>t+(n-q[i])**2,0),0)/controls.length));
console.log('Yellow world points',JSON.stringify(yellow.map(p=>point(p).map(n=>+n.toFixed(2)))));
console.log('Photo camera dots',JSON.stringify([[153,770],[414,708],[234,676],[318,627]].map(point)));
