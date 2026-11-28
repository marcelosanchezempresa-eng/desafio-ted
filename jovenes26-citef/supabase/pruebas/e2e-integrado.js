// Informe integrado (síntesis de todos los componentes): Word individual y grupal con datos de ejemplo.
const {chromium}=require("playwright");const {Pool}=require("pg");const fs=require("fs");const {execFileSync}=require("child_process");
const pool=new Pool({host:"/var/lib/postgresql/j26test",port:55432,user:"postgres",database:"postgres"});
const MOCK=fs.readFileSync(__dirname+"/mock-supabase.js","utf8");const DOCX=fs.readFileSync(__dirname+"/../docxpkg/package/build/index.umd.js","utf8");const OUT=__dirname+"/../ux/";
(async()=>{
await pool.query("truncate clases,hitos,juicios; truncate docentes");
await pool.query("insert into docentes(email,nombre,rol,componentes) values ('coord@ej.uy','Coord','coordinacion','{}')");
const J=(comp,suj,o)=>pool.query("insert into juicios(id,instancia,comp,sujeto,nivel,logros,mejorar,orientaciones,nota,autor) values($1,'i1',$2,$3,$4,$5,$6,$7,$8,'x')",[`i1|${comp}|${suj}`,comp,suj,o.nivel||"",o.logros||"",o.mejorar||"",o.orient||"",o.nota||null]);
// Ana (e0): sólida en dos áreas, aceptable en una; textos con errores de tipeo a propósito
await J("lectoescritura","e0",{nivel:"v",nota:10,logros:"respondió las cinco preguntas  con precisión",mejorar:"presenta un muy buen punto de partida en el area.demuestra saberes previos sólidos y trabaja con autonomía",orient:"Promover el trabajo en equipo y la responsabilidad en tareas compartidas"});
await J("informatica","e0",{nivel:"v",nota:9,logros:"Resolvió la planilla sin ayuda.",mejorar:"Maneja con soltura las herramientas basicas , y ayuda a sus compañeros.",orient:"Proponerle desafíos mayores: está en condiciones de liderar actividades."});
await J("contabilidad","e0",{nivel:"a",nota:7,logros:"Resolvió parcialmente los ejercicios.",mejorar:"Presenta un punto de partida aceptable, con aspectos a fortalecer en el cálculo de porcentajes.",orient:"promover el trabajo en equipo y la responsabilidad en tareas compartidas."});
// Bruno (e1): necesita apoyo
await J("lectoescritura","e1",{nivel:"r",nota:4,logros:"No completó la actividad.",mejorar:"Necesita apoyo para comprender consignas escritas...",orient:"Reforzar la puntualidad y la asistencia, claves para la práctica laboral."});
await J("informatica","e1",{nivel:"r",nota:5,mejorar:"Requiere acompañamiento en el uso del teclado y del correo electrónico."});
// Carla (e2): heterogénea
await J("lectoescritura","e2",{nivel:"v",nota:11,mejorar:"Excelente comprensión lectora."});
await J("informatica","e2",{nivel:"a",nota:7,mejorar:"Avanza, aunque con inseguridad."});
await J("contabilidad","e2",{nivel:"r",nota:4,mejorar:"Le cuesta el razonamiento matemático básico."});
// Grupo
await J("lectoescritura","_grupo",{mejorar:"El grupo es participativo y muestra interés por la lectura de textos del ámbito laboral. Hay diferencias marcadas en la escritura.",orient:"Trabajar la escritura de textos breves del ámbito laboral."});
await J("informatica","_grupo",{mejorar:"Buen clima de trabajo; la mayoría maneja el celular pero no la computadora.",orient:"Consolidar el manejo de herramientas informáticas para tareas administrativas."});
// Asistencia
for(const [f,ev] of [["2026-11-18",{e0:{as:"v"},e1:{as:"r"},e2:{as:"v"}}],["2026-11-19",{e0:{as:"v"},e1:{as:"a"},e2:{as:"v"}}],["2026-11-20",{e0:{as:"a"},e1:{as:"r"},e2:{as:"v"}}]])
  await pool.query("insert into clases(id,fecha,comp,ev,autor) values($1,$2,'lectoescritura',$3,'x')",[f+"_lectoescritura",f,JSON.stringify(ev)]);
const b=await chromium.launch();const errs=[];let fa=0;const ok=(c,m)=>{console.log((c?"  OK  ":"  FALLA ")+m);if(!c)fa++};
const ctx=await b.newContext({viewport:{width:1100,height:900},locale:"es-UY",acceptDownloads:true});
await ctx.route(/cdn\.jsdelivr\.net\/npm\/@supabase/,r=>r.fulfill({contentType:"text/javascript",body:MOCK}));await ctx.route(/cdn\.jsdelivr\.net\/npm\/docx/,r=>r.fulfill({contentType:"text/javascript",body:DOCX}));
await ctx.addInitScript(()=>{localStorage.clear();localStorage.setItem("mockEmail","coord@ej.uy")});
const p=await ctx.newPage();p.on("pageerror",e=>errs.push(e.message));await p.goto("http://localhost:8765/");await p.waitForTimeout(1500);
await p.click("[data-tab=evaluaciones]");await p.waitForTimeout(300);await p.selectOption("#e-inst","i1");await p.waitForTimeout(400);
const leer=async(btn,nombre)=>{const [d]=await Promise.all([p.waitForEvent("download",{timeout:30000}),p.click(btn)]);const f=OUT+nombre;await d.saveAs(f);
  return execFileSync("python3",["-I","-c","import docx,sys\nd=docx.Document(sys.argv[1])\nfor par in d.paragraphs:\n  t=par.text.strip()\n  if t: print(('• ' if par._p.pPr is not None and par._p.pPr.numPr is not None else '')+t)\nfor tb in d.tables:\n  for r in tb.rows: print(' | '.join(c.text for c in r.cells))",f]).toString();};
for(const [sid,arch] of [["e0","perfil-ana.docx"],["e1","perfil-bruno.docx"],["e2","perfil-carla.docx"]]){await p.selectOption("#i-est",sid);const t=await leer("#i-iword",arch);console.log("\n=== "+arch+" ===\n"+t);fs.writeFileSync(OUT+arch+".txt",t);}
const g=await leer("#i-igword","grupo.docx");console.log("\n=== grupo ===\n"+g);fs.writeFileSync(OUT+"grupo.txt",g);
const ana=fs.readFileSync(OUT+"perfil-ana.docx.txt","utf8");
ok(ana.includes("Presenta un muy buen punto de partida en el área. Demuestra"),"el corrector arregla espacio y mayúscula después del punto");
ok(ana.includes("herramientas básicas, y"),"el corrector quita el espacio antes de la coma y pone las tildes inequívocas (área, básicas)");
ok((ana.match(/Promover el trabajo en equipo/gi)||[]).length===1,"las orientaciones repetidas entre componentes aparecen una sola vez");
ok(/tres componentes/.test(ana)&&/8,7/.test(ana),"números según la guía: «tres componentes» en letras y promedio con coma decimal (8,7)");
await p.selectOption("#i-est","e0");
const [pop]=await Promise.all([ctx.waitForEvent("page"),p.click("#i-ipdf")]);await pop.waitForLoadState();await pop.evaluate(()=>{window.print=()=>{}});await pop.waitForTimeout(500);
await pop.setViewportSize({width:900,height:1250});await pop.screenshot({path:OUT+"perfil-integrado-pdf.png",fullPage:false});
ok((await pop.locator("ul li").count())>=4,"la vista para PDF muestra las listas con viñetas");
console.log("errores JS:",errs.length?errs:"ninguno");console.log(fa?fa+" FALLAS":"TODO OK");await b.close();await pool.end();process.exit(fa?1:0)})();
