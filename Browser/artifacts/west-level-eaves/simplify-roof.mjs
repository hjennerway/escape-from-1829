import {readFile,writeFile} from 'node:fs/promises';
const path=new URL('../../dist/west-cross-range-roof.mjs',import.meta.url);
let source=await readFile(path,'utf8');
function replaceSection(start,end,replacement){
 const a=source.indexOf(start),b=source.indexOf(end,a);
 if(a<0||b<0)throw Error('Missing expected roof section: '+start);
 source=source.slice(0,a)+replacement+source.slice(b);
}
replaceSection('  const wc=','  // The eastern end',`  // All circled roof-to-wall edges share the retained main wall's eave.
  // Level perimeter points remove the raised shoulders and slate wedges.
  const edge=(x,z)=>[x,WEST_RANGE_PLAN.roofEaveHeight,z];
  const wc=edge(-72.4,4.6),wf=edge(-72.4,20.9),of=edge(-63.6,20.9);
  const step0=edge(-65.6,4.6),step1=edge(-65.6,6.6),step2=edge(-61.8775,6.6);
  const cl=edge(-61.8775,4.6),cr=edge(-54.9225,4.6);
  const cls=edge(-61.8775,3.802),crs=edge(-54.9225,3.802);
  const clf=edge(-60.13875,1.39),crf=edge(-56.66125,1.39);
  const gl=edge(-55.817,13.9),gr=edge(-49.183,13.9),oge=edge(-63.6,13.9);
  const gls=edge(-55.817,15.944),grs=edge(-49.183,15.944);
  const glf=edge(-53.7305,17.96),grf=edge(-51.2695,17.96);
  const il=edge(-40.4,13.9),ir=edge(-34.6,15.5),ilf=edge(-40.4,21.6),irf=edge(-34.6,21.6);
`);
replaceSection('  const faces=[','  const lerp=',`  const faces=[
    {name:'West end continuous slate roof',polygons:[[outer[0],outer[1],wf,wc],[outer[0],wc,step0]]},
    {name:'West front outer arm slate roof',polygons:[[outer[0],oge,of,outer[1]],[outer[1],of,wf]]},
    {name:'West courtyard polygonal bay slate roof',polygons:[[court[0],court[1],cls,cl],[court[1],clf,cls],[court[1],crf,clf],[court[1],crs,crf],[court[0],cr,crs,court[1]]]},
    {name:'West curved bay slate roof',polygons:[[garden[0],gl,gls,garden[1]],[garden[1],gls,glf],[garden[1],glf,grf],[garden[1],grf,grs],[garden[0],garden[1],grs,gr]]},
    {name:'West garden inner pavilion slate roof',polygons:[[inner[0],il,ilf,inner[1]],[inner[1],ilf,irf],[inner[0],inner[1],irf,ir]]},
    {name:'West cross-range continuous roof join',polygons:[
      [outer[0],step0,step1],
      [outer[0],step1,step2,cl,court[0]],
      [court[0],cr,[-53.9,14.53,4.6],...courtSeam,end,inner[0],garden[0]],
      [outer[0],garden[0],gl],[outer[0],gl,oge],
      [garden[0],inner[0],il,gr],
      [inner[0],end,eastGarden,ir],
      ...eastSeam.slice(1).map((p,i)=>[end,eastSeam[i],p])
    ]}
  ];
`);
replaceSection('  const bayRenderVolumes=[];','  // The later blue guide','');
replaceSection('      // These four perimeter edges','      const nx=','');
replaceSection('  // Remove even concealed older slate','  // Finish the entrance slate','');
source=source.replace("    const constraints=[...(outline.height?[outline.height]:[]),...(outline.floor?[outline.floor]:[])];\n    for(let i=0;i<outline.length+constraints.length&&remainder.length>=3;i++){","    for(let i=0;i<outline.length+(outline.height?1:0)&&remainder.length>=3;i++){");
source=source.replace("const side=i>=outline.length?constraints[i-outline.length]:", "const side=i===outline.length?outline.height:");
await writeFile(path,source);
