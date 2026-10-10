/* Download the real export through its HTML link, verify exact bytes, then reopen offline.
   Uses the development dependencies documented in titana-campaign-intelligence.cjs.
   Run: node scripts/export-titana.cjs --check && node tests/titana-download.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const {chromium:playwright}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.cache/qa-download');fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'titana-campaign-intelligence.html'));
const artifact=fs.readFileSync(path.join(root,'downloads/titana-campaign-intelligence.html'));
let checks=0;const passed=[];function check(value,label){assert(value,label);checks++;passed.push(label);}
(async()=>{
 check(source.equals(artifact),'Committed export exactly matches source');
 let executablePath=process.env.CHROMIUM_EXECUTABLE,args=[];
 if(!executablePath){const mod=require('@sparticuz/chromium'),chromium=mod.default||mod;executablePath=await chromium.executablePath();args=chromium.args.filter(x=>x!=='--disable-web-security');const bin=path.resolve(path.dirname(require.resolve('@sparticuz/chromium')),'../bin/al2023.tar.br');if(fs.existsSync(bin)&&mod.inflate){const libs=await mod.inflate(bin);process.env.LD_LIBRARY_PATH=path.join(libs,'lib')+(process.env.LD_LIBRARY_PATH?':'+process.env.LD_LIBRARY_PATH:'');}}
 const server=http.createServer((req,res)=>{const route=new URL(req.url,'http://localhost').pathname;let body;if(['/', '/titana-campaign-intelligence.html'].includes(route))body=source;else if(route==='/downloads/titana-campaign-intelligence.html')body=artifact;else{res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(body);});
 let browser;
 try{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 browser=await playwright.launch({headless:true,executablePath,args});const context=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:1000}}),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base);await page.evaluate(()=>document.fonts.ready);
 check(await page.locator('#downloadHtml').isVisible(),'Download link visible in preview-style root page');
 await page.locator('#url').fill('https://www.titana.ir/product/download-test?unsaved=1');
 const pending=page.waitForEvent('download');await page.locator('#downloadHtml').click();const download=await pending;
 check(download.suggestedFilename()==='titana-campaign-intelligence.html','Correct HTML download filename');
 const downloaded=path.join(out,'titana-campaign-intelligence.html');await download.saveAs(downloaded);
 check(await download.failure()===null,'Browser download completed');check(fs.readFileSync(downloaded).equals(artifact),'Downloaded file equals committed artifact, not modified live DOM');
 await page.goto(base+'/downloads/titana-campaign-intelligence.html');const nestedPending=page.waitForEvent('download');await page.locator('#downloadHtml').click();const nested=await nestedPending;const nestedPath=path.join(out,'nested-download.html');await nested.saveAs(nestedPath);check(fs.readFileSync(nestedPath).equals(artifact),'Download also resolves from exported file subdirectory');
 await context.setOffline(true);const offlineRequests=[];page.on('request',r=>{if(/^https?:/.test(r.url()))offlineRequests.push(r.url());});await page.goto(pathToFileURL(downloaded).href);await page.evaluate(()=>document.fonts.ready);
 check(await page.locator('.section').count()===17,'Downloaded file reopens offline with all sections');check(await page.evaluate(()=>document.fonts.check('14px Vazirmatn')),'Font is embedded in downloaded file');
 await page.locator('#makeShort').click();await page.waitForFunction(()=>document.querySelector('#shortener').dataset.state==='success');await page.locator('#makeQr').click();check(await page.locator('#qr svg').count()===1,'Downloaded file generates short-link QR offline');
 await page.setViewportSize({width:360,height:1000});await page.locator('#downloadHtml').scrollIntoViewIfNeeded();check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Download affordance fits 360px mobile');await page.screenshot({path:path.join(out,'download-360.png')});
 await page.emulateMedia({media:'print'});check(await page.locator('.download-delivery').isHidden(),'Download controls excluded from print');
 check(errors.length===0,'No script errors during download or offline reopening');check(offlineRequests.length===0,'No external HTTP requests after offline reopening');
 const result={status:'PASS',checks,passed,bytes:artifact.length,sha256:crypto.createHash('sha256').update(artifact).digest('hex'),downloadedFile:path.relative(root,downloaded),errors,offlineRequests};fs.writeFileSync(path.join(out,'download-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 }finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
