import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
const sharp=createRequire(import.meta.url)('sharp');
const groups=[['west-marked','east-upper-marked','west-upper-marked','east-ground','west-forward','east-forward-upper'],['west-cross-range','west-cross-range-upper','west-pavilion','west-pavilion-lobby','central-room','basement-room']];
for(const mode of ['before','after'])for(const [i,names] of groups.entries()){
 const layers=[];
 for(const [n,name] of names.entries()){
  const input=await sharp(new URL(`./${mode}-${name}.png`,import.meta.url).pathname.replace(/^\/(\w:)/,'$1')).resize(640,280).png().toBuffer();
  layers.push({input,left:(n%2)*640,top:Math.floor(n/2)*310+30});
  const label=Buffer.from(`<svg width="640" height="30"><text x="12" y="22" font-size="19" font-family="Arial" fill="#253746">${mode} · ${name}</text></svg>`);
  layers.push({input:label,left:(n%2)*640,top:Math.floor(n/2)*310});
 }
 await sharp({create:{width:1280,height:930,channels:4,background:'#faf9f5'}}).composite(layers).png().toFile(new URL(`./${mode}-overview-${i+1}.png`,import.meta.url).pathname.replace(/^\/(\w:)/,'$1'));
}
