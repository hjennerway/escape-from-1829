import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('../../',import.meta.url)),folder=new URL('./',import.meta.url);
const options={cwd,windowsHide:true,env:{...process.env,NODE_OPTIONS:'--import='+new URL('isolate-output.mjs',folder).href}};
const run=(args)=>new Promise((resolve,reject)=>{
 const child=spawn(process.execPath,args,options);let output='';
 child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
 child.once('error',reject);child.once('exit',code=>resolve({code,output}));
});
const npm=await run(['C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js','test']);
await writeFile(new URL('npm-test.log',folder),npm.output);
console.log('npm test exit: '+npm.code);
const commands=JSON.parse(await readFile(new URL('../../package.json',folder),'utf8')).scripts.test.split(' && ');
const failures=[...npm.output.matchAll(/at (?:[^\n]*?\()?file:\/\/\/[^\n]*\/Browser\/(test-[\w-]+\.mjs):/g)].map(m=>m[1]);
const stopped=failures.at(-1),index=commands.findIndex(c=>c===`node ${stopped}`);
if(npm.code!==0&&index<0)throw Error('Cannot identify suite stop; inspect npm-test.log');
const results=[{command:'npm test',code:npm.code,stopped}];
for(const command of npm.code===0?[]:commands.slice(index+1)){
 const args=command.split(' ').slice(1),r=await run(args);
 await writeFile(new URL(args[0]+'.log',folder),r.output);results.push({command,code:r.code});console.log((r.code===0?'PASS':'FAIL')+': '+command);
}
await writeFile(new URL('suite-results.json',folder),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results.filter(r=>r.code!==0)));
