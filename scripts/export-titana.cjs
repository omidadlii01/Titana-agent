/* Reproducible standalone HTML export; no runtime dependencies. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'titana-campaign-intelligence.html'));
const output=path.join(root,'downloads/titana-campaign-intelligence.html');
if(process.argv.includes('--check')){
 if(!fs.existsSync(output)||!source.equals(fs.readFileSync(output))){console.error('Export is missing or stale. Run node scripts/export-titana.cjs');process.exitCode=1;}
}else{fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,source);}
if(!process.exitCode)console.log(JSON.stringify({file:'downloads/titana-campaign-intelligence.html',bytes:source.length,sha256:crypto.createHash('sha256').update(source).digest('hex'),matchesSource:true},null,2));
