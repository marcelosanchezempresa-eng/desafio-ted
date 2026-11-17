// Capturas del manual con la versión Supabase, sobre la base local con DATOS DE EJEMPLO.
const {chromium}=require("playwright");const {Pool}=require("pg");const fs=require("fs");
const pool=new Pool({host:"/var/lib/postgresql/j26test",port:55432,user:"postgres",database:"postgres"});
const MOCK=fs.readFileSync(__dirname+"/mock-supabase.js","utf8");const OUT="/home/user/desafio-ted/jovenes26-citef/manual/shots3/";fs.mkdirSync(OUT,{recursive:true});
const nombres=["Ana","Bruno","Carla","Diego","Elena","Facundo","Gimena","Hugo","Inés","Joaquín","Karen","Lucas","Micaela","Nicolás","Oriana","Pablo","Quimey","Rodrigo","Sofía","Tomás","Úrsula","Valentín","Wanda","Ximena","Yamil"].map(n=>n+" Ejemplo");
(async()=>{
  const cfg={nombre:"Jóvenes 26 · CITEF",inicio:"2026-10-13",fin:"2027-03-15",hora:"08:15",tol:10,cupos:12,cupos2:15,min:4,pesoHito:2,pesos:[25,25,25,25],
    modulos:[{id:"m1",nombre:"Módulo 1",desde:"2026-10-13",hasta:"2026-12-23"},{id:"m2",nombre:"Módulo 2",desde:"2027-02-01",hasta:"2027-03-15"}],
    recesos:[{nombre:"Receso de fin de año",desde:"2026-12-24",hasta:"2027-01-31"}],
    estudiantes:nombres.map((n,i)=>({id:"e"+i,nombre:n,nivel:""})),
    componentes:[{id:"lectoescritura",nombre:"Lecto Escritura",docente:"Prof. Ejemplo",horas:4,modulo:"t"},{id:"informatica",nombre:"Informática",docente:"Prof. Ejemplo B",horas:3,modulo:"t"}],
    instancias:[{id:"i1",nombre:"Hito 1 · Diagnóstico inicial",fecha:"2026-11-30",tipo:"diagnostico",escala:12},{id:"i4",nombre:"Hito 4 · Evaluación final",fecha:"2027-04-30",tipo:"final",escala:12}]};
  await pool.query("truncate clases,hitos,juicios,docentes");
  await pool.query("update config set data=$1 where id=1",[JSON.stringify(cfg)]);
  await pool.query("insert into docentes(email,nombre,rol,componentes) values ('coord@ej.uy','Coordinación Ejemplo','coordinacion','{informatica}'),('prof.ejemplo@ej.uy','Prof. Ejemplo','docente','{lectoescritura}'),('prof.b@ej.uy','Prof. Ejemplo B','docente','{informatica}')");
  let s=11;const r=()=>(s=(s*9301+49297)%233280)/233280;
  for(const f of ["2026-10-13","2026-10-15","2026-10-20","2026-10-22","2026-10-27","2026-10-29","2026-11-03","2026-11-05","2026-11-10","2026-11-12","2026-11-16"])
    for(const c of ["lectoescritura","informatica"]){const ev={};for(let i=0;i<25;i++){const L=()=>{const x=r()+i*0.012;return x<0.62?"v":x<0.92?"a":"r"};const as=L();ev["e"+i]=as==="r"?{as:"r"}:{as,ac:L(),co:L(),cu:L()}}
      await pool.query("insert into clases(id,fecha,comp,ev,autor) values($1,$2,$3,$4,'prof.ejemplo@ej.uy')",[f+"_"+c,f,c,JSON.stringify(ev)])}
  await pool.query(`insert into hitos(id,comp,nombre,tipo,fecha,ev) values('h0','lectoescritura','Currículum vitae revisado','trabajo','2026-11-06','{"e0":{"l":"v"},"e1":{"l":"a","obs":"Lo entregó un día tarde"},"e2":{"l":"v"},"e3":{"l":"r"}}')`);

  const b=await chromium.launch();const errs=[];
  async function abrir(email,w=400,h=760){const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,locale:"es-UY",colorScheme:"light"});
    await ctx.route(/cdn\.jsdelivr\.net\/npm\/@supabase/,x=>x.fulfill({contentType:"text/javascript",body:MOCK}));
    await ctx.addInitScript(e=>{try{localStorage.clear();if(e)localStorage.setItem("mockEmail",e)}catch(x){}},email);
    const p=await ctx.newPage();p.on("pageerror",e=>errs.push(e.message));await p.goto("http://localhost:8765/");await p.waitForTimeout(1300);return p}
  const shot=async(p,n,o={})=>{await p.waitForTimeout(500);await p.screenshot({path:OUT+n+".png",...o})};
  // Inicio del docente: saludo, resumen y solo su componente
  let p=await abrir("prof.ejemplo@ej.uy");await shot(p,"20-inicio");
  // Evaluaciones: grupo
  await p.click("[data-tab=evaluaciones]");await p.waitForTimeout(400);await p.selectOption("#e-inst","i1");await p.waitForTimeout(400);
  await p.addStyleTag({content:"header.top{position:static}"});
  const act='#e-grupo textarea[data-suj=_actividad]';
  await p.fill(act,"Lectura de un aviso laboral y respuesta escrita a cinco preguntas de comprensión.");await p.locator(act).blur();await p.waitForTimeout(1200);
  await p.locator("#e-inst").scrollIntoViewIfNeeded();await p.evaluate(()=>scrollBy(0,-90));await shot(p,"22-eval-grupo");
  // Evaluaciones: tarjeta de un estudiante
  await p.locator("#e-list .stu-head").nth(1).click();await p.waitForTimeout(400);
  const card=p.locator("#e-list .stu[open-card]");
  await card.locator(".nivel-sel .lvl[data-l=a]").click();await p.waitForTimeout(400);
  await card.locator(".sug-chips[data-tag=juicio] .sug").nth(0).click();await card.locator(".sug-chips[data-tag=orient] .sug").nth(1).click();
  await card.locator(".jnota").selectOption("8");
  await card.locator("textarea[data-k=logros]").fill("Respondió tres de las cinco preguntas; identifica el puesto y los requisitos.");await card.locator("textarea[data-k=logros]").blur();
  await p.waitForTimeout(1500);await card.screenshot({path:OUT+"23-eval-tarjeta.png"});
  // Coordinación: modo corrección
  const c=await abrir("coord@ej.uy");await c.check("#r-comp + .corr-toggle input");await c.waitForTimeout(300);await c.selectOption("#r-comp","lectoescritura");await c.waitForTimeout(400);
  await c.locator("#r-comp").scrollIntoViewIfNeeded();await c.evaluate(()=>scrollTo(0,0));await shot(c,"25-correccion");
  // Coordinación: informes
  const d=await abrir("coord@ej.uy",1000,760);await d.click("[data-tab=evaluaciones]");await d.waitForTimeout(500);await d.selectOption("#e-inst","i1");await d.waitForTimeout(400);
  await d.addStyleTag({content:"header.top{position:static}"});await d.locator("#e-inf").scrollIntoViewIfNeeded();await d.locator("#e-inf").screenshot({path:OUT+"24-informes.png"});
  console.log("errores:",errs.length?errs:"ninguno");await b.close();await pool.end()})();
