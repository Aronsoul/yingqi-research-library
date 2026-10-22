import service from '../worker.mjs';
export default {async fetch(request){const url=new URL(request.url),route=url.searchParams.get('route');if(!['login','callback','session','library','logout'].includes(route))return Response.json({error:'未找到接口'},{status:404});url.pathname='/'+route;url.searchParams.delete('route');return service.fetch(new Request(url,request),process.env)}};
