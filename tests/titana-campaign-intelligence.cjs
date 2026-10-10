/* Offline presentation regression test. Development-only dependencies, no runtime CDN.
   Install: npm install --no-save --no-package-lock playwright@1.64.0 @sparticuz/chromium@153.0.0 jsqr@1.4.0 pngjs@7.0.0 axe-core@4.11.0
   Run: node tests/titana-campaign-intelligence.cjs
   Optional: CHROMIUM_EXECUTABLE=/path/to/chromium (uses normal Playwright args).
   Screenshots, a PDF and machine-readable results are written to ignored .cache/qa-shortener/.
*/
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium:playwright}=require('playwright');
const jsQR=require('jsqr');
const {PNG}=require('pngjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.cache/qa-shortener');
fs.mkdirSync(out,{recursive:true});
let checks=0;const passed=[];
function check(condition,label){assert(condition,label);checks++;passed.push(label);}
(async()=>{
 let executablePath=process.env.CHROMIUM_EXECUTABLE,args=[];
 if(!executablePath){const mod=require('@sparticuz/chromium');const chromium=mod.default||mod;executablePath=await chromium.executablePath();args=chromium.args.filter(x=>x!=='--disable-web-security');
 // The sandbox is Debian rather than Lambda. Inflate the package's NSS/NSPR libraries.
 const bin=path.resolve(path.dirname(require.resolve('@sparticuz/chromium')),'../bin/al2023.tar.br');
 if(fs.existsSync(bin)&&mod.inflate){const libs=await mod.inflate(bin);process.env.LD_LIBRARY_PATH=path.join(libs,'lib')+(process.env.LD_LIBRARY_PATH?':'+process.env.LD_LIBRARY_PATH:'');}
 }
 const browser=await playwright.launch({headless:true,executablePath,args});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',acceptDownloads:true});
 const page=await context.newPage();const errors=[],requests=[],consoleErrors=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
 await context.setOffline(true);
 await page.goto(pathToFileURL(path.join(root,'titana-campaign-intelligence.html')).href);
 await page.evaluate(()=>document.fonts.ready);
 check(await page.locator('.section').count()===17,'All 17 original product sections retained');
 check(await page.locator('[data-nav-act]').count()===5,'Five story chapters in navigation');
 check(await page.locator('#charts .chart').count()===8,'Eight dashboard charts rendered');
 check(await page.evaluate(()=>document.documentElement.lang==='fa'&&document.documentElement.dir==='rtl'),'Persian RTL root');
 check(await page.evaluate(()=>document.fonts.check('14px Vazirmatn')),'Embedded Vazirmatn loaded');
 const expectedOrder=[1,2,4,5,8,9,11,6,10,3,7,12,13,14,15,16,17];
 assert.deepEqual(await page.locator('.section').evaluateAll(xs=>xs.map(x=>+x.id.slice(1))),expectedOrder);passed.push('Human-first section ordering');checks++;
 check(await page.locator('h1').count()===1,'Single document-level heading');
 check(await page.locator('.delivery-card').count()===8,'Eight concrete deliverables');
 const ids=await page.locator('[id]').evaluateAll(xs=>xs.map(x=>x.id));check(ids.length===new Set(ids).size,'Unique HTML IDs');
 const badLinks=await page.locator('a[href^="#"]').evaluateAll(as=>as.map(a=>a.getAttribute('href')).filter(h=>!document.getElementById(decodeURIComponent(h.slice(1)))));check(!badLinks.length,'Every internal anchor resolves');
 const images=await page.locator('img').evaluateAll(xs=>xs.map(x=>({embedded:x.src.startsWith('data:'),loaded:x.complete&&x.naturalWidth>0})));
 check(images.length===0,'Reference image blocks removed as requested');
 const before=await page.evaluate(()=>TitanaDemo.metrics(TitanaDemo.sessions,TitanaDemo.clicks));
 assert.deepEqual(before,{sessions:630,users:137,clicks:792,orders:61,revenue:245100000,gross:277000000,refunds:4200000});checks++;passed.push('Original fixture totals unchanged');
 await page.screenshot({path:path.join(out,'opening-1440.png')});
 // New educational story must never mutate production-prototype fixture.
 for(let i=0;i<9;i++){
  await page.locator('#story-tab-'+i).click();check(await page.locator('#story-pane-'+i).isVisible(),'SMS story step '+(i+1));
  check(await page.locator('.story-pane:visible').count()===1,'Only selected story pane visible '+i);
  check(await page.locator('#story-pane-'+i+' .story-facts>div').count()===4,'All four learning questions for story step '+i);
 }
 check(await page.locator('#storyNext').isDisabled(),'Story next disabled at final step');
 await page.locator('#story-tab-8').focus();await page.keyboard.press('Home');check(await page.locator('#story-tab-0').getAttribute('aria-selected')==='true','Story Home keyboard selection');
 await page.keyboard.press('ArrowDown');check(await page.locator('#story-tab-1').getAttribute('aria-selected')==='true','Story arrow keyboard selection');
 await page.keyboard.press('End');check(await page.locator('#story-tab-8').getAttribute('aria-selected')==='true','Story End keyboard selection');
 await page.locator('#storyPrev').click();check(await page.locator('#story-tab-7').getAttribute('aria-selected')==='true','Story previous button');
 await page.locator('#storyNext').click();check(await page.locator('#story-tab-8').getAttribute('aria-selected')==='true','Story next button');
 assert.deepEqual(await page.evaluate(()=>TitanaDemo.metrics(TitanaDemo.sessions,TitanaDemo.clicks)),before);checks++;passed.push('Story does not mutate shared dashboard data');
 assert.deepEqual(await page.evaluate(()=>[...TitanaDemo.smsStory.counts]),[100,45,20,12,8]);checks++;passed.push('Story cohort and 8% conversion isolated from dashboard');
 await page.locator('#story-tab-4').click();await page.locator('#sms-story').evaluate(e=>e.scrollIntoView({block:'start'}));await page.screenshot({path:path.join(out,'story-1440.png')});
 // Existing URL logic, including encoding, case-insensitive deduplication and security.
 await page.locator('#url').fill('https://www.titana.ir/product/123?x=%D8%B3%D9%84%D8%A7%D9%85&x=2&utm_source=old&UTM_SOURCE=OLD#info');
 const u=new URL(await page.locator('#urlOutput').textContent());assert.deepEqual(u.searchParams.getAll('x'),['سلام','2']);check(u.hash==='#info'&&u.searchParams.getAll('utm_source').length===1&&!u.searchParams.has('UTM_SOURCE'),'Query, Unicode and fragment preserved; duplicate UTM removed');
 for(const url of ['javascript:alert(1)','http://www.titana.ir','https://www.titana.ir.evil.com','https://user:pass@www.titana.ir','https://www.titana.ir:444/']){await page.locator('#url').fill(url);check(await page.locator('#copyUrl').isDisabled(),'Reject unsafe URL '+url);}
 await page.locator('#url').fill('https://www.titana.ir/product/123?variant=blue#specs');await page.locator('#utm_source').fill('BAD VALUE');check(await page.locator('#copyUrl').isDisabled(),'Invalid UTM rejected');await page.locator('#utm_source').fill('instagram');
 // Primary QR now encodes the short URL; full UTM remains in advanced details.
 await page.locator('#makeShort').click();await page.waitForFunction(()=>document.querySelector('#shortener').dataset.state==='success');
 const firstShort=await page.locator('#shortOutput').textContent();check(/^https:\/\/go\.titana\.ir\/[a-z0-9]{8}$/.test(firstShort),'Crypto-generated demo short URL');
 await page.locator('#makeQr').click();const png=PNG.sync.read(await page.locator('#qr svg').screenshot());const qr=jsQR(new Uint8ClampedArray(png.data),png.width,png.height);check(qr&&qr.data===firstShort,'QR decoded to short URL, not long UTM');
 check((await page.locator('#shortener').textContent()).includes('قابل استفاده عمومی نیست'),'Public non-operational warning visible');
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true}));await page.locator('#copyShort').click();await page.waitForFunction(()=>document.querySelector('#toast').textContent==='لینک کپی شد.');checks++;passed.push('Copy short URL fallback');
 await page.locator('#originalDetails > summary').click();await page.locator('#copyUrl').click();await page.waitForFunction(()=>document.querySelector('#toast').textContent==='لینک کپی شد.');checks++;passed.push('Original UTM copy retained in advanced details');
 await page.locator('#previewShort').click();check((await page.locator('#shortPreviewBody').textContent()).includes('302'),'Local preview simulates temporary redirect');check((await page.locator('#shortPreviewBody').textContent()).includes('#specs'),'Local preview retains destination fragment');await page.locator('#closeShortPreview').click();
 await page.locator('#saveShort').click();check(await page.locator('#saveShort').isDisabled(),'Save short record idempotent in UI');check((await page.locator('#shortLinkRegistry').textContent()).includes(firstShort),'Saved mapping appears in registry');
 const savedMapping=await page.evaluate(()=>TitanaDemo.shortRecords.find(r=>!r.seed));check(savedMapping.snapshot.destination_url.includes('variant=blue')&&savedMapping.snapshot.destination_url.endsWith('#specs')&&savedMapping.snapshot.utm.utm_source==='instagram','Mapping preserves UTM, query and fragment');
 // Invalidate stale short output on any campaign, destination or publication setting change.
 await page.locator('#url').fill('https://www.titana.ir/product/123?variant=blue&x=%D8%B3%D9%84%D8%A7%D9%85&x=2#specs');check(await page.locator('#copyShort').isDisabled(),'Destination edit invalidates old short output');check(await page.locator('#qr svg').count()===0,'Destination edit clears stale QR');
 for(const alias of ['bad alias','../evil','UPPER','ab','api','admin','bad--alias','bad-']){await page.locator('#customAlias').fill(alias);await page.locator('#makeShort').click();await page.waitForFunction(()=>document.querySelector('#shortener').dataset.state==='error');check(await page.locator('#copyShort').isDisabled(),'Invalid or reserved alias rejected: '+alias);}
 await page.locator('#customAlias').fill('implant-fall');await page.locator('#makeShort').click();await page.waitForFunction(()=>document.querySelector('#shortener').dataset.state==='success');check(await page.locator('#shortOutput').textContent()==='https://go.titana.ir/implant-fall','Valid custom alias');
 const aliasMapping=await page.evaluate(()=>TitanaDemo.shortRecords.find(r=>r.custom_alias==='implant-fall'));check(/^[a-z0-9]{8}$/.test(aliasMapping.short_code)&&aliasMapping.short_code!=='implant-fall','Custom alias also retains an independent random code');const mappedURL=new URL(aliasMapping.snapshot.destination_url);assert.deepEqual(mappedURL.searchParams.getAll('x'),['سلام','2']);check(mappedURL.hash==='#specs','Alias mapping keeps repeated query and Unicode');
 await page.locator('#makeShort').click();await page.waitForFunction(()=>document.querySelector('#shortener').dataset.state==='error');check((await page.locator('#shortError').textContent()).includes('قبلاً'),'Duplicate alias rejected');
 await page.locator('#customAlias').fill('aaaaaaaa');await page.locator('#makeShort').click();await page.waitForFunction(()=>document.querySelector('#shortener').dataset.state==='success');
 check(await page.evaluate(()=>{try{TitanaDemo.randomRoute(b=>b.fill(0));return false;}catch(e){return e.message.includes('پنج');}}),'Bounded collision retry; reserved code not reassigned');
 await page.locator('#customAlias').fill('path-test');await page.locator('#shortDomain').selectOption('path');await page.locator('#makeShort').click();await page.waitForFunction(()=>document.querySelector('#shortener').dataset.state==='success');check(await page.locator('#shortOutput').textContent()==='https://www.titana.ir/r/path-test','Main-domain route alternative');
 await page.locator('#makeQr').click();const pathPNG=PNG.sync.read(await page.locator('#qr svg').screenshot());check(jsQR(new Uint8ClampedArray(pathPNG.data),pathPNG.width,pathPNG.height).data==='https://www.titana.ir/r/path-test','QR matches main-domain short URL');
 await page.locator('#saveShort').click();const pathId=await page.evaluate(()=>TitanaDemo.shortRecords.find(r=>r.custom_alias==='path-test').id);
 await page.locator('[data-short-status="'+pathId+'"]').selectOption('paused');check(await page.evaluate(id=>TitanaDemo.simulateResolve(TitanaDemo.shortRecords.find(r=>r.id===id)).http_status,pathId)===200,'Paused local lifecycle has no redirect');
 page.once('dialog',d=>d.accept());await page.locator('[data-short-status="'+pathId+'"]').selectOption('archived');check(await page.evaluate(id=>TitanaDemo.simulateResolve(TitanaDemo.shortRecords.find(r=>r.id===id)).http_status,pathId)===302,'Archive explicitly preserves access in local policy');
 check(await page.evaluate(id=>{const r=TitanaDemo.shortRecords.find(r=>r.id===id);return TitanaDemo.simulateResolve({...r,expires_at:'2020-01-01T00:00:00Z'}).http_status===410&&r.audit.length>=3;},pathId),'Expiry and lifecycle audit in local model');
 check(await page.evaluate(id=>{const r=TitanaDemo.shortRecords.find(r=>r.id===id);return TitanaDemo.simulateResolve({...r,snapshot:{...r.snapshot,destination_url:'javascript:alert(1)'}}).http_status===410&&TitanaDemo.simulateResolve({...r,revoked_at:new Date().toISOString()}).http_status===410&&TitanaDemo.simulateResolve(null).http_status===404;},pathId),'Local preview blocks unsafe, revoked and unknown mappings');
 await page.locator('#customAlias').fill('expired-test');await page.locator('#shortExpiry').fill('2020-01-01T00:00');await page.locator('#makeShort').click();await page.waitForFunction(()=>document.querySelector('#shortener').dataset.state==='error');check((await page.locator('#shortError').textContent()).includes('آینده'),'Past expiry rejected');await page.locator('#shortExpiry').fill('');
 await page.locator('#customAlias').fill('cancel-inflight');await page.locator('#makeShort').click();await page.locator('#customAlias').fill('changed-inflight');await page.waitForTimeout(300);check(!await page.evaluate(()=>TitanaDemo.shortRecords.some(r=>r.custom_alias==='cancel-inflight')),'Editing during loading cancels stale creation');
 await page.locator('#customAlias').fill('');await page.locator('#shortDomain').selectOption('subdomain');
 // Shared dataset / attribution reconciliation must hold with multiple links per campaign.
 const linkTotals=await page.evaluate(()=>{const d=TitanaDemo.shortReportData();return {requests:d.requests.length,bots:d.requests.filter(x=>x.bot).length,sessions:d.ss.length,net:d.net,links:d.rows.reduce((n,r)=>n+r.revenue,0),unlinked:d.unlinked};});assert.deepEqual(linkTotals,{requests:820,bots:28,sessions:630,net:245100000,links:245100000,unlinked:0});checks++;passed.push('820 requests, 792 nonbot clicks; original sessions and revenue unchanged');
 check(await page.locator('#shortCharts .short-chart').count()===7,'Seven rendered short-link charts');
 for(const model of ['first','last','last_non_direct']){await page.locator('#f_model').selectOption(model);check(await page.evaluate(()=>{const d=TitanaDemo.shortReportData();return d.rows.reduce((n,r)=>n+r.revenue,0)+d.unlinked===d.net;}),'Short-link revenue conserved for '+model);check(await page.evaluate(model=>{const d=TitanaDemo.shortReportData(),expected={};for(const o of d.oo){const t=TitanaDemo.touch(o,model);if(t.campaign)expected[t.campaign]=(expected[t.campaign]||0)+o.net;}return Object.entries(expected).every(([id,v])=>d.rows.filter(r=>r.record.campaign_id===id).reduce((a,r)=>a+r.revenue,0)===v);},model),'Link sums equal campaign attribution for '+model);}
 await page.locator('#shortReportFilter').selectOption(pathId);check((await page.locator('#shortKpis').textContent()).includes('ناموجود'),'New link has unavailable analytics, not invented traffic');await page.locator('#resetShortFilter').click();
 await page.locator('[data-flow="6"]').click();check((await page.locator('#redirectFlowDetail').textContent()).includes('Location'),'Interactive redirect architecture');
 await page.locator('#url').fill('https://www.titana.ir/product/123?variant=blue#specs');
 await page.locator('#utm_id').fill('cmp_unregistered');await page.locator('#utm_campaign').fill('unregistered_campaign');await page.locator('#makeShort').click();await page.waitForFunction(()=>document.querySelector('#shortener').dataset.state==='error');check((await page.locator('#shortError').textContent()).includes('ثبت کنید'),'Cannot create an orphan short link for an unregistered campaign');
 await page.locator('#utm_id').fill('cmp_qa');await page.locator('#utm_campaign').fill('qa_implant');await page.locator('#owner').fill('=QA');await page.locator('#builderForm button[type=submit]').click();
 await page.locator('#campaignSearch').fill('cmp_qa');check(await page.locator('#campaignTable tbody tr').count()===1,'Local campaign creation and search');
 await page.locator('[data-detail="cmp_qa"]').click();await page.locator('#detailStatus').selectOption('archived');await page.locator('#closeDialog').click();check((await page.locator('#campaignTable').textContent()).includes('آرشیوشده'),'Campaign status editing');
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#exportCsv').click()]);await download.saveAs(path.join(out,'campaigns.csv'));const csv=fs.readFileSync(path.join(out,'campaigns.csv'),'utf8');check(csv.includes('cmp_qa')&&csv.includes("'=QA"),'CSV reflects filtered row and neutralizes formula injection');
 await page.locator('#campaignSearch').fill('');await page.locator('#campaignStatus').selectOption('active');check(!(await page.locator('#campaignTable').textContent()).includes('بازگشت مشتریان'),'Campaign status filter');await page.locator('#campaignStatus').selectOption('');await page.locator('#campaignSort').selectOption('sessions');
 check((await page.locator('#campaignTable tbody tr').first().textContent()).includes('cmp_1026'),'Campaign numeric sorting');
 await page.locator('[data-performance="cmp_1024"]').click();check(await page.locator('#f_campaign').inputValue()==='cmp_1024','Campaign performance action sets analytics filter');
 await page.locator('#resetFilters').click();
 for(const [key,value] of [['date','early'],['campaign','cmp_1024'],['source','instagram'],['medium','paid_social'],['content','story_a'],['device','mobile'],['landing','/product/123']]){await page.locator('#f_'+key).selectOption(value);check(await page.evaluate(()=>TitanaDemo.filtered().length)>0,'Working dashboard filter '+key);}
 check(await page.evaluate(()=>TitanaDemo.filtered().length)===43,'Combined filter returns expected 43 sessions');
 await page.locator('#f_source').selectOption('google');check(await page.evaluate(()=>TitanaDemo.filtered().length)===0,'Contradictory filters show empty dataset');check((await page.locator('#kpiGrid').textContent()).includes('ناموجود'),'Empty dataset has unavailable ratios');await page.locator('#resetFilters').click();
 const firstText=await page.locator('#attributionTable').textContent();await page.locator('#attributionModel').selectOption('first');check((await page.locator('#attributionTable').textContent())!==firstText,'Attribution switch changes allocation');check(await page.locator('#f_model').inputValue()==='first','Attribution controls synchronized');await page.locator('#f_model').selectOption('last');check((await page.locator('#attributionTable').textContent()).includes('direct'),'Last touch credits direct channel');
 const totalOK=await page.evaluate(()=>['first','last','last_non_direct'].every(m=>TitanaDemo.orders.reduce((n,o)=>n+(TitanaDemo.touch(o,m)?o.net:0),0)===245100000));check(totalOK,'Revenue conserved across all three attribution models');
 await page.locator('#resetFilters').click();await page.locator('[data-stage="3"]').click();check((await page.locator('#funnelDetail').textContent()).includes('شروع پرداخت'),'Funnel selection works');
 const counts=await page.evaluate(()=>[1,2,3,4,5].map(stage=>TitanaDemo.sessions.filter(s=>s.stage>=stage).length));assert.deepEqual(counts,[630,549,300,174,61]);checks++;passed.push('Original ordered funnel cohort conserved');
 await page.locator('#charts rect[data-label]').first().focus();await page.keyboard.press('Enter');check((await page.locator('#chartSelection').textContent()).includes('سشن'),'Chart selection with keyboard');
 const legacy=page.locator('#s6 > details').filter({hasText:'مثال تکمیلی'});await legacy.locator('summary').first().click();await page.locator('[data-step="8"]').click();check((await page.locator('#journeyDetail').textContent()).includes('outbox'),'Original Instagram customer journey preserved');
 await page.locator('#replayEvents').click();await page.waitForTimeout(2000);check(await page.locator('#eventMonitor div').count()===5,'Event monitor replay');
 await page.locator('#s7 > details').filter({hasText:'جزئیات فنی رویدادها'}).locator('summary').click();check(await page.locator('#s7 table tbody tr').count()===9,'All nine technical event contracts preserved');
 await page.locator('#s13 > details').filter({hasText:'جزئیات فنی: جدول‌ها'}).locator('summary').click();check(await page.locator('#s13 > details').filter({hasText:'جزئیات فنی: جدول‌ها'}).locator('table tbody tr').count()===9,'All nine database entities preserved');
 await page.locator('#s14 .api-list details').first().locator('summary').click();check(await page.locator('#s14 .api-list details[open]').count()===1,'API details expand');
 await page.locator('[data-check="0"]').check();await page.reload();check(await page.locator('[data-check="0"]').isChecked(),'Checklist persists across reload');await page.locator('#resetChecks').click();
 await page.evaluate(()=>localStorage.setItem('titana-acceptance-v1','{}'));await page.reload();check(!await page.locator('[data-check="0"]').isChecked(),'Malformed checklist storage handled safely');
 // Editorial copy and state-specific accessibility after the comprehensive rewrite.
 check((await page.locator('#s17 > h2').textContent()).trim()==='در پایان دقیقاً چه سیستمی باید به ما تحویل بدهید؟','Required delivery question rendered');
 check(await page.locator('.section > .editorial-acceptance').count()===17,'Business acceptance notes are top-level in every section');
 check(await page.locator('#charts .chart h3').evaluateAll(xs=>xs.length===8&&xs.every(x=>x.textContent.endsWith('؟'))),'All eight management chart headings start from questions');
 check(await page.locator('#charts .chart-question').evaluateAll(xs=>xs.length===8&&xs.every(x=>x.textContent.trim()&&!x.textContent.includes('undefined'))),'Chart copy lookup remains complete after renaming');
 check(await page.locator('#shortAnalytics h3').evaluateAll(xs=>xs.filter(x=>x.textContent.endsWith('؟')).length>=7),'All seven short-link chart questions rendered');
 await page.locator('.editorial-glossary > summary').click();check(await page.locator('.editorial-glossary dl').isVisible(),'Plain-language glossary expands');await page.locator('.editorial-glossary > summary').click();
 check(await page.locator('.editorial-decisions li').count()===6,'Six unresolved decision groups rendered');
 check(await page.locator('[aria-label^="بخش‌های مرحلهٔ"]').count()===5,'Navigation accessible names use Persian numerals');
 await page.locator('#url').fill('invalid');check((await page.locator('#urlOutput').textContent()).includes('پس از اصلاح خطاها'),'Invalid destination shows actionable replacement text');await page.locator('#url').fill('https://www.titana.ir/product/123');
 // Plain-language and business requirements: distinguish the working demo from future reporting.
 check((await page.locator('#f_campaign').locator('..').textContent()).includes('کمپین ورودی'),'Acquisition campaign filter is explicitly labeled');
 check((await page.locator('#filterSummary').textContent()).includes('مبنای تاریخ: شروع سشن به وقت UTC'),'Live report exposes its real date basis');
 check(await page.locator('#report-scope-note').isVisible(),'Report scope warning is visible beside the dashboard');
 await page.locator('#report-contract > summary').click();check((await page.locator('#report-contract').innerText()).includes('این نمای مستقل هنوز در این فایل پیاده نشده است'),'Order-date campaign view is disclosed as future work');await page.locator('#report-contract > summary').click();
 check(await page.locator('#meeting-decisions li').count()===4,'Four explicit decision owners at conclusion');
 check((await page.locator('#s16 .phase').nth(1).textContent()).includes('ثبت دستی یا CSV هزینه'),'Manual cost capture starts with first priority');
 check((await page.locator('#s16 .phase').nth(1).textContent()).includes('نباید تحویل اول را متوقف کنند'),'Optional shortener features do not block first release');
 check((await page.locator('#campaign-brief').textContent()).includes('اولین خرید معتبرش در کل سابقه'),'New customer definition uses historical first purchase');
 check((await page.locator('#campaign-brief').textContent()).includes('فرم همین فایل برای تست، ورود دستی UTM دارد'),'Manual prototype form limitation is explicit');
 check((await page.locator('#financial-definition').textContent()).includes('۷۰۰٬۰۰۰')&&(await page.locator('#financial-definition').textContent()).includes('تخفیف را دوباره کم نکنید'),'Financial example prevents discount double deduction');
 check((await page.locator('#s9').textContent()).includes('این نمودار چنین اتصال چندبازدیدی را انجام نمی‌دهد'),'Single-session funnel is not presented as a multi-session journey');
 check((await page.locator('#attributionModel option[value="last_non_direct"]').textContent())==='آخرین ورود از کانال','Attribution option has plain-language name');
 check(!(await page.locator('body').textContent()).includes('سهم محاسبهٔ سهم فروش')&&!(await page.locator('body').textContent()).includes('First-party (First-party)'),'Mechanical replacement artifacts removed');
 // Revised reader overview and staged delivery plan.
 check(await page.locator('#presentationToggle, .presentation-controls').count()===0,'Presentation mode controls removed');
 check(await page.locator('footer').count()===0,'Visible sources and license footer removed');
 check(!(await page.locator('body').innerText()).includes('انتساب'),'Unfamiliar attribution wording removed from visible copy');
 check(await page.locator('.contents-panel a').count()===17,'Contents links cover all 17 sections');
 const contentsTargets=await page.locator('.contents-panel a').evaluateAll(xs=>xs.map(x=>x.getAttribute('href')));
 assert.deepEqual(contentsTargets,expectedOrder.map(x=>'#s'+x));checks++;passed.push('Contents follows section order without missing or duplicate entries');
 check(await page.locator('.overview-grid article').count()===4,'Complete four-part opening summary');
 check(await page.locator('#s16 .phase').count()===7,'Preparation and six ordered build priorities');
 check((await page.locator('#s16 .phase').nth(1).innerText()).includes('گزارش اولیه'),'Priority one includes usable initial reporting');
 check((await page.locator('#s16 .phase').nth(2).innerText()).includes('مسیر مشتری'),'Priority two covers customer journey');
 await page.locator('.contents-panel a[href="#s16"]').click();await page.waitForTimeout(120);check(await page.locator('[data-nav="16"]').getAttribute('aria-current')==='location','Contents navigates to corresponding section');
 await page.locator('#makeShort').click();await page.waitForFunction(()=>document.querySelector('#shortener').dataset.state==='success');await page.locator('#makeQr').click();
 const layouts=[];
 for(const width of [1440,1024,768,390,360]){
  await page.setViewportSize({width,height:1000});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(120);
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No document overflow at '+width);
  await page.screenshot({path:path.join(out,'opening-'+width+'.png')});
  const beforeHidden=await page.locator('#rail').evaluate(el=>el.inert);
  if(width<=900){check(beforeHidden,'Closed mobile navigation inert at '+width);await page.locator('#menuToggle').click();check(await page.locator('#menuToggle').getAttribute('aria-expanded')==='true','Mobile nav opens at '+width);check(await page.locator('#closeMobileNav').evaluate(el=>document.activeElement===el),'Mobile nav receives focus at '+width);await page.keyboard.press('Shift+Tab');check(await page.locator('#rail').evaluate(el=>el.contains(document.activeElement)),'Mobile nav traps focus at '+width);await page.locator('[data-act-link="3"]').click();await page.waitForTimeout(120);check(await page.locator('[data-nav="6"]').getAttribute('aria-current')==='location','Active section after chapter link at '+width);check(await page.locator('#menuToggle').getAttribute('aria-expanded')==='false','Navigation closes on selection at '+width);await page.locator('#menuToggle').click();await page.keyboard.press('Escape');check(await page.locator('#menuToggle').evaluate(el=>document.activeElement===el),'Escape restores menu focus at '+width);}
  else{check(!beforeHidden,'Desktop navigation interactive at '+width);}
  await page.locator('#story-tab-4').click();
  for(const [id,name] of [['sms-story','story'],['s8','dashboard'],['s3','architecture'],['s17','deliverables'],['shortener','shortener'],['shortAnalytics','short-analytics']]){await page.locator('#'+id).evaluate(e=>e.scrollIntoView({block:'start'}));await page.waitForTimeout(50);await page.screenshot({path:path.join(out,name+'-'+width+'.png')});}
  layouts.push({width,documentWidth:await page.evaluate(()=>document.documentElement.scrollWidth)});
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.locator('#story-tab-4').click();
 // Print includes every story step and every detail, then restores reading state.
 const openedBefore=await page.locator('details[open]').count();
 await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));check(await page.locator('details[open]').count()===await page.locator('details').count(),'Print expands all technical panels');await page.emulateMedia({media:'print'});
 check(await page.locator('.story-pane:visible').count()===9,'Print includes all nine SMS story panes');
 check(await page.locator('.rail').isHidden()&&await page.locator('.topbar').isHidden(),'Print hides navigation');
 await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 check(await page.locator('details[open]').count()===openedBefore,'Synthetic print cycle restores original details state');
 await page.pdf({path:path.join(out,'presentation.pdf'),format:'A4',printBackground:true});
 check(await page.locator('details[open]').count()===openedBefore,'Native PDF print cycle restores original details state');
 await page.emulateMedia({media:'screen'});
 check(await page.locator('.story-pane:visible').count()===1,'Screen returns to a single story pane after print');
 // Automated accessibility checks supplement (not replace) keyboard and visual review.
 await page.addScriptTag({path:require.resolve('axe-core')});
 const axeOptions={runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}};
 const axeResults=[];
 for(const state of ['desktop','expanded','mobile']){
  if(state==='expanded')await page.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
  if(state==='mobile'){await page.setViewportSize({width:390,height:1000});await page.locator('#story-tab-4').click();}
  const findings=await page.evaluate(async options=>{const r=await axe.run(document,options);return {violations:r.violations,incomplete:r.incomplete.map(x=>({id:x.id,nodes:x.nodes.length}))};},axeOptions);
  axeResults.push({state,...findings});check(!findings.incomplete.some(x=>x.id==='aria-prohibited-attr'),'Labeled regions have explicit accessible roles in '+state);check(findings.violations.length===0,'No axe A/AA violations in '+state+' state');
 }
 fs.writeFileSync(path.join(out,'accessibility.json'),JSON.stringify(axeResults,null,2));
 check(errors.length===0,'Zero JavaScript exceptions');check(consoleErrors.length===0,'Zero console errors');check(requests.length===0,'Zero external HTTP/HTTPS requests while offline');
 const result={status:'PASS',checks,passed,totals:before,story:{counts:[100,45,20,12,8],conversion:0.08,isolated:true},layouts,errors,consoleErrors,requests,browser:browser.version(),dependencies:Object.fromEntries(['playwright','@sparticuz/chromium','jsqr','pngjs','axe-core'].map(n=>[n,JSON.parse(fs.readFileSync(path.join(root,'node_modules',n,'package.json'),'utf8')).version]))};
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
