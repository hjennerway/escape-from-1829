import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const root=new URL('../../',import.meta.url),research=new URL('../../../Research/',import.meta.url);
const tests=['test-annexe-carden.mjs','test-annexe-front-link.mjs','test-annexe-kitchen.mjs','test-annexe-rear-stretch.mjs','test-annexe-rear-side-alignment.mjs','test-annexe-os-refinement.mjs','test-oakmere-court.mjs','test-oakmere-west.mjs','test-oakmere-windows.mjs','test-annexe-access.mjs'];
const resume=process.argv.includes('--resume');
// Each immutable historical comparison must first match with only this
// repair's original two builders restored. Never advance an unrelated failure.
for(const name of resume?[]:tests){
 const result=spawnSync(process.execPath,[new URL('./check-original-protected.mjs',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),name],{cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024});
 writeFileSync(new URL('original-'+name+'.log',import.meta.url),(result.stdout??'')+(result.stderr??''));
 assert.equal(result.status,0,'Original scope must match before refreshing '+name);console.log('Original protected scope matches: '+name);
}
const repairs=['test-larkton-recess.mjs','test-west-refinement.mjs','test-exterior-door-supports.mjs'];
if(resume)for(const name of [...tests,...repairs]){
 const log=readFileSync(new URL((tests.includes(name)?'original-':'')+name+'.log',import.meta.url),'utf8');
 const receipt=readFileSync(new URL('refresh-fingerprints.log',import.meta.url),'utf8');
 assert(receipt.includes((tests.includes(name)?'Original protected scope matches: ':'Current repair scope passes: ')+name)&&!log.includes('AssertionError'),'Completed scope evidence required before resume: '+name);
}
for(const name of resume?[]:repairs){
 const result=spawnSync(process.execPath,[name],{cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024});
 writeFileSync(new URL(name+'.log',import.meta.url),(result.stdout??'')+(result.stderr??''));
 assert.equal(result.status,0,'Current repair scope must pass '+name);console.log('Current repair scope passes: '+name);
}
const THREE=await import(new URL('dist/vendor/three.module.js',root));
const {createEscapeExterior}=await import(new URL('dist/escape-exterior.mjs',root));
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const a=createEscapeExterior(THREE,1.5).annexe;
const backup=new URL('./fingerprints-before/',import.meta.url);mkdirSync(backup,{recursive:true});
const records=[];
function update(file,edit){
 const url=new URL(file,research),before=readFileSync(url,'utf8'),data=JSON.parse(before);edit(data);
 if(!resume)writeFileSync(new URL(file.replaceAll('/','-'),backup),before);
 else {try{readFileSync(new URL(file.replaceAll('/','-'),backup));}catch{writeFileSync(new URL(file.replaceAll('/','-'),backup),before);}}
 writeFileSync(url,JSON.stringify(data,null,2)+'\n');records.push(file);
}
const {cardenCorrectionSnapshot}=await import(new URL('artifacts/annexe-carden-correction-scope.mjs',root));
update('carden-picton/outward-protected-geometry.json',b=>Object.assign(b,cardenCorrectionSnapshot(THREE,a,{excludeConcurrentJarman:true})));
const {cardenHeightSnapshot}=await import(new URL('artifacts/annexe-carden-height-scope.mjs',root));
update('carden-picton/height-extension-before.json',b=>{b.protected=cardenHeightSnapshot(THREE,a).protected;});
const {frontLinkSnapshot}=await import(new URL('artifacts/annexe-front-link-scope.mjs',root));
update('annexe-frontage-adjustment/front-link-before.json',b=>{const s=frontLinkSnapshot(THREE,a);b.primitives=s.primitives;b.sha256=s.sha256;});
const {protectedKitchenGeometry}=await import(new URL('artifacts/annexe-kitchen-scope.mjs',root));
update('annexe-kitchen/protected-geometry.json',b=>Object.assign(b,protectedKitchenGeometry(THREE,a)));
const {rearStretchSnapshot}=await import(new URL('artifacts/annexe-rear-stretch-scope.mjs',root));
update('annexe-kitchen/rear-stretch-before.json',b=>{b.front=rearStretchSnapshot(THREE,a).front;});
const rearSide=spawnSync(process.execPath,[new URL('./snapshot-rear-side.mjs',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')],{cwd:root,encoding:'utf8',windowsHide:true});
assert.equal(rearSide.status,0,'The historical rear-side snapshot builder must complete');
update('annexe-kitchen/side-alignment-before.json',b=>{b.snapshot=JSON.parse(rearSide.stdout);});
const {oakmereCourtProtected}=await import(new URL('artifacts/oakmere-court-scope.mjs',root));
update('oakmere/court-protected-before.json',b=>Object.assign(b,oakmereCourtProtected(THREE,a)));
const {protectedWindowGeometry}=await import(new URL('artifacts/oakmere-window-scope.mjs',root));
update('oakmere/window-protected-geometry.json',b=>Object.assign(b,protectedWindowGeometry(THREE,a)));
async function derived(file,transform){
 const url=new URL(file,root),code=transform(readFileSync(url,'utf8')).replace(/from '([^']+)'/g,(all,p)=>p.startsWith('.')?"from '"+new URL(p,url).href+"'":all).replaceAll('import.meta.url',JSON.stringify(url.href));
 return (await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))).default;
}
const west=await derived('test-oakmere-west.mjs',s=>s.split('const baseline=')[0]+'\nexport default fingerprint;');
update('oakmere/west-protected-geometry.json',b=>Object.assign(b,west));
const shape=await derived('artifacts/snapshot-annexe-shape.mjs',s=>s.split('if(process.argv.includes')[0]+'\nexport default snapshot;');
update('annexe-photo-placement/approved-shape.json',b=>Object.assign(b,shape));
const alignment=await derived('artifacts/annexe-entrance-alignment-scope.mjs',s=>s.split('const before=JSON.parse')[0]+'\nexport default protectedGeometry;');
update('annexe-frontage-adjustment/entrance-alignment-before.json',b=>{b.protectedGeometry=alignment;});
writeFileSync(new URL('fingerprints-refreshed.json',import.meta.url),JSON.stringify(records,null,2)+'\n');console.log('Refreshed '+records.length+' scoped annexe fingerprints.');
