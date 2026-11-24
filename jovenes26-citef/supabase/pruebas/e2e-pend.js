// Ranking honesto (sin puesto con pocos datos) y aviso de clases sin registrar.
const {chromium}=require("playwright");const {Pool}=require("pg");const fs=require("fs");const {execFileSync}=require("child_process");
const pool=new Pool({host:"/var/lib/postgresql/j26test",port:55432,user:"postgres",database:"postgres"});
const MOCK=fs.readFileSync(__dirname+"/mock-supabase.js","utf8");const OUT=__dirname+"/../ux/";
const SEED="/home/user/desafio-ted/jovenes26-citef/supabase/horario-noviembre-2026.sql";
(async()=>{
await pool.query("truncate clases,hitos,juicios; truncate docentes");
await pool.query("insert into docentes(email,nombre,rol,componentes) values ('coord@ej.uy','Natalia Ejemplo','coordinacion','{administracion}'),('lect@ej.uy','Marcelo Ejemplo','docente','{lectoescritura}')");
await pool.query("update config set data=jsonb_set(jsonb_set(data-'horario','{min}','4'),'{cupos}','12')");
execFileSync("su",["postgres","-c","psql -q -h /var/lib/postgresql/j26test -p 55432 -f -"],{input:fs.readFileSync(SEED)});
// e0: 4 registros (buena), e1: 2 registros excelentes, e2: 4 registros flojos (rojos) — en Informática
const ins=(f,ev)=>pool.query("insert into clases(id,fecha,comp,ev,autor) values($1,$2,'informatica',$3,'x')",[f+"_informatica",f,JSON.stringify(ev)]);
await ins("2026-11-18",{e0:{as:"v",ac:"v",co:"v",cu:"v"},e1:{as:"v",ac:"v",co:"v",cu:"v"},e2:{as:"r"}});
await ins("2026-11-19",{e0:{as:"v",ac:"v",co:"a",cu:"v"},e1:{as:"v",ac:"v",co:"v",cu:"v"},e2:{as:"r"}});
await ins("2026-11-20",{e0:{as:"v",ac:"a",co:"v",cu:"v"},e2:{as:"r"}});
await ins("2026-11-23",{e0:{as:"v",ac:"v",co:"v",cu:"v"},e2:{as:"a",ac:"r",co:"r",cu:"r"}});
const b=await chromium.launch();const errs=[];let fa=0;const ok=(c,m)=>{console.log((c?"  OK  ":"  FALLA ")+m);if(!c)fa++};
async function abrir(email,w=430,h=900){const ctx=await b.newContext({viewport:{width:w,height:h},locale:"es-UY",deviceScaleFactor:2});
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/@supabase/,r=>r.fulfill({contentType:"text/javascript",body:MOCK}));
  await ctx.addInitScript(e=>{try{localStorage.clear();localStorage.setItem("mockEmail",e)}catch(x){}},email);
  const p=await ctx.newPage();p.on("pageerror",e=>errs.push(e.message));await p.goto("http://localhost:8765/");await p.waitForTimeout(1500);return p}
console.log("1) Ranking honesto");
const C=await abrir("coord@ej.uy",1000);await C.click("[data-tab=ranking]");await C.waitForTimeout(300);
await C.selectOption("#k-tipo","curso");await C.waitForTimeout(400);
const conPos=await C.$$eval("#k-list .rk:not(.few) .nm",xs=>xs.map(x=>x.textContent.trim()));
ok(conPos.length===2&&conPos[0].startsWith("Ana")&&conPos[1].startsWith("Carla"),"solo llevan puesto quienes tienen 4 registros: "+conPos.join(" | "));
const sinTxt=await C.textContent("#k-list .rk-sec");ok(sinTxt.includes("Todavía sin datos suficientes"),"sección aparte: «"+sinTxt.trim().split("\n")[0]+"»");
const bruno=C.locator("#k-list .rk.few",{hasText:"Bruno"});ok((await bruno.locator(".pos").textContent())==="—"&&(await bruno.textContent()).includes("2/4 reg."),"Bruno (2 clases excelentes) sin puesto y con «2/4 reg.»");
ok((await C.locator("#k-list .rk.few").first().textContent()).includes("Bruno"),"en la sección sin puesto, el mejor índice parcial va primero");
ok((await C.locator("#k-list .rk",{hasText:"Carla"}).textContent()).includes("Entrevista"),"la alerta dice «Entrevista» en lugar de «!»");
const av=await C.textContent("#k-aviso");console.log("    «"+av.replace(/\s+/g," ").trim()+"»");
ok(av.includes("Ranking provisorio")&&av.includes("2 de 25")&&/Lecto Escritura · \d/.test(av),"aviso de ranking provisorio con clases sin registrar por componente");
await C.locator("[data-view=ranking]").screenshot({path:OUT+"ranking-honesto.png"});const M=await abrir("coord@ej.uy",400);await M.click("[data-tab=ranking]");await M.selectOption("#k-tipo","curso");await M.waitForTimeout(400);await M.addStyleTag({content:"header.top{position:static}"});await M.locator("#k-list").screenshot({path:OUT+"ranking-movil.png"});
console.log("2) Aviso de clases pendientes al docente");
const L=await abrir("lect@ej.uy");const pt=await L.textContent("#h-pend");console.log("    «"+pt.replace(/\s+/g," ").trim()+"»");
ok(/faltan? registrar/.test(pt)&&pt.includes("18/11")&&pt.includes("Lecto Escritura")&&!pt.includes("Informática"),"ve sus clases del horario sin registrar (solo su componente)");
await L.locator("#h-pend").screenshot({path:OUT+"pendientes.png"});
await L.click("[data-pend]");await L.waitForTimeout(500);
ok((await L.inputValue("#r-fecha"))==="2026-11-18"&&(await L.inputValue("#r-comp"))==="lectoescritura","«Registrar …» abre esa fecha y componente");
await L.locator(".stu-head").first().click();await L.locator(".stu[open-card] .dim[data-k=as] .lvl[data-l=v]").click();await L.waitForTimeout(2500);
await L.evaluate(()=>location.reload());await L.waitForTimeout(1600);
const pt2=await L.textContent("#h-pend");ok(!pt2.includes("miércoles 18/11"),"al registrarla desaparece de la lista");
console.log("3) CSV del ranking");
const [d]=await Promise.all([C.waitForEvent("download"),C.click("#k-csv")]);const csv=fs.readFileSync(await d.path(),"utf8");
ok(/^"?1"?[;,]/m.test(csv.split("\n")[1])&&csv.includes("Sin datos suficientes"),"el CSV marca «Sin datos suficientes» en lugar de un puesto");
console.log("errores JS:",errs.length?errs:"ninguno");console.log(fa?fa+" FALLAS":"TODO OK");await b.close();await pool.end();process.exit(fa?1:0)})();
