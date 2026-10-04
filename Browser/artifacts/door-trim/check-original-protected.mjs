import './original-door-loader.mjs';
const target=process.argv[2];
if(!['test-jarman.mjs','test-leighton-newton.mjs','test-annexe-carden.mjs','test-annexe-front-link.mjs','test-annexe-kitchen.mjs','test-annexe-rear-stretch.mjs','test-annexe-rear-side-alignment.mjs','test-annexe-os-refinement.mjs','test-oakmere-court.mjs','test-oakmere-west.mjs','test-oakmere-windows.mjs','test-annexe-access.mjs'].includes(target))throw Error('Expected a protected-geometry test');
// Some historical tests verify their snapshot in a child process with an
// additional isolation loader. Preserve this repair's original doors there.
process.env.NODE_OPTIONS=(process.env.NODE_OPTIONS??'')+' --import='+new URL('./original-door-loader.mjs',import.meta.url).href;
await import(new URL('../../'+target,import.meta.url));
