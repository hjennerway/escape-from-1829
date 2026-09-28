import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
const cwd=new URL('../',import.meta.url),report=[];
const env={...process.env,MODEL_CHROME_PATH:'C:/Program Files/Google/Chrome/Application/chrome.exe'};
function run(command,args,dir=cwd){
 const result=spawnSync(command,args,{cwd:dir,env,encoding:'utf8',windowsHide:true,maxBuffer:30*1024*1024});
 const output=(result.stdout??'')+(result.stderr??'');
 const name=args.join(' ');report.push({command:command+' '+name,status:result.status,output});
 writeFileSync(new URL('surface-finishes-'+process.argv[2]+'-validation.json',import.meta.url),JSON.stringify(report,null,2));
 console.log((result.status===0?'PASS ':'FAIL ')+name);
 return result.status===0;
}
const phase=process.argv[2];
if(phase==='suite'){
 // Run the requested npm suite first, then cover checks after its first failure.
 const passed=run('cmd.exe',['/d','/c','npm test']);
 if(!passed){
  const output=report[0].output,commands=JSON.parse(readFileSync(new URL('../package.json',import.meta.url))).scripts.test.split(' && ');
  const failures=[...output.matchAll(/file:\/\/\/[^\s]*\/(test-[^\s/:]+\.mjs):/g)];
  const failed=failures[0]?.[1],index=commands.indexOf('node '+failed);
  for(const command of commands.slice(index>=0?index+1:0))run(process.execPath,command.split(' ').slice(1));
 }
}else{
 if(!run(process.execPath,['build-models.mjs']))process.exit(1);
 if(!run(process.execPath,['test-precompiled-models.mjs']))process.exit(1);
 if(!run(process.execPath,['test-timeline-browser.mjs']))process.exit(1);
 run(process.execPath,['Browser/artifacts/ground-textures-preview.mjs','compiled'],new URL('../../',import.meta.url));
 run(process.execPath,['Browser/artifacts/ground-textures-preview.mjs','after'],new URL('../../',import.meta.url));
}
