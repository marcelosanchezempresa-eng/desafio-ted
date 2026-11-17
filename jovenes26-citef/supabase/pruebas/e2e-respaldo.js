const {chromium}=require("playwright");const {Pool}=require("pg");const fs=require("fs");const {execFileSync}=require("child_process");
const pool=new Pool({host:"/var/lib/postgresql/j26test",port:55432,user:"postgres",database:"postgres"});
const MOCK=fs.readFileSync(__dirname+"/mock-supabase.js","utf8");const OUT=__dirname+"/../ux/";
(async()=>{
await pool.query("truncate clases,hitos,juicios");
// 1200 clases para probar la paginación (más de 1000 filas)
for(let i=0;i<1200;i++){const f=new Date(Date.UTC(2026,9,13)+i*86400000).toISOString().slice(0,10);
  await pool.query("insert into clases(id,fecha,comp,ev,autor) values($1,$2,'lectoescritura',$3,'lect@ej.uy')",[f+"_x"+i,f,JSON.stringify({e0:{as:"v",obs:"Comillas 'simples' y $j26$ adentro"},e1:{as:"r"}})]);}
await pool.query("insert into hitos(id,comp,nombre,fecha,ev) values('h1','lectoescritura','Carta','2026-11-20','{\"e0\":{\"l\":\"v\"}}')");
await pool.query("insert into juicios(id,instancia,comp,sujeto,nivel,logros,nota,rubrica,autor) values('i1|lectoescritura|e0','i1','lectoescritura','e0','a','Línea 1\nLínea 2',8,'{\"ca\":\"l\"}','lect@ej.uy')");
const H=(t,k)=>`(select md5(string_agg((to_jsonb(t)-'creado_en'-'editado_en')::text||coalesce(date_trunc('milliseconds',(to_jsonb(t)->>'creado_en')::timestamptz)::text,'')||coalesce(date_trunc('milliseconds',(to_jsonb(t)->>'editado_en')::timestamptz)::text,''),'|' order by ${k})) from ${t} t) ${t}`;
const huella=async()=>(await pool.query(`select ${H("clases","id")},${H("hitos","id")},${H("juicios","id")},${H("docentes","email")},(select md5(data::text) from config) g`)).rows[0];
const antes=await huella();
const b=await chromium.launch();const errs=[];let fa=0;const ok=(c,m)=>{console.log((c?"  OK  ":"  FALLA ")+m);if(!c)fa++};
async function abrir(email,w=1280){const ctx=await b.newContext({viewport:{width:w,height:900},locale:"es-UY",acceptDownloads:true});
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/@supabase/,r=>r.fulfill({contentType:"text/javascript",body:MOCK}));
  await ctx.addInitScript(e=>{try{localStorage.clear();localStorage.setItem("mockEmail",e)}catch(x){}},email);
  const p=await ctx.newPage();p.on("pageerror",e=>errs.push(e.message));await p.goto("http://localhost:8765/");await p.waitForTimeout(1500);return p}
const C=await abrir("coord@ej.uy");await C.click("[data-tab=config]");await C.waitForTimeout(500);
console.log("1) Quitar pide confirmación");
await C.locator("#c-mod .cfg-item").nth(0).locator("[data-del]").click();
ok((await C.locator("#c-mod .cfg-item").count())===2,"tocar ✕ no borra: sigue habiendo 2 módulos");
ok((await C.textContent("#c-status")).includes("¿Quitar «Módulo 1»?"),"pregunta: «"+await C.textContent("#c-status")+"»");
await C.click("#c-mod [data-del-no]");ok((await C.locator("#c-mod .cfg-item").count())===2,"«No» cancela");
await C.locator("#c-mod .cfg-item").nth(0).locator("[data-del]").click();await C.click("#c-mod [data-del-si]");
ok((await C.locator("#c-mod .cfg-item").count())===1,"«Sí, quitar» lo saca de la lista");
ok(await C.isVisible("#c-discard"),"aparece «Descartar cambios»");
console.log("2) Los cambios sin guardar no se pierden si otro docente guarda");
const L=await abrir("lect@ej.uy",430);await L.selectOption("#r-comp","lectoescritura");await L.waitForTimeout(300);
await L.locator(".stu-head").nth(3).click();await L.locator(".stu[open-card] .dim[data-k=as] .lvl[data-l=v]").click();await L.waitForTimeout(2500);
ok((await C.locator("#c-mod .cfg-item").count())===1,"después de que otro guardó, el módulo sigue quitado (borrador intacto)");
await C.click("#c-discard");await C.waitForTimeout(300);
ok((await C.locator("#c-mod .cfg-item").count())===2&&!(await C.isVisible("#c-discard")),"«Descartar cambios» recupera el módulo");
ok((await pool.query("select jsonb_array_length(data->'modulos') n from config")).rows[0].n===2,"la base nunca perdió los módulos");
console.log("3) Respaldo");
await L.click("[data-tab=config]");ok(!(await L.isVisible("#c-respaldo-panel")),"un docente no ve el respaldo");
const antes2=await huella();
const [d]=await Promise.all([C.waitForEvent("download",{timeout:30000}),C.click("#c-respaldo")]);const f=OUT+d.suggestedFilename();await d.saveAs(f);
ok(/^respaldo-jovenes26-\d{4}-\d\d-\d\d\.sql$/.test(d.suggestedFilename()),"archivo: "+d.suggestedFilename()+" ("+Math.round(fs.statSync(f).size/1024)+" KB)");
console.log("   ",await C.textContent("#c-respaldo-status"));
console.log("4) Borrar todo y restaurar desde el archivo");
await pool.query("truncate clases,hitos,juicios,docentes; update config set data='{}'");
const r=execFileSync("su",["postgres","-c",`psql -v ON_ERROR_STOP=1 -q -h /var/lib/postgresql/j26test -p 55432 -f -`],{input:fs.readFileSync(f)}).toString();console.log("   ",r.trim().split("\n").slice(-3).join(" / "));
const desp=await huella();ok(JSON.stringify(desp)===JSON.stringify(antes2),"la base restaurada es idéntica (fechas de registro al milisegundo; la prueba local recorta los microsegundos) (clases, hitos, juicios, docentes, configuración)");
execFileSync("su",["postgres","-c",`psql -v ON_ERROR_STOP=1 -q -h /var/lib/postgresql/j26test -p 55432 -f -`],{input:fs.readFileSync(f)});
ok(JSON.stringify(await huella())===JSON.stringify(antes2),"correrlo dos veces no duplica ni rompe nada");
console.log("errores JS:",errs.length?errs:"ninguno");console.log(fa?fa+" FALLAS":"TODO OK");await b.close();await pool.end();process.exit(fa?1:0)})();
