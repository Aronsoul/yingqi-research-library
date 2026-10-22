import {readFile,mkdir,copyFile,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(here),out=path.join(root,'public-dist');
const data=JSON.parse(await readFile(path.join(root,'data/library.json'),'utf8'));
for(const key of ['papers','projects','relations'])if(!Array.isArray(data[key]))throw Error('Invalid '+key);
const ids=new Set();for(const p of data.papers){if(!p.id||ids.has(p.id)||!p.title)throw Error('Paper requires unique id and title');ids.add(p.id)}
for(const r of data.relations)if(!ids.has(r.from)||!ids.has(r.to))throw Error('Relation refers to missing paper');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const file of ['index.html','app.js','admin.html','admin.js','admin.css','admin-config.json'])await copyFile(path.join(here,file),path.join(out,file));
const css=await readFile(path.join(root,'website/app/globals.css'),'utf8');
await writeFile(path.join(out,'styles.css'),css+'\n[hidden]{display:none!important} .brand{display:block}.brand span{display:block}.filters{display:flex;gap:12px;align-items:end;flex-wrap:wrap;margin-bottom:24px}.filters label{display:grid;gap:7px;font-size:12px}.filters input,.filters select{border:1px solid #dce3d7;border-radius:7px;padding:11px;background:white}.filters input{width:280px}.cards .paper .abstract{display:block;-webkit-line-clamp:unset;max-height:none}.stats>div{display:grid;gap:8px}.stats strong{font-size:28px}.sidebottom small{display:block;margin-top:12px}header{justify-content:space-between}');
await writeFile(path.join(out,'library.json'),JSON.stringify(data));await writeFile(path.join(out,'.nojekyll'),'');
console.log(`Built public-dist: ${data.papers.length} papers, ${data.relations.length} relations`);
