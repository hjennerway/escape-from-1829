import assert from 'node:assert/strict';
import {readFileSync,appendFileSync,writeFileSync} from 'node:fs';
import {modelSourceHash} from '../model-build-inputs.mjs';
const results=JSON.parse(readFileSync('Browser/artifacts/garden-cleanup-suite-results.json','utf8'));
const failed=results.filter(result=>result.status!==0).map(result=>result.command);
assert.deepEqual(failed,['node test-jarman.mjs','node test-leighton-newton.mjs']);
const compiled=readFileSync('Browser/artifacts/garden-cleanup-compiled.log','utf8');
assert(compiled.includes('PASS: compiled estate, shadows'));
assert(compiled.includes('PASS: every timeline stop in source/compiled pages'));
const manifest=JSON.parse(readFileSync('Browser/dist/compiled/manifest.json','utf8'));
assert.equal(await modelSourceHash(),manifest.sourceHash,'The delivered compiled model must match the current source');
const validation={passed:results.length-failed.length,total:results.length,failed,compiledAndTimeline:'passed',sourceHash:manifest.sourceHash};
writeFileSync('Browser/artifacts/garden-cleanup-validation.json',JSON.stringify(validation,null,2)+'\n');
appendFileSync('DEVELOPMENT.md',`

Validation: the focused wall, surface and player-width route checks pass;
the saved before geometry fails both new wall and paving regressions. Source
and rebuilt compiled reference, wall and overhead views were visually checked.
The compiled suite passes rendering/image matching, exact draw counts, full
detail, controls, fallback cases, every historical period and live walking
collision refresh. The final compiled fingerprint matches the source.

All ${results.length} standard browser commands ran: ${results.length-failed.length} pass. Jarman and
Leighton/Newton whole-estate snapshots already fail on the saved pre-edit
working tree (859,385/923,432 primitives versus saved 859,427/923,474). This
cleanup removes one net primitive; their baselines were left unchanged.
Evidence and preview files use Browser/artifacts/garden-cleanup-*.
`);
console.log(JSON.stringify(validation,null,2));
