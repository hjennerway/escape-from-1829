import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
 const result=next(url,context);
 if(url.endsWith('/dist/historic-road-layout.mjs'))return {...result,source:String(result.source)
  .replace(/import \{IRBY_ROUNDING_PAVING[^\n]*\n/,'')
  .replace(' ...IRBY_ROUNDING_PAVING,','')
  .replace(' IRBY_ROUNDED_ISLAND,','')
  .replace('IRBY_ROUNDED_KERB,...ANNEXE_ACCESS_KERBS','...ANNEXE_ACCESS_KERBS')};
 return result;
}});
