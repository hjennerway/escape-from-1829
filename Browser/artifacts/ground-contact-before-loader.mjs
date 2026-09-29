import {registerHooks} from 'node:module';
const before=process.env.GROUND_CONTACT_BEFORE==='1';
const edits={
 'escape-exterior.mjs':[['4.5*size+.18,6),bark,x,2.25*size-.09,z','4.5*size,6),bark,x,2.25*size,z']],
 'front-lawn-trees.mjs':[['branch([0,-.4,0]','branch([0,0,0]'],['branch([Math.sin(a)*r,-.4,Math.cos(a)*r]','branch([Math.sin(a)*r,.05,Math.cos(a)*r]']],
 'oak-trees.mjs':[['branch([0,-.15,0]','branch([0,0,0]'],['branch([Math.sin(a)*r,-.2,Math.cos(a)*r]','branch([Math.sin(a)*r,.1,Math.cos(a)*r]']],
 'willow-trees.mjs':[['branch([0,-.08,0]','branch([0,0,0]']],
 'admin-pine-trees.mjs':[['for(let i=0;i<trunkVertices.count;i++)if(trunkVertices.getY(i)<-.499)trunkVertices.setY(i,-.51);','']],
 'front-lawn-eztree.mjs':[["if(key==='branches')for(let i=0;i<positions.count;i++)if(positions.getY(i)<.001)positions.setY(i,-.36);",'']]
};
registerHooks({load(url,context,next){
 const result=next(url,context);if(result.format!=='module'||!url.startsWith('file:'))return result;
 let source=String(result.source),changed=false;
 if(before){const name=new URL(url).pathname.split('/').at(-1);for(const [a,b] of edits[name]??[]){if(!source.includes(a))throw Error('Cannot reconstruct '+name);source=source.replace(a,b);changed=true;}}
 if(url.endsWith('/jarman-scope.mjs')){source=source.replace('return {primitives:',"globalThis.captureGeometryRows?.('jarman',rows);return {primitives:");changed=true;}
 if(url.endsWith('/leighton-scope.mjs')){source=source.replace('});return {count:',"});globalThis.captureGeometryRows?.('leighton',rows);return {count:");changed=true;}
 return changed?{...result,source}:result;
}});
