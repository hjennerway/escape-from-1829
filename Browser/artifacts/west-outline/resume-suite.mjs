import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const commands=JSON.parse(await readFile(new URL('../../package.json',import.meta.url),'utf8')).scripts.test.split(' && ');
const start=commands.indexOf('node '+(process.argv[2]??'test-asylum-outside.mjs'));
if(start<0)throw Error('Outside walking check is absent from the browser suite');
for(const command of commands.slice(start)){
 const [runtime,...args]=command.split(' ');
 if(runtime!=='node')throw Error('Unexpected test runtime: '+command);
 console.log('Checking '+args.join(' '));
 const result=spawnSync(process.execPath,args,{cwd:new URL('../../',import.meta.url),windowsHide:true,stdio:'inherit'});
 if(result.status!==0)process.exit(result.status??1);
}
