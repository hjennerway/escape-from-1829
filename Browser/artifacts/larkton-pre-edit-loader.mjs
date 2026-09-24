import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){const result=next(url,context);let s=String(result.source);
 if(url.endsWith('/dist/annexe.mjs'))s=s.replace("{name:'Entrance range',rect:[-9,10,9,21]","{name:'Entrance range',rect:[-9,10,9,15]").replace("'West rear pavilion','West end projecting rooms'","'West rear pavilion','West rear link','West end projecting rooms'");
 if(url.endsWith('/dist/annexe-os-refinement.mjs'))s=s.replace("'West rear pavilion':[-101,-49,-86,-39],","'West rear pavilion':[-101,-49,-79,-39],\n 'West rear link':[-84,-40,-79,-8],").replace("ranges.filter(spec=>spec.name!=='West rear link').map","ranges.map");
 return s!==String(result.source)?{...result,source:s}:result;
}});
