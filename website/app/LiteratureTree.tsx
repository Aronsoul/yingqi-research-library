'use client';
import {useState} from 'react';
import {Plus,Network,X,ArrowUpRight,ArrowLeft,Trash2} from 'lucide-react';
type Props={data:any;save:(data:any)=>Promise<boolean>;busy:boolean};
type Scope={major:string;subcategory?:string};
const GROUPS=[
 {id:'imaging',name:'成像方法',categories:['三维断层','多层重建','电子叠层成像','单次曝光','傅里叶叠层成像','布拉格叠层成像','近场叠层成像','偏振成像','扫描与采集']},
 {id:'algorithm',name:'算法与重建',categories:['算法与计算','学习辅助重建']},
 {id:'applications',name:'应用领域',categories:['集成电路','材料应用','生物应用']},
 {id:'literature',name:'文献整理',categories:['综述','待核验']}
];
const categoryOf=(paper:any)=>String(paper?.category||'未分类').trim()||'未分类';
export default function LiteratureTree({data,save,busy}:Props){
 const [scope,setScope]=useState<Scope|null>(null),[adding,A]=useState(false),[parent,P]=useState(''),[paper,S]=useState(''),[label,L]=useState(''),[error,E]=useState(''),[nodeDialog,ND]=useState(''),[addingNode,AN]=useState(false),[nodeToAdd,NTA]=useState('');
 const papers=new Map<string,any>(data.papers.map((p:any)=>[p.id,p]));
 const categories=[...new Set<string>(data.papers.map((p:any)=>categoryOf(p)))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
 const assigned=new Set(GROUPS.flatMap(g=>g.categories));
 const groups:any[]=GROUPS.map(g=>({...g,categories:categories.filter(c=>g.categories.includes(c))})).filter(g=>g.categories.length);
 const extra=categories.filter(c=>!assigned.has(c));
 if(extra.length)groups.push({id:'other',name:'其他分类',categories:extra});
 const activeGroup=scope?groups.find(g=>g.id===scope.major):null;
 const activeCategories=scope?(scope.subcategory?[scope.subcategory]:(activeGroup?.categories||[])):[];
 const categorySet=new Set(activeCategories);
 const excludedIds=new Set<string>(data.treeExcludedNodes||[]);
 const allScopedPapers=scope?data.papers.filter((p:any)=>categorySet.has(categoryOf(p))):[];
 const scopedPapers=allScopedPapers.filter((p:any)=>!excludedIds.has(p.id));
 const ids=new Set<string>(scopedPapers.map((p:any)=>p.id));
 const edges=data.relations.filter((r:any)=>ids.has(r.from)&&ids.has(r.to));
 const incoming=new Set<string>(edges.map((r:any)=>r.to));
 const roots=[...ids].filter(id=>!incoming.has(id));
 // Keep imported cyclic components visible without recursing forever.
 const covered=new Set<string>();
 function visit(id:string){if(covered.has(id))return;covered.add(id);edges.filter((r:any)=>r.from===id).forEach((r:any)=>visit(r.to))}
 roots.forEach(visit);for(const id of ids)if(!covered.has(id)){roots.push(id);visit(id)}
 function add(from:string){ND('');P(from);S('');L('');E('');A(true)}
 async function removeNode(id:string){const excluded=[...new Set<string>([...(data.treeExcludedNodes||[]),id])];const saved=await save({...data,treeExcludedNodes:excluded});if(saved)ND('')}
 async function restoreNode(id:string){const saved=await save({...data,treeExcludedNodes:(data.treeExcludedNodes||[]).filter((x:string)=>x!==id)});if(saved){NTA('');AN(false)}}
 async function submit(e:any){
  e.preventDefault();
  if(!scope||!ids.has(parent))return E('请先选择有效的图谱范围和上级文献');
  if(!ids.has(paper))return E('请选择当前范围内的关联文献');
  if(parent===paper)return E('请选择不同的文献');
  if(data.relations.some((r:any)=>r.from===parent&&r.to===paper))return E('这两篇文献已有连线');
  if(data.relations.some((r:any)=>r.to===paper))return E('该文献已有上级，请先删除原连线');
  const seen=new Set<string>();
  const reachesParent=(id:string):boolean=>{
   if(id===parent)return true;
   if(seen.has(id))return false;
   seen.add(id);
   return data.relations.filter((r:any)=>r.from===id).some((r:any)=>reachesParent(r.to));
  };
  if(reachesParent(paper))return E('该关联会形成循环，请调整上下级文献');
  const saved=await save({...data,relations:[...data.relations,{id:crypto.randomUUID(),from:parent,to:paper,label:label.trim()}]});
  if(saved)A(false);
 }
 function branch(id:string,path:Set<string>,edge?:any):any{
  const p=papers.get(id);if(!p)return null;
  const loop=path.has(id),next=new Set(path).add(id);
  return <li key={edge?.id||id} className={edge?'tree-relation-node':undefined}>
   {edge&&<div className="tree-edge-wrap"><span className="tree-edge-line tree-edge-line-before" aria-hidden="true"/><div className="tree-edge">{edge.label||'研究延伸'}</div><span className="tree-edge-line tree-edge-line-after" aria-hidden="true"/></div>}
   <article className="tree-paper tree-paper-interactive" role="button" tabIndex={0} aria-label={'管理图谱节点：'+p.title} onClick={()=>ND(id)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();ND(id)}}}><span className="tree-year">{p.date?.slice(0,4)||'年份待补充'}</span><h3>{p.title}</h3><p>{p.summary||'暂无简介'}</p><div className="tree-actions">{p.url&&<a href={p.url} target="_blank" rel="noreferrer" onClick={event=>event.stopPropagation()}>打开文献 <ArrowUpRight size={12}/></a>}<button disabled={busy||!scope} onClick={event=>{event.stopPropagation();ND(id)}}><Network size={12}/>节点操作</button></div>{loop&&<small>循环关联已停止展开</small>}</article>
   {!loop&&edges.some((r:any)=>r.from===id)&&<ul>{edges.filter((r:any)=>r.from===id).map((r:any)=>branch(r.to,next,r))}</ul>}
  </li>
 }
 const paperCount=(category:string)=>data.papers.filter((p:any)=>categoryOf(p)===category).length;
 return <div className="literature-tree">
  <div className="tree-toolbar"><div><Network size={17}/><strong>知识图谱</strong><span>先选大类或子类，再加载对应文献图谱</span></div></div>
  {!scope?<div className="tree-category-overview">
   {groups.length?groups.map(group=>{
    const groupPapers=data.papers.filter((p:any)=>group.categories.includes(categoryOf(p)));
    return <section className="tree-category-group" key={group.id}>
     <div className="tree-category-group-head"><div><strong>{group.name}</strong><small>{group.categories.length} 个子类 · {groupPapers.length} 篇文献</small></div><button className="primary" onClick={()=>setScope({major:group.id})}>查看整个大类图谱</button></div>
     <div className="tree-subcategories">{group.categories.map((category:string)=><button className="tree-subcategory" key={category} onClick={()=>setScope({major:group.id,subcategory:category})}><span>{category}<small>{paperCount(category)} 篇文献</small></span><ArrowUpRight size={14}/></button>)}</div>
    </section>
   }):<div className="empty"><Network size={38}/><h3>文献库中还没有分类</h3><p>为文献设置分类后，这里会自动显示对应的大类和子类。</p></div>}
  </div>:<>
   <div className="tree-scope-toolbar">
    <button className="tree-back" onClick={()=>setScope(null)}><ArrowLeft size={14}/>返回分类总览</button>
    <div className="tree-scope-switch" aria-label="切换图谱范围">
     <button className={!scope.subcategory?'selected':''} onClick={()=>setScope({major:scope.major})}>整个大类</button>
     {activeGroup?.categories.map((category:string)=><button key={category} className={scope.subcategory===category?'selected':''} onClick={()=>setScope({major:scope.major,subcategory:category})}>{category}</button>)}
    </div>
    <span className="tree-scope-count">{scope.subcategory?scope.subcategory:activeGroup?.name||'分类'} · {scopedPapers.length} 个节点 · {edges.length} 条关联</span>
    <button className="tree-add-node" disabled={busy||!allScopedPapers.some((p:any)=>excludedIds.has(p.id))} onClick={()=>{NTA('');AN(true)}}><Plus size={13}/>添加图谱节点</button>
   </div>
   {!scopedPapers.length?<div className="empty"><Network size={38}/><h3>{allScopedPapers.length?'当前范围的节点已全部隐藏':'该分类下暂无文献'}</h3><p>{allScopedPapers.length?'可通过上方“添加图谱节点”恢复文献；文献仍保留在文献库。':'为文献添加或修改分类后，这里会自动更新。'}</p></div>:<>
    <div className="tree-scroll"><ul className="tree-roots">{roots.map(id=>branch(id,new Set()))}</ul></div>
    <p className="tree-hint">图谱默认显示当前范围内的全部文献。点击节点可添加关联或从图谱中隐藏；隐藏不会删除文献，已隐藏节点可随时恢复。</p>
    <details className="tree-links"><summary>管理当前范围的关联（{edges.length}）</summary>{edges.length?edges.map((r:any)=><div key={r.id}><span>{papers.get(r.from)?.title} → {papers.get(r.to)?.title}<small>{r.label}</small></span><button disabled={busy} onClick={()=>{if(confirm('删除这条连线？文献会继续保留在对应分类图谱中。'))save({...data,relations:data.relations.filter((x:any)=>x.id!==r.id)})}}>删除连线</button></div>):<p className="muted">当前范围还没有关联。</p>}</details>
   </>}
  </>}

  {nodeDialog&&papers.has(nodeDialog)&&<div className="overlay"><div className="dialog tree-node-dialog"><button className="close" onClick={()=>ND('')} aria-label="关闭"><X/></button><p className="eyebrow">知识图谱节点</p><h2>{papers.get(nodeDialog)?.title}</h2><p className="muted">{categoryOf(papers.get(nodeDialog))} · {papers.get(nodeDialog)?.date?.slice(0,4)||'年份待补充'}</p><div className="tree-node-options"><button className="primary" onClick={()=>add(nodeDialog)}><Plus size={15}/>添加关联文献</button><button className="danger" disabled={busy} onClick={()=>{if(confirm('仅从当前知识图谱中隐藏此节点？文献及其关联数据仍会保留，可随时恢复。'))removeNode(nodeDialog)}}><Trash2 size={15}/>从图谱移除节点</button></div><p className="muted">移除只影响知识图谱显示，不会删除文献库中的记录。</p></div></div>}
  {addingNode&&<div className="overlay"><div className="dialog"><button className="close" onClick={()=>AN(false)} aria-label="关闭"><X/></button><p className="eyebrow">知识图谱节点</p><h2>添加图谱节点</h2><form onSubmit={e=>{e.preventDefault();if(nodeToAdd)restoreNode(nodeToAdd)}}><label>选择当前范围内已隐藏的文献<select required value={nodeToAdd} onChange={e=>NTA(e.target.value)}><option value="">请选择文献</option>{allScopedPapers.filter((p:any)=>excludedIds.has(p.id)).map((p:any)=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label><p className="muted">文献必须属于当前选择的分类范围；也可先在文献库中调整分类。</p><div className="actions"><button type="button" onClick={()=>AN(false)}>取消</button><button className="primary" disabled={busy||!nodeToAdd}>{busy?'保存中…':'添加节点'}</button></div></form></div></div>}
  {adding&&<div className="overlay"><div className="dialog"><button className="close" onClick={()=>A(false)} aria-label="关闭"><X/></button><p className="eyebrow">知识图谱</p><h2>添加文献关联</h2><form onSubmit={submit}><label>上级文献<input readOnly value={papers.get(parent)?.title||''}/></label><label>关联文献<select required value={paper} onChange={e=>S(e.target.value)}><option value="">请选择当前范围内的文献</option>{scopedPapers.filter((p:any)=>p.id!==parent&&!data.relations.some((r:any)=>r.to===p.id)).map((p:any)=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label><label>关系说明<input value={label} onChange={e=>L(e.target.value)} placeholder="如：方法改进、引入多层模型…"/></label>{error&&<p role="alert">{error}</p>}<p className="muted">只会在当前分类范围内建立关联。</p><div className="actions"><button type="button" onClick={()=>A(false)}>取消</button><button className="primary" disabled={busy}>{busy?'保存中…':'保存关联'}</button></div></form></div></div>}
 </div>
}
