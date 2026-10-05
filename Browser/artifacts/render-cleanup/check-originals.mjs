import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
for(const [kind,test,message] of [['bands','test-facade-courses','ends flush'],['corners','test-front-inside-corners','cannot compete']]){
 const result=spawnSync(process.execPath,['--import','./artifacts/render-cleanup/original-loader.mjs',test+'.mjs'],{cwd:new URL('../../',import.meta.url),env:{...process.env,ORIGINAL_DETAIL:kind},encoding:'utf8',windowsHide:true});
 const output=result.stdout+result.stderr;writeFileSync(new URL('original-'+kind+'.log',import.meta.url),output);
 if(result.status===0||!output.includes(message))throw Error('Original '+kind+' did not fail the intended regression: '+output);
 console.log('Confirmed original '+kind+' fails its new regression.');
}
