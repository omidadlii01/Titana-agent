/* Download the real export through its HTML link, verify exact bytes, then reopen offline.
   Uses the development dependencies documented in titana-campaign-intelligence.cjs.
   Run: node scripts/export-titana.cjs --check && node tests/titana-download.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const {spawn}=require('node:child_process');
const {chromium:playwright}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.cache/qa-download');fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'titana-campaign-intelligence.html'));
const artifact=fs.readFileSync(path.join(root,'downloads/titana-campaign-intelligence.html'));
let checks=0;const passed=[];function check(value,label){assert(value,label);checks++;passed.push(label);}
(async()=>{
 check(source.equals(artifact),'Committed export exactly matches source');
 let executablePath=process.env.CHROMIUM_EXECUTABLE,args=[];
 if(!executablePath){const mod=require('@sparticuz/chromium'),chromium=mod.default||mod;executablePath=await chromium.executablePath();args=chromium.args.filter(x=>x!=='--disable-web-security');const bin=path.resolve(path.dirname(require.resolve('@sparticuz/chromium')),'../bin/al2023.tar.br');if(fs.existsSync(bin)&&mod.inflate){const libs=await mod.inflate(bin);process.env.LD_LIBRARY_PATH=path.join(libs,'lib')+(process.env.LD_LIBRARY_PATH?':'+process.env.LD_LIBRARY_PATH:'');}}
 const preview=spawn('python',['-u',path.join(root,'scripts/preview_server.py'),'--port','0'],{stdio:['ignore','pipe','pipe']});
 let browser,server;

 try{
 const base=await new Promise((resolve,reject)=>{let log='';const timer=setTimeout(()=>reject(Error('Preview server startup timeout')),15000);preview.on('error',e=>{clearTimeout(timer);reject(e)});preview.stdout.on('data',b=>{log+=b.toString();const m=log.match(/listening on port (\d+)/);if(m){clearTimeout(timer);resolve('http://127.0.0.1:'+m[1])}});preview.on('exit',code=>{clearTimeout(timer);reject(Error('Preview server exited '+code))});});
 const headers=await fetch(base+'/?download=html');check(headers.status===200&&headers.headers.get('content-disposition')==='attachment; filename="titana-campaign-intelligence.html"','Actual preview server forces HTML attachment');check(headers.headers.get('cache-control').includes('no-store'),'Downloads bypass cache');check(Buffer.from(await headers.arrayBuffer()).equals(artifact),'HTTP attachment exactly matches export');
 check((await fetch(base+'/.git/HEAD')).status===404,'Preview does not expose repository files');
 server=http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html'});res.end('<!doctype html><iframe title="Preview" style="width:100%;height:100vh" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" src="'+base+'"></iframe>');});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 browser=await playwright.launch({headless:true,executablePath,args});const context=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:1000}}),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base);await page.evaluate(()=>document.fonts.ready);
 check(await page.locator('#downloadHtml').isVisible(),'Download link visible in preview-style root page');
 await page.locator('#url').fill('https://www.titana.ir/product/download-test?unsaved=1');
 async function downloadViaTab(owner,link,dest){const pending=owner.waitForEvent('popup');await link.click();const tab=await pending;await tab.waitForLoadState('domcontentloaded');check(await tab.locator('#downloadAttachment').isVisible(),'Download landing opens in separate tab');const ready=tab.waitForEvent('download');await tab.locator('#downloadAttachment').click();const d=await ready;check(d.suggestedFilename()==='titana-campaign-intelligence.html','Correct attachment filename');await d.saveAs(dest);check(await d.failure()===null&&fs.readFileSync(dest).equals(artifact),'Attachment completes and equals export');await tab.close();return d;}
 const downloaded=path.join(out,'titana-campaign-intelligence.html');await downloadViaTab(page,page.locator('#downloadHtml'),downloaded);
 await page.goto(base+'/downloads/titana-campaign-intelligence.html');await downloadViaTab(page,page.locator('#downloadHtml'),path.join(out,'nested-download.html'));
 // Reproduce an embedded preview where direct downloads are disallowed.
 await page.goto('http://127.0.0.1:'+server.address().port);const frame=page.frameLocator('iframe');
 await frame.locator('body').evaluate(body=>{const a=document.createElement('a');a.id='legacyDownload';a.href='titana-campaign-intelligence.html';a.download='titana-campaign-intelligence.html';a.textContent='Legacy download test';a.style.cssText='position:fixed;bottom:10px;left:10px;z-index:9999;background:white;padding:15px';body.prepend(a);});
 const oldDownload=page.waitForEvent('download',{timeout:3000}).then(()=>true,()=>false);await frame.locator('#legacyDownload').click();check(!await oldDownload,'Old direct-download approach emits no download inside restrictive sandbox');await frame.locator('#legacyDownload').evaluate(e=>e.remove());
 check(!await frame.locator('#downloadHtml').getAttribute('download'),'Embedded preview uses navigation, not sandbox-blocked download attribute');
 await downloadViaTab(page,frame.locator('#downloadHtml'),path.join(out,'iframe-download.html'));checks++;passed.push('Download succeeds from iframe WITHOUT allow-downloads via escaped tab');
 await context.setOffline(true);const offlineRequests=[];page.on('request',r=>{if(/^https?:/.test(r.url()))offlineRequests.push(r.url());});await page.goto(pathToFileURL(downloaded).href);await page.evaluate(()=>document.fonts.ready);
 check(await page.locator('#downloadHtml').getAttribute('download')==='titana-campaign-intelligence.html','Offline file restores local download link without server dependency');
 check(await page.locator('.section').count()===17,'Downloaded file reopens offline with all sections');check(await page.evaluate(()=>document.fonts.check('14px Vazirmatn')),'Font is embedded in downloaded file');
 await page.locator('#makeShort').click();await page.waitForFunction(()=>document.querySelector('#shortener').dataset.state==='success');await page.locator('#makeQr').click();check(await page.locator('#qr svg').count()===1,'Downloaded file generates short-link QR offline');
 await page.setViewportSize({width:360,height:1000});await page.locator('#downloadHtml').scrollIntoViewIfNeeded();check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Download affordance fits 360px mobile');await page.screenshot({path:path.join(out,'download-360.png')});
 await page.emulateMedia({media:'print'});check(await page.locator('.download-delivery').isHidden(),'Download controls excluded from print');
 check(errors.length===0,'No script errors during download or offline reopening');check(offlineRequests.length===0,'No external HTTP requests after offline reopening');
 const result={status:'PASS',checks,passed,bytes:artifact.length,sha256:crypto.createHash('sha256').update(artifact).digest('hex'),downloadedFile:path.relative(root,downloaded),errors,offlineRequests};fs.writeFileSync(path.join(out,'download-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 }finally{if(browser)await browser.close();if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}preview.kill('SIGTERM');}
})().catch(e=>{console.error(e);process.exitCode=1;});
