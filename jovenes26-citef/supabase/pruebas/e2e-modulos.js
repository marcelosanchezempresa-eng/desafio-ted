// Orden de los módulos (cronológico) y módulo en curso elegido por defecto, según la fecha.
const {chromium}=require("playwright");const fs=require("fs");const {Pool}=require("pg");
const pool=new Pool({host:"/var/lib/postgresql/j26test",port:55432,user:"postgres",database:"postgres"});
const MOCK=fs.readFileSync(__dirname+"/mock-supabase.js","utf8");
(async()=>{
await pool.query("truncate docentes; insert into docentes(email,nombre,rol,componentes) values ('coord@ej.uy','Coord','coordinacion','{}')");
const b=await chromium.launch();const errs=[];let fa=0;const ok=(c,m)=>{console.log((c?"  OK  ":"  FALLA ")+m);if(!c)fa++};
async function ver(fecha){const ctx=await b.newContext({viewport:{width:430,height:900},locale:"es-UY"});
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/@supabase/,r=>r.fulfill({contentType:"text/javascript",body:MOCK}));
  await ctx.addInitScript(()=>{try{localStorage.clear();localStorage.setItem("mockEmail","coord@ej.uy")}catch(x){}});
  const p=await ctx.newPage();if(fecha) await p.clock.setFixedTime(new Date(fecha+"T12:00:00-03:00"));p.on("pageerror",e=>errs.push(e.message));
  await p.goto("http://localhost:8765/");await p.waitForTimeout(1400);await p.click("[data-tab=ranking]");await p.selectOption("#k-tipo","modulo");await p.waitForTimeout(300);
  const opts=await p.$$eval("#k-per option",o=>o.map(x=>x.textContent));const sel=await p.$eval("#k-per",s=>s.options[s.selectedIndex].textContent);
  await ctx.close();return {opts,sel}}
let r=await ver(null);console.log("    hoy:",r.opts.join(" | ")," → elegido:",r.sel);
ok(r.opts[0].startsWith("Módulo 1")&&r.opts[1].startsWith("Módulo 2"),"Módulo 1 arriba, Módulo 2 abajo");
ok(r.sel.startsWith("Módulo 1"),"hoy (noviembre) viene elegido el Módulo 1");
r=await ver("2026-12-30");ok(r.sel.startsWith("Módulo 1"),"en el receso (30/12) sigue el Módulo 1: "+r.sel);
r=await ver("2027-02-10");ok(r.sel.startsWith("Módulo 2"),"desde febrero (10/02) pasa solo al Módulo 2: "+r.sel);
r=await ver("2026-10-01");ok(r.sel.startsWith("Módulo 1"),"antes del inicio, el Módulo 1");
console.log("errores JS:",errs.length?errs:"ninguno");console.log(fa?fa+" FALLAS":"TODO OK");await b.close();await pool.end();process.exit(fa?1:0)})();
