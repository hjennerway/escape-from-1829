import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const {scripts}=JSON.parse(await readFile(new URL('../../package.json',import.meta.url)));
const commands=scripts.test.split(/\s*&&\s*/),begin=commands.indexOf('node test-tower-workshops.mjs');
if(begin<0)throw Error('Workshop checkpoint missing');
for(const command of commands.slice(begin)){
 if(!/^node [\w.-]+\.mjs(?: --[\w-]+)?$/.test(command))throw Error('Unexpected test command: '+command);
 console.log('CHECK: '+command);
 const result=spawnSync(process.execPath,command.slice(5).split(' '),{stdio:'inherit',windowsHide:true});
 if(result.status!==0)process.exit(result.status??1);
}
console.log('PASS: remaining npm test checks after the workshop checkpoint.');
