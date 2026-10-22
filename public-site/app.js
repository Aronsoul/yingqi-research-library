'use strict';
const $=id=>document.getElementById(id);
let data={papers:[],projects:[],relations:[],categories:[],resources:[],resourceCategories:[],teams:[]},view='papers',treeZoom=1;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function safeURL(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?esc(u.href):''}catch{return ''}}
function paperURL(p){return safeURL(p.doi?'https://doi.org/'+p.doi:p.url)}
function categoryById(id){return (data.categories||[]).find(c=>c.id===id)}
function categoryPath(id,seen=new Set()){const c=categoryById(id);if(!c)return id||'未分类';if(seen.has(id))return c.name;seen.add(id);return c.parentId?categoryPath(c.parentId,seen)+' / '+c.name:c.name}
function resourceCategory(id){return (data.resourceCategories||[]).find(c=>c.id===id)}
function resourcePath(id,seen=new Set()){const c=resourceCategory(id);if(!c)return '未分类';if(seen.has(id))return c.name;seen.add(id);return c.parentId?resourcePath(c.parentId,seen)+' / '+c.name:c.name}
function depth(c,lookup){let n=0,p=c.parentId,seen=new Set();while(p&&!seen.has(p)){seen.add(p);const par=lookup(p);if(!par)break;n++;p=par.parentId}return n}
function teamNames(item){const ids=item.teamIds|| (item.teamId?[item.teamId]:[]);return ids.map(id=>data.teams.find(t=>t.id===id)?.name).filter(Boolean)}
function paperCard(p){const read=p.read===true,meta=[categoryPath(p.category),p.date,p.type,p.authors,p.summary].filter(Boolean).join(' · ');return `<button type="button" class="resource-row paper-row" data-paper="${esc(p.id)}"><span class="resource-row-main"><strong>${esc(p.title)}</strong><small>${esc(meta||'点击查看文献详情')}</small></span><span class="resource-row-tags"><span>${esc(categoryPath(p.category))}</span><span>${esc(p.type||'文献')}</span><span>${read?'已读':'未读'}</span></span></button>`}
function projectRow(p){const url=safeURL(p.url),meta=[p.category,p.date,p.summary].filter(Boolean).join(' · ');return `<article class="resource-row project-row"><span class="resource-row-main"><strong>${esc(p.title)}</strong><small>${esc(meta||'研究成果')}</small></span><span class="resource-row-tags"><span>${esc(p.category||'成果')}</span>${url?`<a class="project-link-pill" href="${url}" target="_blank" rel="noreferrer">链接 ↗</a>`:'<span>成果</span>'}</span></article>`}
function assetURL(path){return './assets/'+path.replace(/^data\/assets\//,'').split('/').map(encodeURIComponent).join('/')}
function showPaper(id){const p=data.papers.find(item=>item.id===id);if(!p)return;const dialog=$('paper-dialog'),url=paperURL(p),images=(p.images||[]).filter(image=>image.path).map(image=>`<figure><img src="${assetURL(image.path)}" alt="${esc(image.alt||image.fileName||p.title)}" loading="lazy"><figcaption>${esc(image.alt||image.fileName||'')}</figcaption></figure>`).join(''),doi=p.doi?`<p class="resource-file-name">DOI：${esc(p.doi)}</p>`:'',actions=url?`<div class="resource-dialog-actions"><a class="primary" href="${url}" target="_blank" rel="noreferrer">打开文献 ↗</a></div>`:'';dialog.innerHTML=`<div class="resource-dialog-head"><div><span class="resource-dialog-category">${esc(p.type||'未标注文献类型')} · ${esc(categoryPath(p.category))}</span><h2 id="paper-dialog-title">${esc(p.title)}</h2></div><button type="button" class="resource-dialog-close" aria-label="关闭">×</button></div><p class="resource-file-name">${esc([p.authors,p.date,p.read?'已读':'未读'].filter(Boolean).join(' · '))}</p>${p.summary?`<p class="resource-dialog-summary">${esc(p.summary)}</p>`:''}${p.details?`<div class="resource-dialog-details">${esc(p.details)}</div>`:''}${images?`<div class="resource-image-gallery">${images}</div>`:''}${doi}${Array.isArray(p.tags)&&p.tags.length?`<p class="resource-file-name">关键词：${esc(p.tags.join(' · '))}</p>`:p.tags?`<p class="resource-file-name">关键词：${esc(p.tags)}</p>`:''}${actions}`;dialog.showModal();dialog.querySelector('.resource-dialog-close').onclick=()=>dialog.close();dialog.onclick=event=>{if(event.target===dialog)dialog.close()}}
function bindPaperRows(){$('content').querySelectorAll('[data-paper]').forEach(button=>button.onclick=()=>showPaper(button.dataset.paper))}
function resourceCard(r){const category=resourcePath(r.category),kind=r.path?'文件':'链接',images=(r.images||[]).length;return `<button type="button" class="resource-row" data-resource="${esc(r.id)}"><span class="resource-row-main"><strong>${esc(r.title)}</strong><small>${esc([category,r.summary||r.details||''].filter(Boolean).join(' · ')||'点击查看详情')}</small></span><span class="resource-row-tags"><span>${esc(category)}</span><span>${kind}</span>${images?`<span>图片 ${images}</span>`:''}</span></button>`}
function showResource(id){const r=(data.resources||[]).find(item=>item.id===id);if(!r)return;const dialog=$('resource-dialog'),file=r.path?`<a class="primary" href="${assetURL(r.path)}" download="${esc(r.fileName||r.title||'download')}">下载附件 ↓</a>`:'',external=safeURL(r.url)?`<a class="primary" href="${safeURL(r.url)}" target="_blank" rel="noreferrer">打开链接 ↗</a>`:'',images=(r.images||[]).filter(image=>image.path).map(image=>`<figure><img src="${assetURL(image.path)}" alt="${esc(image.alt||image.fileName||r.title)}" loading="lazy"><figcaption>${esc(image.alt||image.fileName||'')}</figcaption></figure>`).join('');dialog.innerHTML=`<div class="resource-dialog-head"><div><span class="resource-dialog-category">${esc(resourcePath(r.category))}</span><h2 id="resource-dialog-title">${esc(r.title)}</h2></div><button type="button" class="resource-dialog-close" aria-label="关闭">×</button></div>${r.summary?`<p class="resource-dialog-summary">${esc(r.summary)}</p>`:''}${r.details?`<div class="resource-dialog-details">${esc(r.details)}</div>`:''}${images?`<div class="resource-image-gallery">${images}</div>`:''}${r.fileName?`<p class="resource-file-name">${esc(r.fileName)}</p>`:''}<div class="resource-dialog-actions">${file}${external}</div>`;dialog.showModal();dialog.querySelector('.resource-dialog-close').onclick=()=>dialog.close();dialog.onclick=event=>{if(event.target===dialog)dialog.close()}}
function bindResourceRows(){$('content').querySelectorAll('[data-resource]').forEach(button=>button.onclick=()=>showResource(button.dataset.resource))}
function teamCard(team){const papers=data.papers.filter(p=>(p.teamIds||[]).includes(team.id)||p.teamId===team.id),resources=(data.resources||[]).filter(r=>(r.teamIds||[]).includes(team.id)||r.teamId===team.id),projects=data.projects.filter(p=>(p.teamIds||[]).includes(team.id)||p.teamId===team.id);const links=[...papers.map(p=>({title:p.title,url:paperURL(p),kind:'文献'})),...resources.map(r=>({title:r.title,url:safeURL(r.url)||(r.path?'./assets/'+r.path.replace(/^data\/assets\//,'').split('/').map(encodeURIComponent).join('/'):'') ,kind:'资料'})),...projects.map(p=>({title:p.title,url:safeURL(p.url),kind:'成果'}))];return `<article class="team-card"><div class="team-head"><div><span class="team-region">${esc(team.region||'地区未填写')}</span><h3>${esc(team.name||team.groupName||'未命名课题组')}</h3><p>${esc(team.institution||'')}</p></div>${team.homepage&&safeURL(team.homepage)?`<a class="team-home" href="${safeURL(team.homepage)}" target="_blank" rel="noreferrer">实验室主页 ↗</a>`:''}</div><div class="team-meta"><span>负责人　${esc(team.leader||'未填写')}</span>${team.department?`<span>${esc(team.department)}</span>`:''}</div>${team.description?`<p class="team-description">${esc(team.description)}</p>`:''}<div class="team-content"><strong>本库收录代表内容 <span>${links.length}</span></strong>${links.length?`<ul>${links.map(x=>`<li><span>${esc(x.kind)}</span>${x.url?`<a href="${x.url}" target="_blank" rel="noreferrer">${esc(x.title)} ↗</a>`:esc(x.title)}</li>`).join('')}</ul>`:'<p>尚未关联论文、资料或成果。</p>'}</div></article>`}
function teamsView(query=''){const teams=(data.teams||[]).filter(t=>JSON.stringify(t).toLowerCase().includes(query)||[...data.papers,...(data.resources||[]),...data.projects].some(x=>((x.teamIds||[]).includes(t.id)||x.teamId===t.id)&&JSON.stringify(x).toLowerCase().includes(query)));if(!teams.length)return `<div class="empty"><h3>${(data.teams||[]).length?'没有匹配的研究团队':'研究团队信息待添加'}</h3><p>在资料管理中添加地区、机构、课题组名称和负责人，并将论文或资料关联到团队。</p><a class="primary" href="./admin.html">打开资料管理 ↗</a></div>`;const groups=new Map();for(const t of teams){const region=t.region||'地区未填写';if(!groups.has(region))groups.set(region,[]);groups.get(region).push(t)}return [...groups].sort(([a],[b])=>a.localeCompare(b)).map(([region,items])=>`<section class="region-group"><h2>${esc(region)} <span>${items.length} 个团队</span></h2><div class="team-list">${items.map(teamCard).join('')}</div></section>`).join('')}
function tree(){const papers=new Map(data.papers.map(p=>[p.id,p])),ids=new Set([...(data.treeNodes||[]),...data.relations.flatMap(r=>[r.from,r.to])].filter(id=>papers.has(id)));if(!ids.size)return '<div class="literature-tree"><div class="empty"><h3>研究脉络，等待逐步构建</h3><p>可在资料管理中添加文献，再通过“关联连线”构建关系。</p><a class="primary" href="./admin.html">打开资料管理 ↗</a></div></div>';const edges=data.relations.filter(r=>ids.has(r.from)&&ids.has(r.to)),incoming=new Set(edges.map(r=>r.to)),roots=[...ids].filter(id=>!incoming.has(id)),seen=new Set();function visit(id){if(seen.has(id))return;seen.add(id);edges.filter(r=>r.from===id).forEach(r=>visit(r.to))}roots.forEach(visit);for(const id of ids)if(!seen.has(id)){roots.push(id);visit(id)}function branch(id,path,edge){const p=papers.get(id),children=edges.filter(r=>r.from===id),cycle=path.has(id),next=new Set(path).add(id),u=paperURL(p);return `<li>${edge?`<div class="tree-edge">${esc(edge.label||'研究延伸')}</div>`:''}<article class="tree-paper"><span class="tree-year">${esc(p.date?.slice(0,4))}</span><h3>${esc(p.title)}</h3><p>${esc(p.summary||'暂无简介')}</p>${u?`<a href="${u}" target="_blank" rel="noreferrer">打开文献 ↗</a>`:''}</article>${!cycle&&children.length?`<ul>${children.map(r=>branch(r.to,next,r)).join('')}</ul>`:''}</li>`}return `<div class="literature-tree"><div class="tree-toolbar"><div><strong>知识图谱</strong><span>指向节点滚轮缩放；Ctrl / ⌘ + 滚轮可在任意位置缩放</span></div><div class="tree-zoom" aria-label="知识图谱缩放控件"><button type="button" data-tree-zoom="out" aria-label="缩小知识图谱">−</button><output class="tree-zoom-level" aria-live="polite">100%</output><button type="button" data-tree-zoom="in" aria-label="放大知识图谱">+</button><button type="button" data-tree-zoom="reset">重置</button></div></div><div class="tree-scroll"><div class="tree-stage"><ul class="tree-roots">${roots.map(id=>branch(id,new Set())).join('')}</ul></div></div></div>`}
function bindTreeZoom(){
const scroll=$('content').querySelector('.tree-scroll');
const stage=$('content').querySelector('.tree-stage');
const canvas=$('content').querySelector('.tree-roots');
const level=$('content').querySelector('.tree-zoom-level');
const out=$('content').querySelector('[data-tree-zoom="out"]');
const inn=$('content').querySelector('[data-tree-zoom="in"]');
if(!scroll||!stage||!canvas)return;
const minZoom=.1,maxZoom=3;
const apply=()=>{
stage.style.width=(canvas.offsetWidth*treeZoom)+'px';
stage.style.height=(canvas.offsetHeight*treeZoom)+'px';
canvas.style.transformOrigin='top left';
canvas.style.transform='scale('+treeZoom+')';
level.textContent=Math.round(treeZoom*100)+'%';
out.disabled=treeZoom<=minZoom;
inn.disabled=treeZoom>=maxZoom
};
const zoomAt=(next,x,y)=>{
next=Math.max(minZoom,Math.min(maxZoom,next));
const before=canvas.getBoundingClientRect();
const pointX=(x-before.left)/treeZoom;
const pointY=(y-before.top)/treeZoom;
treeZoom=next;
apply();
const after=canvas.getBoundingClientRect();
scroll.scrollLeft+=after.left+pointX*treeZoom-x;
scroll.scrollTop+=after.top+pointY*treeZoom-y
};
const zoomFromButton=direction=>{
const rect=scroll.getBoundingClientRect();
const factor=direction==='in'?1.2:1/1.2;
zoomAt(Math.round(treeZoom*factor*100)/100,rect.left+scroll.clientWidth/2,rect.top+scroll.clientHeight/2)
};
out.addEventListener('click',()=>zoomFromButton('out'));
inn.addEventListener('click',()=>zoomFromButton('in'));
$('content').querySelector('[data-tree-zoom="reset"]').addEventListener('click',()=>{
const rect=scroll.getBoundingClientRect();
zoomAt(1,rect.left+scroll.clientWidth/2,rect.top+scroll.clientHeight/2)
});
scroll.addEventListener('wheel',event=>{
const overNode=event.target.closest('.tree-paper,.tree-edge');
if(!event.ctrlKey&&!event.metaKey&&!overNode)return;
event.preventDefault();
zoomAt(treeZoom*Math.exp(-event.deltaY*.002),event.clientX,event.clientY)
},{passive:false});
apply()
}
function populateFilters(){const categories=data.categories||[],yrs=[...new Set(data.papers.map(p=>String(p.date||'').slice(0,4)).filter(y=>/^\d{4}$/.test(y)))].sort().reverse();$('category').innerHTML='<option value="">全部分类</option>'+categories.map(c=>`<option value="${esc(c.id)}">${'　'.repeat(depth(c,categoryById))}${esc(c.name)}</option>`).join('');$('year-options').innerHTML=yrs.map(y=>`<option value="${esc(y)}"></option>`).join('')}
function render(){
const isTree=view==='tree',isTeams=view==='teams',isResources=view==='resources',isPapers=view==='papers';
$('filters').hidden=isTree;
$('category-filter').hidden=isTree||isTeams;
$('type-filter').hidden=!isPapers;
$('year-filter').hidden=isTree||isResources||isTeams;
$('content-title').textContent=isResources?'资料库':view==='projects'?'研究成果':isTree?'知识图谱':isTeams?'研究团队':'文献库';
$('query').placeholder=isResources?'标题、分类或简介':isTeams?'团队、地区、负责人或团队内容':'标题、作者、关键词或简介';
const categoryKey=isResources?'resourceCategories':'categories',categoryRows=data[categoryKey]||[],lookup=id=>categoryRows.find(c=>c.id===id),selectedCategory=$('category').value;
$('category').innerHTML='<option value="">全部分类</option>'+categoryRows.map(c=>'<option value="'+esc(c.id)+'">'+ '　'.repeat(depth(c,lookup))+esc(c.name)+'</option>').join('');
$('category').value=selectedCategory;
const types=[...new Set(data.papers.map(p=>p.type).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'zh-CN')),selectedType=$('type').value;
$('type').innerHTML='<option value="">全部类型</option>'+types.map(t=>'<option value="'+esc(t)+'">'+esc(t)+'</option>').join('');
$('type').value=selectedType;
const q=$('query').value.trim().toLowerCase();
if(isTeams){$('content').innerHTML=teamsView(q);return}
if(isTree){$('content').innerHTML=tree();bindTreeZoom();return}
const category=$('category').value,year=$('year').value.trim(),sort=$('sort').value,type=$('type').value;
let rows=isResources?(data.resources||[]):view==='projects'?data.projects:data.papers;
if(category){const descendants=new Set(categoryRows.filter(c=>{let p=c;const seen=new Set();while(p&&!seen.has(p.id)){if(p.id===category)return true;seen.add(p.id);p=lookup(p.parentId)}return false}).map(c=>c.id));rows=rows.filter(p=>descendants.has(p.category)||p.category===category)}
rows=rows.filter(p=>JSON.stringify(p).toLowerCase().includes(q)&&(!year||String(p.date||'').startsWith(year))&&(!isPapers||!type||p.type===type)).slice().sort((a,b)=>sort==='title'?(a.title||'').localeCompare(b.title||''):sort==='old'?(a.date||'').localeCompare(b.date||''):(b.date||'').localeCompare(a.date||''));
$('content').innerHTML=rows.length?'<div class="'+(isResources||isPapers||view==='projects'?'resource-list':'cards')+'">'+rows.map(isResources?resourceCard:isPapers?paperCard:projectRow).join('')+'</div>':'<div class="empty"><h3>暂无匹配内容</h3><p>可在资料管理中添加'+(isResources?'链接或文件。':'文献或成果。')+'</p>'+(isResources?'<a class="primary" href="./admin.html">打开资料管理 ↗</a>':'')+'</div>'
if(isResources)bindResourceRows();if(isPapers)bindPaperRows();
}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x===b));$('query').value='';$('category').value='';$('year').value='';$('type').value='';render()});
$('query').oninput=render;['category','type','year','sort'].forEach(id=>$(id).oninput=render);
fetch('./library.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('资料读取失败，请刷新重试');return r.json()}).then(x=>{data={...data,...x};data.categories||=[];data.resourceCategories||=[];data.resources||=[];populateFilters();$('stats').innerHTML=[['收藏文献',data.papers.length],['文献关联',data.relations.length],['研究成果',data.projects.length],['资料文件/链接',data.resources.length],['研究团队',data.teams.length]].map(([label,n])=>`<div><label>${label}</label><strong>${n}</strong></div>`).join('');$('status').textContent='';render()}).catch(e=>$('status').textContent=e.message);
