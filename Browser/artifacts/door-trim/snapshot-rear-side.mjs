await import('../rear-side-original-east-loader.mjs');
const THREE=await import('../../dist/vendor/three.module.js');
const {createEscapeExterior}=await import('../../dist/escape-exterior.mjs');
const {rearSideSnapshot}=await import('../rear-side-alignment-scope.mjs');
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
console.log(JSON.stringify(rearSideSnapshot(THREE,createEscapeExterior(THREE,1.5).annexe,{normalise:true})));
