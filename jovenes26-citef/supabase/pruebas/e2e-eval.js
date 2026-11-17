// Prueba: componentes por docente, juicios por instancia e informes Word/PDF.
const {chromium}=require("playwright");const {Pool}=require("pg");const fs=require("fs");const {execFileSync}=require("child_process");
const pool=new Pool({host:"/var/lib/postgresql/j26test",port:55432,user:"postgres",database:"postgres"});
const MOCK=fs.readFileSync(__dirname+"/mock-supabase.js","utf8");const DOCX=fs.readFileSync(__dirname+"/../docxpkg/package/build/index.umd.js","utf8");
const OUT=__dirname+"/../descargas/";fs.mkdirSync(OUT,{recursive:true});
(async()=>{
await pool.query("truncate clases,hitos,juicios; truncate docentes");
await pool.query("insert into docentes(email,nombre,rol,componentes) values ('coord@ej.uy','Coordinación Ejemplo','coordinacion','{}'),('lect@ej.uy','Prof. Lecto','docente','{lectoescritura}'),('info@ej.uy','Prof. Info','docente','{informatica}'),('nuevo@ej.uy','Prof. Nuevo','docente','{}')");
const b=await chromium.launch();const errs=[];let f=0;const ok=(c,m)=>{console.log((c?"  OK  ":"  FALLA ")+m);if(!c)f++};
async function abrir(email,w=420){const ctx=await b.newContext({viewport:{width:w,height:900},locale:"es-UY",acceptDownloads:true});
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/@supabase/,r=>r.fulfill({contentType:"text/javascript",body:MOCK}));
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/docx/,r=>r.fulfill({contentType:"text/javascript",body:DOCX}));
  await ctx.addInitScript(e=>{try{localStorage.clear();localStorage.setItem("mockEmail",e)}catch(x){}},email);
  const p=await ctx.newPage();p.on("pageerror",e=>errs.push(e.message));await p.goto("http://localhost:8765/");await p.waitForTimeout(1300);return p}
const opciones=async(p,sel)=>p.$$eval(sel+" option",os=>os.map(o=>o.textContent));

console.log("1) Cada docente ve solo sus componentes para cargar");
const L=await abrir("lect@ej.uy");
let o=await opciones(L,"#r-comp");ok(o.length===1&&o[0].startsWith("Lecto"),"Registrar (Lecto): "+JSON.stringify(o));
await L.click("[data-tab=hitos]");await L.waitForTimeout(300);o=await opciones(L,"#h-comp");ok(o.length===1&&o[0].startsWith("Lecto"),"Hitos (Lecto): "+JSON.stringify(o));
await L.click("[data-tab=semaforo]");await L.waitForTimeout(300);o=await opciones(L,"#s-comp");ok(o.length===3,"Semáforo (consulta) muestra todos: "+o.length+" opciones");
const N=await abrir("nuevo@ej.uy");ok((await N.textContent("#r-comp")).includes("No tiene componentes asignados"),"docente sin componentes: «"+(await N.textContent("#r-comp")).trim()+"»");

console.log("2) Juicios en la instancia «Diagnóstico inicial»");
await L.click("[data-tab=evaluaciones]");await L.waitForTimeout(400);
o=await opciones(L,"#e-inst");ok(o.length===3,"instancias: "+JSON.stringify(o));
await L.selectOption("#e-inst","i1");await L.waitForTimeout(200);
ok(!(await L.isVisible("#e-inf")),"un docente NO ve la sección de informes");
await L.fill('#e-grupo textarea[data-k=logros]',"Grupo participativo, con buen clima.");
await L.fill('#e-grupo textarea[data-k=mejorar]',"Necesita reforzar la lectura comprensiva.");
await L.locator("#e-list .stu-head").nth(0).click();await L.waitForTimeout(200);
await L.locator('#e-list .stu[open-card] .lvl[data-l=a]').click();
await L.fill('#e-list .stu[open-card] textarea[data-k=logros]',"Lee en voz alta con seguridad.\nParticipa en los debates.");
await L.fill('#e-list .stu[open-card] textarea[data-k=mejorar]',"Ortografía: tildes y uso de la b/v.");
await L.fill('#e-list .stu[open-card] textarea[data-k=orientaciones]',"Fichas semanales de ortografía.");
await L.locator('#e-list .stu[open-card] textarea[data-k=orientaciones]').blur();await L.waitForTimeout(2500);
const jl=(await pool.query("select sujeto,nivel,logros,mejorar,orientaciones,editado_por from juicios where comp='lectoescritura' order by sujeto")).rows;
ok(jl.length===2&&jl.find(r=>r.sujeto==="e0")?.nivel==="a"&&jl.find(r=>r.sujeto==="_grupo")?.mejorar.includes("lectura"),"guardados en la base: "+JSON.stringify(jl.map(r=>({s:r.sujeto,n:r.nivel,por:r.editado_por}))));
ok((await L.textContent("#e-status")).includes("Guardado"),"estado: «"+(await L.textContent("#e-status"))+"»");
const I=await abrir("info@ej.uy");await I.click("[data-tab=evaluaciones]");await I.waitForTimeout(400);await I.selectOption("#e-inst","i1");
o=await opciones(I,"#e-comp");ok(o.length===1&&o[0].startsWith("Inform"),"Evaluaciones (Info) solo su componente: "+JSON.stringify(o));
await I.locator("#e-list .stu-head").nth(0).click();await I.locator('#e-list .stu[open-card] .lvl[data-l=v]').click();
await I.fill('#e-list .stu[open-card] textarea[data-k=logros]',"Maneja Word y Excel con autonomía.");await I.fill('#e-list .stu[open-card] textarea[data-k=mejorar]',"Organizar carpetas en la nube.");
await I.locator('#e-list .stu[open-card] textarea[data-k=mejorar]').blur();await I.fill('#e-grupo textarea[data-k=logros]',"Avanza a buen ritmo en Excel.");await I.locator('#e-grupo textarea[data-k=logros]').blur();await I.waitForTimeout(2500);
ok((await pool.query("select 1 from juicios where comp='informatica'")).rowCount===2,"juicios de Informática guardados");
await L.waitForTimeout(800);

console.log("3) Coordinación: asignar componentes");
const C=await abrir("coord@ej.uy",1100);await C.click("[data-tab=config]");await C.waitForTimeout(800);
const fila=C.locator('#c-docentes .doc-item[data-email="nuevo@ej.uy"]');ok((await fila.textContent()).includes("Sin componentes"),"avisa «Sin componentes asignados»");
await fila.locator("[data-act=comps]").click();await C.waitForTimeout(200);
await C.locator('.doc-comps[data-email="nuevo@ej.uy"] input[value=informatica]').check();await C.click('.doc-comps [data-act=comps-guardar]');await C.waitForTimeout(800);
ok(JSON.stringify((await pool.query("select componentes from docentes where email='nuevo@ej.uy'")).rows[0].componentes)==='["informatica"]',"componentes guardados: "+await C.textContent("#d-status"));
const N2=await abrir("nuevo@ej.uy");o=await opciones(N2,"#r-comp");ok(o.length===1&&o[0].startsWith("Inform"),"el docente ahora ve Informática");

console.log("4) Informes");
await C.click("[data-tab=evaluaciones]");await C.waitForTimeout(400);await C.selectOption("#e-inst","i1");await C.waitForTimeout(200);
ok(await C.isVisible("#e-inf"),"coordinación ve «Informes para INEFOP»");
o=await opciones(C,"#e-comp");ok(o.length===2,"coordinación puede escribir en todos los componentes ("+o.length+")");
await C.selectOption("#i-est","e0");
let [dl]=await Promise.all([C.waitForEvent("download",{timeout:20000}),C.click("#i-word")]);let ruta=OUT+dl.suggestedFilename();await dl.saveAs(ruta);
console.log("   archivo:",dl.suggestedFilename(),"·",await C.textContent("#i-status"));
let txt=execFileSync("python3",["-I","-c","import docx,sys;d=docx.Document(sys.argv[1]);print('\\n'.join(p.text for p in d.paragraphs));print('\\n'.join(c.text for t in d.tables for r in t.rows for c in r.cells))",ruta]).toString();
ok(txt.includes("Ana Ejemplo")&&txt.includes("Diagnóstico inicial")&&txt.includes("Lee en voz alta")&&txt.includes("Maneja Word")&&txt.includes("Valoración global: En proceso"),"el Word tiene estudiante, instancia y juicios de los 2 componentes");
console.log(txt.split("\n").slice(0,22).map(x=>"     | "+x).join("\n"));
await C.selectOption("#i-est","todos");[dl]=await Promise.all([C.waitForEvent("download",{timeout:30000}),C.click("#i-word")]);ruta=OUT+dl.suggestedFilename();await dl.saveAs(ruta);
txt=execFileSync("python3",["-I","-c","import docx,sys;d=docx.Document(sys.argv[1]);t=[p.text for p in d.paragraphs];print(sum(1 for x in t if x=='Informe de evaluación'))",ruta]).toString().trim();
ok(txt==="25","Word de todos: "+txt+" informes (uno por estudiante) en "+dl.suggestedFilename());
[dl]=await Promise.all([C.waitForEvent("download",{timeout:20000}),C.click("#i-gword")]);ruta=OUT+dl.suggestedFilename();await dl.saveAs(ruta);
txt=execFileSync("python3",["-I","-c","import docx,sys;d=docx.Document(sys.argv[1]);print('\\n'.join(p.text for p in d.paragraphs));print('filas tabla',len(d.tables[-1].rows))",ruta]).toString();
ok(txt.includes("Necesita reforzar la lectura")&&txt.includes("Avanza a buen ritmo")&&txt.includes("filas tabla 26"),"Word del grupo con juicios de ambos componentes y tabla de 25 estudiantes");
C.context().on("page",()=>{});const [pop]=await Promise.all([C.context().waitForEvent("page"),C.click("#i-pdf")]);await pop.waitForLoadState();
ok((await pop.content()).includes("Informe de evaluación")&&(await pop.content()).includes("Fichas semanales"),"«Ver para PDF» abre el informe listo para imprimir");
await pop.screenshot({path:OUT+"informe-pdf.png",fullPage:false});
console.log("errores JS:",errs.length?errs:"ninguno");console.log(f?f+" FALLAS":"TODO OK");await b.close();await pool.end();process.exit(f?1:0)})();
