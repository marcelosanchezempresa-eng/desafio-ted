// Servidor de prueba: imita la API de Supabase sobre el PostgreSQL local, con las reglas RLS reales.
// Sirve docs/ y un cliente falso de supabase-js (mock-supabase.js) que habla con este servidor.
const http=require("http"),fs=require("fs"),path=require("path");const {Pool}=require("pg");
const pool=new Pool({host:"/var/lib/postgresql/j26test",port:55432,user:"postgres",database:"postgres"});
const DOCS="/home/user/desafio-ted/docs";const subs=new Set();
const TABLES=new Set(["docentes","config","clases","hitos"]);const COL=/^[a-z_]+$/;
async function como(email,fn){const c=await pool.connect();try{await c.query("begin");
  await c.query("select set_config('request.jwt.claims',$1,true)",[email?JSON.stringify({email}):""]);
  await c.query(email?"set local role authenticated":"set local role anon");
  const r=await fn(c);await c.query("commit");return r}catch(e){await c.query("rollback").catch(()=>{});throw e}finally{c.release()}}
async function emitir(table,ev,row){const m="data: "+JSON.stringify({table,eventType:ev,new:row,old:row})+"\n\n";for(const s of subs)s.write(m)}
async function q(b){const {email,table,op,payload,filters=[],order,limit}=b;if(!TABLES.has(table))throw new Error("tabla");
  const w=[],vals=[];for(const [col,v] of filters){if(!COL.test(col))throw new Error("col");vals.push(v);w.push(`${col}=$${vals.length}`)}
  const where=w.length?" where "+w.join(" and "):"";
  return como(email,async c=>{
    if(op==="select"){let sql=`select * from public.${table}${where}`;if(order&&COL.test(order.col))sql+=` order by ${order.col} ${order.asc?"asc":"desc"}`;if(limit)sql+=` limit ${+limit}`;
      return (await c.query(sql,vals)).rows.map(fix)}
    const rows=Array.isArray(payload)?payload:[payload];let out=[];
    for(const p of rows){const ks=Object.keys(p||{}).filter(k=>COL.test(k));const pv=ks.map(k=>typeof p[k]==="object"&&p[k]!==null?JSON.stringify(p[k]):p[k]);
      if(op==="insert"||op==="upsert"){const pk=table==="docentes"?"email":"id";
        let sql=`insert into public.${table}(${ks.join(",")}) values(${ks.map((_,i)=>"$"+(i+1)).join(",")})`;
        if(op==="upsert")sql+=` on conflict (${pk}) do update set ${ks.filter(k=>k!==pk).map(k=>`${k}=excluded.${k}`).join(",")}`;
        out=out.concat((await c.query(sql+" returning *",pv)).rows)}
      else if(op==="update"){const set=ks.map((k,i)=>`${k}=$${vals.length+i+1}`).join(",");out=out.concat((await c.query(`update public.${table} set ${set}${where} returning *`,[...vals,...pv])).rows)}}
    if(op==="delete")out=(await c.query(`delete from public.${table}${where} returning *`,vals)).rows;
    return {rows:out.map(fix),op}})}
const fix=r=>{for(const k in r)if(r[k] instanceof Date)r[k]=k==="fecha"?r[k].toISOString().slice(0,10):r[k].toISOString();return r};
async function rpc(b){const {email,fn,args}=b;
  return como(email,async c=>{
    if(fn==="mi_perfil")return (await c.query("select public.mi_perfil() as r")).rows[0].r;
    if(fn==="evaluar_clase"){await c.query("select public.evaluar_clase($1,$2,$3,$4)",[args.p_id,args.p_fecha,args.p_comp,JSON.stringify(args.p_cambios)]);return {id:args.p_id,table:"clases"}}
    if(fn==="evaluar_hito"){await c.query("select public.evaluar_hito($1,$2)",[args.p_id,JSON.stringify(args.p_cambios)]);return {id:args.p_id,table:"hitos"}}
    throw new Error("fn")})}
async function reemitir(table,id){const r=(await pool.query(`select * from public.${table} where ${table==="docentes"?"email":"id"}=$1`,[id])).rows[0];if(r)emitir(table,"UPDATE",fix(r))}
http.createServer(async(req,res)=>{
  if(req.url==="/events"){res.writeHead(200,{"content-type":"text/event-stream","cache-control":"no-cache"});res.write(":ok\n\n");subs.add(res);req.on("close",()=>subs.delete(res));return}
  if(req.method==="POST"){let body="";req.on("data",d=>body+=d);req.on("end",async()=>{const b=JSON.parse(body);
    try{await new Promise(r=>setTimeout(r,150));let data;
      if(req.url==="/rpc"){data=await rpc(b);if(data&&data.table){await reemitir(data.table,data.id);data=null}}
      else{const r=await q(b);if(b.op==="select")data=r;else{data=r.rows;for(const row of r.rows)if(b.table!=="docentes")emitir(b.table,b.op==="delete"?"DELETE":"UPDATE",row)}}
      res.writeHead(200,{"content-type":"application/json"});res.end(JSON.stringify({data}))}
    catch(e){res.writeHead(200,{"content-type":"application/json"});res.end(JSON.stringify({error:{message:e.message,code:e.code}}))}});return}
  let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const file=f==="/mock-supabase.js"?path.join(__dirname,"mock-supabase.js"):f==="/config.js"?path.join(__dirname,"config-test.js"):path.join(DOCS,path.normalize(f));
  fs.readFile(file,(e,d)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{"content-type":file.endsWith(".js")?"text/javascript":"text/html; charset=utf-8"});res.end(d)})
}).listen(8765,()=>console.log("listo en 8765"));
