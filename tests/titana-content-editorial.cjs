/* Editorial preservation regression. Run after installing acorn@8.15.0:
   node tests/titana-content-editorial.cjs
   Baseline is the reviewed PR revision 1.3, not a mutable working file. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process'),acorn=require('acorn');
const baseline=cp.execFileSync('git',['show','b87397c2ed290b7132fdf88901f5d2f4048e2fba:titana-campaign-intelligence.html'],{encoding:'utf8',maxBuffer:16*1024*1024});
const current=fs.readFileSync('titana-campaign-intelligence.html','utf8');
const scripts=s=>[...s.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const oldScripts=scripts(baseline),newScripts=scripts(current);let checks=0;const passed=[];
function check(value,label){assert(value,label);checks++;passed.push(label);}
function normalize(node){if(Array.isArray(node))return node.map(normalize);if(!node||typeof node!=='object')return node;const out={};for(const [key,value] of Object.entries(node)){if(['start','end','raw'].includes(key))continue;out[key]=node.type==='Literal'&&key==='value'&&typeof value==='string'&&/[\u0600-\u06ff]/.test(value)?'<PERSIAN UI COPY>':normalize(value);}return out;}
check(oldScripts.length===newScripts.length,'Script count preserved');
// Only the explicitly removed meeting-mode feature is excluded from the baseline AST.
function withoutPresentation(src){return src.split('\n').filter(l=>!['function presentation(on)',"$('#presentationToggle').onclick","$('#presentExit').onclick",'function presentMove(delta)',"$('#presentPrev').onclick",' const index=secs.indexOf(active);'].some(prefix=>l.startsWith(prefix))).join('\n').replace("else if(document.body.classList.contains('presenting')){presentation(false);$('#presentationToggle').focus();}",'');}
oldScripts.forEach((src,i)=>{assert.deepEqual(normalize(acorn.parse(withoutPresentation(src),{ecmaVersion:'latest'})),normalize(acorn.parse(newScripts[i],{ecmaVersion:'latest'})));checks++;passed.push('Executable AST preserved except removed presentation mode and Persian copy: script '+i);});
function blocks(s,re){return [...s.matchAll(re)].map(m=>m[0]);}
for(const [label,re]of [['code contracts',/<code\b[^>]*>[\s\S]*?<\/code>/g],['preformatted contracts',/<pre\b[^>]*>[\s\S]*?<\/pre>/g]]){
 const a=blocks(baseline,re).filter(x=>!x.includes('SIL OPEN FONT LICENSE')&&!x.includes('MIT License —')),b=blocks(current,re);assert.deepEqual(b.slice().sort(),a.slice().sort());checks++;passed.push('Exact preservation of technical '+label+' excluding relocated license ('+a.length+')');
}
const asset=/data:[^\s"')<>]+/g;
assert.deepEqual(blocks(current,asset).sort(),blocks(baseline,asset).filter(x=>!x.startsWith('data:image/png')).sort());checks++;passed.push('Font assets retained; requested reference PNGs removed');
const removed=new Set(['presentationToggle','presentPrev','presentStatus','presentNext','presentExit'].map(x=>'id="'+x+'"'));
const added=new Set(['presentation-overview','overview-title','contents-title'].map(x=>'id="'+x+'"'));
assert.deepEqual(blocks(current,/\bid="[^"]*"/g).filter(x=>!added.has(x)).sort(),blocks(baseline,/\bid="[^"]*"/g).filter(x=>!removed.has(x)).sort());checks++;passed.push('All existing IDs retained except removed meeting controls; three overview IDs added');
check(current.includes('<!-- Bundled font and QR third-party license notices (not displayed).'),'License notices retained privately in HTML source');
check(current.includes('SIL OPEN FONT LICENSE Version 1.1')&&current.includes('MIT License — Copyright (c) 2009 Kazuhiko Arase')&&current.includes('Permission is hereby granted, free of charge'),'Full font and QR notices preserved');
check(!current.includes('مرجع بصری از مخزن تیتانا')&&!current.includes('<footer>'),'Requested reference and footer blocks removed');
check(current.includes('در پایان دقیقاً چه سیستمی باید به ما تحویل بدهید؟'),'Required final section title');
check(current.includes('مواردی که باید پیش از شروع توسعه مشخص کنیم'),'Explicit unresolved decisions');
check((current.match(/class="callout editorial-acceptance"/g)||[]).length===17,'Acceptance explanation for all 17 sections');
for(const term of ['Session','Source','Medium','UTM','Redirect','Event','Attribution','First-party','Deduplication','Reconciliation','API'])check(current.includes('('+term+')'),'Glossary explains '+term);
check(!current.includes('لینکت رو')&&!current.includes('می‌تونی')&&!current.includes('حفظ می‌شن'),'Removed inconsistent colloquial shortener copy');
check(current.includes('این لینک کوتاه صرفاً نمایشی است و تا زمان پیاده‌سازی سرویس Redirect روی دامنه تیتانا، قابل استفاده عمومی نیست.'),'Exact required demo warning retained');
check(current.indexOf('فعال‌بودن دامنه و TLS')>current.indexOf('id="originalDetails"'),'Deployment helper moved into advanced details');
const result={status:'PASS',checks,passed};fs.mkdirSync('.cache/qa-shortener',{recursive:true});fs.writeFileSync('.cache/qa-shortener/editorial-preservation.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
