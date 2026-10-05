import {spawn} from 'node:child_process';

export async function startTestServer(){
  const server=spawn(process.execPath,['serve.mjs'],{
    cwd:new URL('../',import.meta.url),windowsHide:true,
    env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']
  });
  let output='',errors='';
  server.stderr.on('data',data=>{errors=(errors+data).slice(-4000);});
  const base=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>fail(new Error('Test server did not become ready: '+errors)),30000);
    const cleanup=()=>{clearTimeout(timer);server.stdout.off('data',ready);server.off('error',fail);server.off('exit',exited);};
    const fail=error=>{cleanup();server.kill();reject(error);};
    const exited=code=>fail(new Error('Test server exited before listening ('+code+'): '+errors));
    const ready=data=>{output+=data;const match=output.match(/http:\/\/127\.0\.0\.1:\d+/);if(match){cleanup();resolve(match[0]);}};
    server.stdout.on('data',ready);server.once('error',fail);server.once('exit',exited);
  });
  return {server,base};
}
