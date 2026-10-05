import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
  const result=next(url,context);
  if(!url.endsWith('/dist/west-cross-range-roof.mjs'))return result;
  const source=typeof result.source==='string'?result.source:Buffer.from(result.source).toString('utf8');
  // Revert only this repair; preserve concurrent edits to other roof joins.
  return {...result,source:source.replace("const entranceSlate=slate.filter(o=>!/^Reception |^Central back /.test(o.name));",'const entranceSlate=slate;')};
}});
