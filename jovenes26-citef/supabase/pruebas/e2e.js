// Prueba de punta a punta: app de docs/ + base PostgreSQL local con RLS real.
const {chromium}=require("playwright");const {Pool}=require("pg");
const pool=new Pool({host:"/var/lib/postgresql/j26test",port:55432,user:"postgres",database:"postgres"});
const MOCK=require("fs").readFileSync(__dirname+"/mock-supabase.js","utf8");
(async()=>{const b=await chromium.launch();const errs=[];let fallas=0;
const ok=(c,m)=>{console.log((c?"  OK  ":"  FALLA ")+m);if(!c)fallas++};
async function abrir(email,w=400){const ctx=await b.newContext({viewport:{width:w,height:900},locale:"es-UY"});
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/@supabase/,r=>r.fulfill({contentType:"text/javascript",body:MOCK}));
  await ctx.addInitScript(e=>{try{localStorage.clear(); if(e) localStorage.setItem("mockEmail",e);}catch(x){}},email);
  const p=await ctx.newPage();p.on("pageerror",e=>errs.push(e.message));await p.goto("http://localhost:8765/");await p.waitForTimeout(1200);return p}
const ev=async id=>((await pool.query("select ev from clases where id=$1",[id])).rows[0]||{}).ev||{};

console.log("1) Ingreso");
let p=await abrir(null);
ok(await p.isVisible("#login"),"sin sesión se ve la pantalla de ingreso");
ok(!(await p.isVisible("nav.tabs")),"sin sesión no se ven las pestañas");
await p.fill("#l-email","profe@ej.uy");await p.fill("#l-pass","equivocada");await p.click("#l-entrar");await p.waitForTimeout(500);
ok((await p.textContent("#l-status")).includes("incorrectos"),"contraseña equivocada: «"+(await p.textContent("#l-status"))+"»");
await p.fill("#l-pass","clave1234");await p.click("#l-entrar");await p.waitForTimeout(1500);
ok(await p.isVisible("nav.tabs"),"con contraseña correcta entra a la app");
ok((await p.textContent("#estado"))==="Puede guardar","indicador: «"+(await p.textContent("#estado"))+"»");
await p.close();

console.log("2) Dos docentes en la misma clase, a la vez");
const A=await abrir("profe@ej.uy"), B=await abrir("profe2@ej.uy");
const hoy=await A.inputValue("#r-fecha"); const id=hoy+"_lectoescritura";
for(const P of [A,B]){await P.selectOption("#r-comp","lectoescritura");await P.waitForTimeout(200);}
const want={as:"v",ac:"a",co:"v",cu:"r"}, want2={as:"a",ac:"v",co:"r",cu:"v"};
const marcar=async(P,i,w)=>{await P.locator(".stu-head").nth(i).click();await P.waitForTimeout(100);
  for(const [k,l] of Object.entries(w)){await P.locator(`.stu[open-card] .dim[data-k=${k}] .lvl[data-l=${l}]`).click({delay:90});await P.waitForTimeout(60);}};
await Promise.all([(async()=>{for(const i of [0,2])await marcar(A,i,want)})(),(async()=>{for(const i of [1,3])await marcar(B,i,want2)})()]);
await A.waitForTimeout(2500);
const e=await ev(id);let n=0;for(const i of [0,2])for(const [k,l] of Object.entries(want))if(e["e"+i]?.[k]===l)n++;for(const i of [1,3])for(const [k,l] of Object.entries(want2))if(e["e"+i]?.[k]===l)n++;
ok(n===16,`la base tiene ${n}/16 calificaciones de los dos docentes`);
await A.locator(".stu-head").nth(1).click();await A.waitForTimeout(300);
ok(await A.locator(`.stu[open-card] .dim[data-k=co] .lvl[data-l=r]`).getAttribute("aria-pressed")==="true","el docente A ve en su pantalla lo que marcó B");
ok((await A.textContent("#r-status")).includes("Guardado"),"estado A: «"+(await A.textContent("#r-status"))+"»");
console.log("   e0 en la base:",JSON.stringify(e.e0),"| editado por:",(await pool.query("select editado_por from clases where id=$1",[id])).rows[0].editado_por);

console.log("3) Hitos");
await A.click("[data-tab=hitos]");await A.selectOption("#h-comp","lectoescritura");await A.waitForTimeout(300);
await A.locator(".chip").first().click();await A.fill("#h-fecha","2026-11-20");await A.click("#h-crear");await A.waitForTimeout(1200);
const rows=A.locator(".hrow");await rows.nth(0).locator(".lvl[data-l=v]").click();await rows.nth(1).locator(".lvl[data-l=x]").click();await A.waitForTimeout(2000);
const h=(await pool.query("select nombre,ev from hitos")).rows;ok(h.length===1&&h[0].ev.e0?.l==="v"&&h[0].ev.e1?.l==="x","hito creado y calificado: "+JSON.stringify(h[0]&&{n:h[0].nombre,ev:h[0].ev}));

console.log("4) Correo no autorizado");
const X=await abrir("intruso@gmail.com");
ok((await X.textContent("#estado"))==="No autorizado","indicador: «"+(await X.textContent("#estado"))+"»");
ok(await X.isVisible("#ro"),"aparece el aviso rojo");
ok((await X.locator(".stu-head").count())===0,"no ve ningún estudiante (la base no le devuelve datos)");

console.log("5) Coordinación");
const C=await abrir("coord@ej.uy",1000);await C.click("[data-tab=config]");await C.waitForTimeout(800);
ok(await C.isVisible("#c-docentes-panel"),"ve el panel de docentes autorizados");
ok((await C.locator("#c-docentes .doc-item").count())===3,"lista 3 docentes");
await C.fill("#d-email","Nueva.Profe@Ejemplo.com");await C.fill("#d-nombre","Profe Nueva");await C.click("#d-add");await C.waitForTimeout(800);
ok((await pool.query("select 1 from docentes where email='nueva.profe@ejemplo.com' and activo")).rowCount===1,"autorizó un correo nuevo (guardado en minúsculas)");
await C.fill("#c-cupos","13");await C.click("#c-save");await C.waitForTimeout(800);
ok((await pool.query("select data->>'cupos' c from config")).rows[0].c==="13","guardó la configuración");
const N=await abrir("nueva.profe@ejemplo.com");ok((await N.textContent("#estado"))==="Puede guardar","la docente recién autorizada puede guardar");
await C.locator('#c-docentes .doc-item[data-email="nueva.profe@ejemplo.com"] [data-act=baja]').click();await C.waitForTimeout(800);
const N2=await abrir("nueva.profe@ejemplo.com");ok((await N2.textContent("#estado"))==="No autorizado","al darla de baja ya no puede guardar");

console.log("6) Docente no ve el panel de docentes ni puede guardar configuración");
await A.click("[data-tab=config]");await A.waitForTimeout(400);
ok(!(await A.isVisible("#c-docentes-panel")),"docente no ve el panel de docentes");
ok(await A.isDisabled("#c-save"),"botón «Guardar configuración» deshabilitado para docentes");

console.log("errores JS:",errs.length?errs:"ninguno");console.log(fallas?`${fallas} FALLAS`:"TODO OK");
await b.close();await pool.end();process.exit(fallas?1:0)})();
