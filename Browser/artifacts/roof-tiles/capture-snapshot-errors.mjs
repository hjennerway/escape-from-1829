import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
// Record assertion data without suppressing or changing any test assertion.
process.on('uncaughtExceptionMonitor',error=>{
 if(error.code==='ERR_ASSERTION'&&Object.hasOwn(error,'actual')&&Object.hasOwn(error,'expected')){
  writeFileSync(join(process.env.ROOF_TILE_CAPTURE_DIR,'failure-'+process.pid+'.json'),
   JSON.stringify({actual:error.actual,expected:error.expected,message:error.message,stack:error.stack},null,2)+'\n');
 }
});
