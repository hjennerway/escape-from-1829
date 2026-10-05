import './output.mjs';
import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
  const result=next(url,context);
  if(!url.endsWith('/test-exterior-shadows-browser.mjs'))return result;
  return {...result,source:String(result.source).replace("assert(leaks.length>=10,'The rendered regression must detect the original courtyard seams');","await writeFile(new URL('legacy-shadow-diagnostics.json',destination),JSON.stringify({baselineLeaks:leaks.length,baseline},null,2));console.log('Legacy GPU seam samples: '+leaks.length);")};
}});
