import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const source=(await readFile(new URL('../../test-explore-interior.mjs',import.meta.url),'utf8')).replaceAll('./dist/','../../dist/').replace('const floors=buildAsylumLayout(plan).floors','delete plan.rooms.find(r=>r.id===\'R16\').variants[0].solidEdges;\nconst floors=buildAsylumLayout(plan).floors');
const target=new URL('explore-baseline.mjs',import.meta.url);await writeFile(target,source);
const result=spawnSync(process.execPath,[fileURLToPath(target)],{encoding:'utf8',windowsHide:true});
await writeFile(new URL('explore-baseline.log',import.meta.url),result.stdout+result.stderr);console.log(result.stdout+result.stderr);process.exitCode=result.status;
