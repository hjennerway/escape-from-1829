import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const out=new URL('./',import.meta.url),read=async url=>JSON.parse(await readFile(url,'utf8'));
const manifest=await read(new URL('../../dist/compiled/manifest.json',out));
assert.equal(manifest.sourceHash,await modelSourceHash());
assert.equal(createHash('sha256').update(await readFile(new URL('../../dist/compiled/'+manifest.file,out))).digest('hex'),manifest.sha256);
assert.deepEqual(await read(new URL('before-layout-preservation.json',out)),await read(new URL('after-layout-preservation.json',out)));
const results=await read(new URL('remaining-suite.json',out));
for(const update of [...await read(new URL('verified-snapshot-tests.json',out)),...await read(new URL('final-carden-snapshot-tests.json',out))]){
 results[results.findIndex(result=>result.command===update.command)]=update;
}
const failed=results.filter(r=>r.code!==0).map(r=>r.command).sort();
assert.deepEqual(failed,['node test-jarman.mjs','node test-leighton-newton.mjs']);
const views=await read(new URL('final-compiled-views.json',out)),phone=await read(new URL('final-mobile-compiled-views.json',out));
assert.deepEqual(views.errors,[]);assert.deepEqual(phone.errors,[]);assert.equal(views.actual,'compiled');
const inventory=await read(new URL('after-layout-inventory.json',out));
const report={manifest,geometryPreserved:true,tiledMeshes:inventory.length,slopingTriangles:inventory.reduce((n,o)=>n+o.sloping,0),
 suite:{total:125,passed:65+1+results.filter(r=>r.code===0).length,failed},desktopViews:views.reports.length,phoneChecked:true,
 rendering:await read(new URL('../precompiled-models.json',out)),exports:{browserSources:true,compiledAerial:true,unity:false,blender:false}};
assert.equal(report.suite.passed,123);
await writeFile(new URL('final-report.json',out),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({sourceHash:manifest.sourceHash,checksumVerified:true,tiledMeshes:report.tiledMeshes,
 slopingTriangles:report.slopingTriangles,suite:report.suite,desktopViews:report.desktopViews,phoneChecked:true},null,2));
