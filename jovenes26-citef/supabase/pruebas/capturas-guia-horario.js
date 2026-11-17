// Capturas para la guía del horario (coordinación), con DATOS DE EJEMPLO.
const {chromium}=require("playwright");const {Pool}=require("pg");const fs=require("fs");const {execFileSync}=require("child_process");
const pool=new Pool({host:"/var/lib/postgresql/j26test",port:55432,user:"postgres",database:"postgres"});
const MOCK=fs.readFileSync(__dirname+"/mock-supabase.js","utf8");const OUT="/home/user/desafio-ted/jovenes26-citef/manual/shots4/";fs.mkdirSync(OUT,{recursive:true});
const SEED="/home/user/desafio-ted/jovenes26-citef/supabase/horario-noviembre-2026.sql";
(async()=>{
  await pool.query("truncate clases,hitos,juicios; truncate docentes");
  await pool.query("insert into docentes(email,nombre,rol,componentes) values ('coord@ej.uy','Coordinación Ejemplo','coordinacion','{administracion}'),('lect@ej.uy','Prof. Ejemplo','docente','{lectoescritura}')");
  await pool.query("update config set data=data-'horario'");
  execFileSync("su",["postgres","-c","psql -q -h /var/lib/postgresql/j26test -p 55432 -f -"],{input:fs.readFileSync(SEED)});
  const b=await chromium.launch();const errs=[];
  async function abrir(email,w,h){const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,locale:"es-UY",colorScheme:"light",acceptDownloads:true});
    await ctx.route(/cdn\.jsdelivr\.net\/npm\/@supabase/,x=>x.fulfill({contentType:"text/javascript",body:MOCK}));
    await ctx.addInitScript(e=>{try{localStorage.clear();localStorage.setItem("mockEmail",e)}catch(x){}},email);
    const p=await ctx.newPage();p.on("pageerror",e=>errs.push(e.message));await p.goto("http://localhost:8765/");await p.waitForTimeout(1300);return p}
  const C=await abrir("coord@ej.uy",1100,820);
  await C.click("[data-tab=horario]");await C.waitForTimeout(300);await C.addStyleTag({content:"header.top{position:static}"});
  await C.check("#hz-edit");await C.waitForTimeout(300);await C.click("#hz-next");await C.waitForTimeout(300);
  // 1) panel superior + encabezado de la semana con el botón
  const top=await C.locator("[data-view=horario] > .panel").first().boundingBox(), wk=await C.locator(".hz-week").first().boundingBox();
  await C.screenshot({path:OUT+"01-editar.png",clip:{x:top.x-4,y:top.y-4,width:top.width+8,height:(wk.y+70)-top.y}});
  // 2) planilla con un cambio
  await C.click('[data-hzsemana="2026-11-30"]');await C.waitForTimeout(300);
  await C.selectOption('[data-hzk="2026-12-02|1"]',"c:informatica");await C.waitForTimeout(300);
  await C.locator(".hz-week",{has:C.locator("#hz-sheet")}).screenshot({path:OUT+"02-planilla.png"});
  await C.click('[data-hzs="guardar"]');await C.waitForTimeout(1500);
  // 3) imagen compartida
  await C.click("#hz-hoy");await C.waitForTimeout(300);
  const [d]=await Promise.all([C.waitForEvent("download",{timeout:30000}),C.click("#hz-share")]);await d.saveAs(OUT+"03-imagen.png");
  await C.locator("#hz-share").scrollIntoViewIfNeeded();const sb=await C.locator("[data-view=horario] > .panel").first().screenshot({path:OUT+"03b-boton.png"});
  // 4) lo que ve el docente
  const L=await abrir("lect@ej.uy",400,760);await L.addStyleTag({content:"header.top{position:static}"});await L.waitForTimeout(300);
  await L.screenshot({path:OUT+"04-aviso-docente.png"});
  console.log("errores:",errs.length?errs:"ninguno");await b.close();await pool.end()})();
