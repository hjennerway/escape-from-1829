// Refresh historical geometry fingerprints only after the independent,
// pre-restoration preservation and rigid-displacement regression passes.
import '../test-annexe-front-link.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {protectedKitchenGeometry} from './annexe-kitchen-scope.mjs';
import {protectedWindowGeometry} from './oakmere-window-scope.mjs';
import {rearStretchSnapshot} from './annexe-rear-stretch-scope.mjs';
const annexe=createEscapeExterior(THREE,1.5).annexe;
const save=(relative,data)=>writeFileSync(new URL('../../Research/'+relative,import.meta.url),JSON.stringify(data,null,2)+'\n');
save('annexe-kitchen/protected-geometry.json',protectedKitchenGeometry(THREE,annexe));
save('oakmere/window-protected-geometry.json',protectedWindowGeometry(THREE,annexe));
const rearPath=new URL('../../Research/annexe-kitchen/rear-stretch-before.json',import.meta.url),rear=JSON.parse(readFileSync(rearPath));
rear.front=rearStretchSnapshot(THREE,annexe).front;
writeFileSync(rearPath,JSON.stringify(rear,null,2)+'\n');
const westTest=new URL('../test-oakmere-west.mjs',import.meta.url);
const westCode=readFileSync(westTest,'utf8').split('const baseline=')[0].replace(/from '([^']+)'/g,(all,path)=>path.startsWith('.')?"from '"+new URL(path,westTest).href+"'":all)+'\nexport default fingerprint;';
save('oakmere/west-protected-geometry.json',(await import('data:text/javascript;base64,'+Buffer.from(westCode).toString('base64'))).default);
const result=spawnSync(process.execPath,[new URL('./snapshot-annexe-shape.mjs',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),'--save'],{encoding:'utf8',windowsHide:true});
process.stdout.write(result.stdout);process.stderr.write(result.stderr);if(result.status)throw Error('Snapshot refresh failed');
