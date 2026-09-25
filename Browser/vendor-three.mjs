import assert from 'node:assert/strict';
import {readFile,writeFile,access} from 'node:fs/promises';

// Keep the offline browser modules and add-ons on the exact npm lockfile version.
// No browser bundler or npm installation is needed by players/static hosting.
const source=new URL('./node_modules/three/',import.meta.url),target=new URL('./dist/vendor/',import.meta.url);
const project=JSON.parse(await readFile(new URL('./package.json',import.meta.url),'utf8'));
const dependency=JSON.parse(await readFile(new URL('package.json',source),'utf8'));
assert.equal(dependency.version,project.devDependencies.three,'Run npm ci before vendoring Three.js');
const files=new Map([
 ['three.module.js','build/three.module.js'],
 ['GLTFLoader.js','examples/jsm/loaders/GLTFLoader.js'],
 ['BufferGeometryUtils.js','examples/jsm/utils/BufferGeometryUtils.js'],
 ['SkeletonUtils.js','examples/jsm/utils/SkeletonUtils.js'],
 ['THREE-LICENSE.txt','LICENSE']
]);
try{await access(new URL('build/three.core.js',source));files.set('three.core.js','build/three.core.js');}catch(error){if(error.code!=='ENOENT')throw error;}
const check=process.argv.includes('--check');
for(const [name,path] of files){
 let body=await readFile(new URL(path,source),'utf8');
 if(path.startsWith('examples/'))body=body.replaceAll("from 'three'","from './three.module.js'").replaceAll("from '../utils/BufferGeometryUtils.js'","from './BufferGeometryUtils.js'").replaceAll("from '../utils/SkeletonUtils.js'","from './SkeletonUtils.js'");
 if(check)assert((await readFile(new URL(name,target),'utf8')).replaceAll('\r\n','\n')===body.replaceAll('\r\n','\n'),`${name} differs from pinned Three.js; run npm run vendor:three`);
 else await writeFile(new URL(name,target),body);
}
if(check)await import('./dist/vendor/GLTFLoader.js');
console.log(`${check?'Verified':'Vendored'} Three.js ${dependency.version}: ${[...files.keys()].join(', ')}`);
