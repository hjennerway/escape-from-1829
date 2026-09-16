// Brown OS ground corners in img1.png, independent of the blue correction.
const controls=[
 [[567,151],[155.31,-89.11]],[[673,147],[124.92,-89.11]],
 [[674,179],[124.92,-99.7]],[[638,181],[135.56,-99.7]],
 [[638,198],[135.56,-105.25]],[[567,201],[155.31,-105.25]],
 [[575,222],[153.5,-111.71]],[[687,216],[121.86,-111.71]],
 [[575,236],[153.5,-116.25]],[[627,280],[139.23,-130.53]],
 [[656,278],[131.42,-130.53]],[[656,262],[131.42,-125.33]],
 [[690,261],[121.86,-125.33]],[[554,145],[159.04,-87.29]],
 [[360,153],[214.41,-87.29]],[[557,356],[159.04,-151.09]],
 [[426,469],[194.34,-181.24]],[[465,467],[184.43,-181.24]]
];
const rows=[],values=[];
for(const [[u,v],[x,z]] of controls){rows.push([u,v,1,0,0,0,-x*u,-x*v],[0,0,0,u,v,1,-z*u,-z*v]);values.push(x,z);}
const matrix=Array.from({length:8},(_,i)=>Array.from({length:9},(_,j)=>rows.reduce((s,row,k)=>s+row[i]*(j===8?values[k]:row[j]),0)));
for(let i=0;i<8;i++){
 let pivot=i;for(let j=i+1;j<8;j++)if(Math.abs(matrix[j][i])>Math.abs(matrix[pivot][i]))pivot=j;
 [matrix[i],matrix[pivot]]=[matrix[pivot],matrix[i]];
 const scale=matrix[i][i];for(let j=i;j<9;j++)matrix[i][j]/=scale;
 for(let k=0;k<8;k++)if(k!==i){const factor=matrix[k][i];for(let j=i;j<9;j++)matrix[k][j]-=factor*matrix[i][j];}
}
const h=matrix.map(row=>row[8]);
const point=([u,v])=>[(h[0]*u+h[1]*v+h[2])/(h[6]*u+h[7]*v+1),(h[3]*u+h[4]*v+h[5])/(h[6]*u+h[7]*v+1)];
const blue=[[428,327],[457,326],[457,366],[502,363],[502,346],[498,346],[498,320],[527,319],[527,346],[519,346],[519,361],[558,356],[558,340],[594,340],[597,452],[564,452],[564,388],[465,393],[466,467],[426,469],[427,394],[412,395],[414,371],[428,370]];
console.log('Fit RMS (scene units)',Math.sqrt(controls.reduce((s,[p,q])=>s+point(p).reduce((t,n,i)=>t+(n-q[i])**2,0),0)/controls.length));
console.log('Blue world points',JSON.stringify(blue.map(p=>point(p).map(n=>+n.toFixed(2)))));
