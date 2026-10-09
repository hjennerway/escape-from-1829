// Diagnostic reconstruction of the scene before the documented pipe relocation.
import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
 const result=next(url,context);
 if(!url.endsWith('/dist/escape-exterior.mjs'))return result;
 const source=String(result.source),call='avoidWindowDownpipes(THREE,model);';
 if(!source.includes(call))throw new Error('Pipe-clearance call was not found');
 return {...result,source:source.replace(call,'/* diagnostic: pipe relocation disabled */')};
}});
