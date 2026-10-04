import {readFile,writeFile} from 'node:fs/promises';
const url=new URL('../../test-asylum-furniture-browser.mjs',import.meta.url);let s=await readFile(url,'utf8');
s=s.replace('const room=floors[floor].rooms.find(r=>r.id===roomId)','const room=[...floors[floor].rooms,...floors[floor].furnishingAreas].find(r=>r.id===roomId)');
s=s.replace("[['ward','R32',0,'bed']","[['visitors','Visitors',1,'table'],['ward-service','WardService',0,'linenCupboard'],['recreation','Recreation',1,'table'],['ward','R32',0,'bed']");
const marker=" await page.route('**/explore.mjs'";
s=s.replace(marker," await page.evaluate(()=>window.furnitureTest.pose('Visitors',1,'table'));await page.waitForTimeout(180);await page.screenshot({path:fileURLToPath(new URL('visitors-mobile.png',destination))});\n"+marker);
await writeFile(url,s);console.log('Extended the shared rendered furniture review to the three open halls.');
