import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const browser=fileURLToPath(new URL('../../',import.meta.url));
const tests=JSON.parse(readFileSync(new URL('tail/results.json',import.meta.url))).filter(t=>!t.passed&&t.name!=='test-aerial-layouts.mjs');
const report=[];
for(const mode of ['current','without-pipes'])for(const {name} of tests){
 const target=name==='test-larkton.mjs'?'artifacts/check-larkton-original.mjs':name;
 const args=['--import',new URL('capture-snapshot-mismatches.mjs',import.meta.url).href];
 if(mode==='without-pipes')args.push('--import',new URL('without-pipe-clearance.mjs',import.meta.url).href);
 if(name==='test-larkton.mjs')args.push('--import',new URL('../larkton-original-entrance-loader.mjs',import.meta.url).href);
 if(name==='test-annexe-rear-side-alignment.mjs')args.push('--import',new URL('../rear-side-original-east-loader.mjs',import.meta.url).href);
 const out=new URL(`${mode}-${name}.json`,import.meta.url);
 const result=spawnSync(process.execPath,[...args,target,...(name==='test-annexe-rear-side-alignment.mjs'?['--original-east']:[])],{cwd:browser,encoding:'utf8',windowsHide:true,env:{...process.env,SNAPSHOT_AUDIT_OUTPUT:fileURLToPath(out)},maxBuffer:8*1024*1024});
 writeFileSync(new URL(`${mode}-${name}.log`,import.meta.url),result.stdout+result.stderr);
 const audit=JSON.parse(readFileSync(out));report.push({mode,name,...audit});
 console.log(mode,name,'remaining failures',result.status,'snapshot mismatches',audit.failures.length);
}
writeFileSync(new URL('snapshot-mismatch-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
