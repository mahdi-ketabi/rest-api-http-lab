import http from 'node:http';import {readFile} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {ProductStore} from './store.mjs';
const PUBLIC=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
const STATIC=new Map([['/','index.html'],['/index.html','index.html'],['/styles.css','styles.css'],['/app.js','app.js']]);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
export function createApp(store=new ProductStore()){
 return http.createServer(async (req,res)=>{
  const url=new URL(req.url,'http://localhost');const pathname=url.pathname;
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');
  const json=(status,payload,headers={})=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8',...headers});res.end(JSON.stringify(payload))};
  const error=(status,message,extra={})=>json(status,{error:message,...extra});
  const methodNotAllowed=allow=>{res.setHeader('Allow',allow);error(405,'این Method برای این مسیر مجاز نیست.')};
  const readJson=()=>new Promise((resolve,reject)=>{let size=0;const buffers=[];req.on('data',chunk=>{size+=chunk.length;if(size>16_384){reject({status:413,message:'بدنه بیش از ۱۶ کیلوبایت است.'});req.destroy();return}buffers.push(chunk)});req.on('end',()=>{if(!/^application\/json(?:\s*;|\s*$)/i.test(req.headers['content-type']??'')){reject({status:415,message:'Content-Type باید application/json باشد.'});return}try{resolve(JSON.parse(Buffer.concat(buffers).toString('utf8')))}catch{reject({status:400,message:'JSON نامعتبر است.'})}});req.on('error',reject)});
  if(pathname==='/api/health'){if(req.method!=='GET')return methodNotAllowed('GET');return json(200,{status:'ok',service:'REST API & HTTP Lab',storage:'in-memory'})}
  if(pathname==='/api/demo-error'){if(req.method!=='GET')return methodNotAllowed('GET');return error(500,'این خطا برای آموزش شبیه‌سازی شده است.')}
  if(pathname==='/api/demo-slow'){if(req.method!=='GET')return methodNotAllowed('GET');const ms=Math.max(0,Math.min(5000,Number(url.searchParams.get('ms'))||2000));await new Promise(resolve=>setTimeout(resolve,ms));if(!res.destroyed)return json(200,{message:'پاسخ با تأخیر',delayMs:ms});return}
  if(pathname==='/api/reset'){if(req.method!=='POST')return methodNotAllowed('POST');return json(200,{message:'داده‌های آزمایشی بازنشانی شدند.',items:store.reset()})}
  if(pathname==='/api/products'){
   if(req.method==='GET')return json(200,{items:store.list(),count:store.list().length});
   if(req.method==='POST'){try{const body=await readJson();const result=store.create(body);if(result.error)return error(400,result.error);return json(201,result.item,{'Location':`/api/products/${result.item.id}`})}catch(e){if(!res.destroyed)return error(e.status||500,e.message||'خطای سرور')}return}
   return methodNotAllowed('GET, POST');
  }
  const match=/^\/api\/products\/([^/]+)$/.exec(pathname);
  if(match){const id=Number(match[1]);if(!Number.isSafeInteger(id)||id<1)return error(400,'شناسه باید عدد صحیح مثبت باشد.');
   if(req.method==='GET'){const item=store.find(id);return item?json(200,item):error(404,'محصول پیدا نشد.')}
   if(req.method==='DELETE'){if(!store.delete(id))return error(404,'محصول پیدا نشد.');res.writeHead(204);res.end();return}
   if(req.method==='PUT'||req.method==='PATCH'){try{const body=await readJson();const result=store.update(id,body,req.method==='PATCH');if(result.error)return error(400,result.error);if(result.missing)return error(404,'محصول پیدا نشد.');return json(200,result.item)}catch(e){if(!res.destroyed)return error(e.status||500,e.message||'خطای سرور')}return}
   return methodNotAllowed('GET, PUT, PATCH, DELETE');
  }
  if(pathname.startsWith('/api/'))return error(404,'مسیر API پیدا نشد.');
  if(req.method!=='GET'&&req.method!=='HEAD')return methodNotAllowed('GET, HEAD');
  if(!STATIC.has(pathname)){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');return}
  const file=path.join(PUBLIC,STATIC.get(pathname));try{const body=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]});res.end(req.method==='HEAD'?undefined:body)}catch{res.writeHead(500).end('Internal server error')}
 })
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT)||5600;createApp().listen(port,'127.0.0.1',()=>console.log(`HTTP Lab: http://localhost:${port}`));
}
