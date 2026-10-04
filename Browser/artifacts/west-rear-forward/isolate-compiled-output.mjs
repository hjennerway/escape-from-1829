import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
  const result=next(url,context);
  if(!/\/test-(precompiled-models|timeline-browser)\.mjs$/.test(url))return result;
  let source=typeof result.source==='string'?result.source:Buffer.from(result.source).toString('utf8');
  if(url.endsWith('/test-precompiled-models.mjs')){
    // Keep the hash-checked build chosen at test startup while independent
    // workspace builds may replace the live manifest. Later fallback-test
    // routes take precedence and continue exercising all original fallbacks.
    source=source.replace("  page.on('pageerror'", "  await page.route('**/compiled/manifest.json',route=>route.fulfill({contentType:'application/json',body:JSON.stringify(manifest)}));\n  await page.route('**/compiled/'+manifest.file,route=>route.fulfill({body:packed}));\n  page.on('pageerror'");
  }
  return {...result,source:source.replace("new URL('./artifacts/',import.meta.url)","new URL('./artifacts/west-rear-forward/compiled-tests/',import.meta.url)")};
}});
