// Prueba: hitos INEFOP (nota 1-12 + juicio; rúbrica en el final; técnicos; desvinculados; informes y asistencia).
const {chromium}=require("playwright");const {Pool}=require("pg");const fs=require("fs");const {execFileSync}=require("child_process");
const pool=new Pool({host:"/var/lib/postgresql/j26test",port:55432,user:"postgres",database:"postgres"});
const MOCK=fs.readFileSync(__dirname+"/mock-supabase.js","utf8");const DOCX=fs.readFileSync(__dirname+"/../docxpkg/package/build/index.umd.js","utf8");
const OUT=__dirname+"/../descargas2/";fs.mkdirSync(OUT,{recursive:true});
const leer=r=>execFileSync("python3",["-I","-c","import docx,sys;d=docx.Document(sys.argv[1]);print('\\n'.join(p.text for p in d.paragraphs));print('\\n'.join(' | '.join(c.text for c in r.cells) for t in d.tables for r in t.rows))",r]).toString();
(async()=>{
await pool.query("truncate clases,hitos,juicios; truncate docentes");
await pool.query("insert into docentes(email,nombre,rol,componentes) values ('coord@ej.uy','Coordinación Ejemplo','coordinacion','{}'),('lect@ej.uy','Prof. Lecto','docente','{lectoescritura}'),('info@ej.uy','Prof. Info','docente','{informatica}')");
// Bruno (e1) se desvinculó
await pool.query(`update config set data=jsonb_set(data,'{estudiantes}',(select jsonb_agg(case when e->>'id'='e1' then e||'{"estado":"desvinculado"}' else e end) from jsonb_array_elements(data->'estudiantes') e)) where id=1`);
for(const [f,c] of [["2026-10-14","lectoescritura"],["2026-10-21","lectoescritura"],["2026-10-28","lectoescritura"],["2026-10-15","informatica"]])
  await pool.query("insert into clases(id,fecha,comp,ev,creado_en) values($1,$2,$3,$4,now())",[f+"_"+c,f,c,JSON.stringify({e0:{as:f.endsWith("21")?"a":"v",ac:"v",co:"v",cu:"v"},e2:{as:"r"},e3:{j:true}})]);
const b=await chromium.launch();const errs=[];let f=0;const ok=(c,m)=>{console.log((c?"  OK  ":"  FALLA ")+m);if(!c)f++};
async function abrir(email,w=420){const ctx=await b.newContext({viewport:{width:w,height:1000},locale:"es-UY",acceptDownloads:true});
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/@supabase/,r=>r.fulfill({contentType:"text/javascript",body:MOCK}));
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/docx/,r=>r.fulfill({contentType:"text/javascript",body:DOCX}));
  await ctx.addInitScript(e=>{try{localStorage.clear();localStorage.setItem("mockEmail",e)}catch(x){}},email);
  const p=await ctx.newPage();p.on("pageerror",e=>errs.push(e.message));await p.goto("http://localhost:8765/");await p.waitForTimeout(1300);return p}
const abrirEval=async(P,inst,comp)=>{await P.click("[data-tab=evaluaciones]");await P.waitForTimeout(300);await P.selectOption("#e-inst",inst);if(comp)await P.selectOption("#e-comp",comp);await P.waitForTimeout(300)};
const tarjeta=async(P,i)=>{await P.locator("#e-list .stu-head").nth(i).click();await P.waitForTimeout(200)};

console.log("1) Hito 1 · Diagnóstico (nota 1-12 + resultado + juicio conceptual)");
const L=await abrir("lect@ej.uy");await abrirEval(L,"i1");
ok((await L.locator("#e-list .stu").count())===24,"lista sin el desvinculado: "+await L.locator("#e-list .stu").count()+" de 25");
await tarjeta(L,0);ok((await L.locator("#e-list .stu[open-card] .jnota option").count())===13,"nota con opciones — y 1 a 12");
ok((await L.locator("#e-list .stu[open-card] .rub").count())===0,"sin rúbrica en el diagnóstico");
console.log("   campos:",(await L.$$eval("#e-list .stu[open-card] label",ls=>ls.map(l=>l.textContent))).join(" · "));
await L.selectOption("#e-list .stu[open-card] .jnota","9");
await L.fill('#e-list .stu[open-card] textarea[data-k=logros]',"Lectura en voz alta: lee con fluidez textos breves.");
await L.fill('#e-list .stu[open-card] textarea[data-k=mejorar]',"Buen punto de partida; debe reforzar ortografía.");await L.locator('#e-list .stu[open-card] textarea[data-k=mejorar]').blur();
await L.fill('#e-grupo textarea[data-k=logros]',"El grupo lee con dificultad textos argumentativos.");await L.fill('#e-grupo textarea[data-k=mejorar]',"Grupo heterogéneo y motivado.");await L.locator('#e-grupo textarea[data-k=mejorar]').blur();
await L.waitForTimeout(2200);ok(await L.locator('#e-list .stu[data-sid=e0]').evaluate(e=>e.classList.contains("done")),"tarjeta marcada completa ✓ · "+await L.textContent("#e-status"));
const I=await abrir("info@ej.uy");await abrirEval(I,"i1");await tarjeta(I,0);await I.selectOption("#e-list .stu[open-card] .jnota","7");
await I.fill('#e-list .stu[open-card] textarea[data-k=logros]',"Prueba de digitación: 25 palabras por minuto.");await I.fill('#e-list .stu[open-card] textarea[data-k=mejorar]',"Maneja lo básico del teclado.");await I.locator('#e-list .stu[open-card] textarea[data-k=mejorar]').blur();await I.waitForTimeout(2000);
let r=(await pool.query("select comp,nota from juicios where instancia='i1' and sujeto='e0' order by comp")).rows;ok(JSON.stringify(r)==='[{"comp":"informatica","nota":7},{"comp":"lectoescritura","nota":9}]',"notas guardadas: "+JSON.stringify(r));

console.log("2) Informe de los técnicos (solo coordinación)");
ok(!(await L.$$eval("#e-comp option",os=>os.map(o=>o.value))).includes("_tecnicos"),"un docente NO ve «Informe de los técnicos»");
const C=await abrir("coord@ej.uy",1100);await abrirEval(C,"i1","_tecnicos");await tarjeta(C,0);
ok((await C.locator("#e-list .stu[open-card] .jnota").count())===0,"los técnicos no ponen nota");
await C.fill('#e-list .stu[open-card] textarea[data-k=logros]',"Participante con alta motivación; se sugiere acompañar su búsqueda laboral.");await C.locator('#e-list .stu[open-card] textarea[data-k=logros]').blur();
await C.fill('#e-grupo textarea[data-k=logros]',"Grupo comprometido; asistencia en general buena.");await C.locator('#e-grupo textarea[data-k=logros]').blur();await C.waitForTimeout(2000);

console.log("3) Hito 4 · Final (nota + juicio + competencias técnicas + rúbrica)");
await abrirEval(L,"i4");await tarjeta(L,0);ok((await L.locator("#e-list .stu[open-card] .rub").count())===3,"rúbrica con las 3 competencias");
await L.selectOption("#e-list .stu[open-card] .jnota","10");
await L.fill('#e-list .stu[open-card] textarea[data-k=logros]',"Alcanzó los objetivos del área.");await L.fill('#e-list .stu[open-card] textarea[data-k=mejorar]',"Redacta un currículum y una carta de presentación sin errores.");
for(const [k,n] of [["com",3],["col",3],["obj",4]]) await L.locator(`#e-list .stu[open-card] .rub[data-r=${k}] .lvl[data-n="${n}"]`).click();
await L.locator('#e-list .stu[open-card] textarea[data-k=mejorar]').blur();await L.waitForTimeout(2200);
console.log("   descriptor visible:",(await L.locator('#e-list .stu[open-card] .rub[data-r=obj] .desc').textContent()));
r=(await pool.query("select nota,rubrica from juicios where instancia='i4' and sujeto='e0' and comp='lectoescritura'")).rows[0];ok(r&&r.nota===10&&r.rubrica.obj===4,"guardado: "+JSON.stringify(r));
await abrirEval(I,"i4");await tarjeta(I,0);await I.selectOption("#e-list .stu[open-card] .jnota","8");
await I.fill('#e-list .stu[open-card] textarea[data-k=logros]',"Logró los objetivos.");await I.fill('#e-list .stu[open-card] textarea[data-k=mejorar]',"Arma planillas con fórmulas.");
for(const [k,n] of [["com",2],["col",3],["obj",3]]) await I.locator(`#e-list .stu[open-card] .rub[data-r=${k}] .lvl[data-n="${n}"]`).click();await I.locator('#e-list .stu[open-card] textarea[data-k=mejorar]').blur();await I.waitForTimeout(2200);

console.log("4) Informes");
await abrirEval(C,"i1");await C.selectOption("#i-est","e0");
const baja=async(btn)=>{const [d]=await Promise.all([C.waitForEvent("download",{timeout:30000}),C.click(btn)]);const ru=OUT+d.suggestedFilename();await d.saveAs(ru);return ru};
let ru=await baja("#i-word"),t=leer(ru);
ok(t.includes("Informe individual de evaluación")&&t.includes("Calificaciones por área")&&/Lecto Escritura \| [^|]* \| 9/.test(t)&&/Promedio \|  \| 8/.test(t),"Hito 1 individual: tabla de notas y promedio 8");
ok(t.includes("Resultado obtenido en la actividad")&&t.includes("Juicio conceptual")&&t.includes("alta motivación"),"incluye resultado, juicio conceptual e informe de los técnicos");
ok(/4 \| 3 \| 1 \| 0 \| 0 \| 100 %/.test(t),"asistencia de Ana: 4 clases, 3 puntual, 1 tarde, 100 %");
console.log(t.split("\n").slice(0,12).map(x=>"     | "+x).join("\n"));
ru=await baja("#i-gword");t=leer(ru);ok(t.includes("Planilla de calificaciones")&&t.includes("Juicio conceptual sobre el grupo")&&t.includes("Informe grupal de los técnicos")&&t.includes("Grupo comprometido"),"Hito 1 grupal: planilla, juicios del grupo y técnicos");
ru=await baja("#i-aword");t=leer(ru);ok(t.includes("Listas de asistencia diaria")&&/Ana Ejemplo \| P \| T \| P/.test(t)&&/Carla Ejemplo \| A \| A \| A/.test(t)&&/Diego Ejemplo \| J/.test(t),"lista de asistencia diaria: P / T / A / J por fecha");
ru=await baja("#i-acsv");t=fs.readFileSync(ru,"utf8");ok(t.includes('"14/10/2026";"Lecto Escritura"')&&t.includes("Falta justificada"),"asistencia en CSV ("+t.split("\n").length+" filas)");
await abrirEval(C,"i4");await C.selectOption("#i-est","e0");ru=await baja("#i-word");t=leer(ru);
ok(t.includes("Rúbrica de competencias transversales")&&/Orientación a objetivos \| Destacado \| Logrado \| Logrado/.test(t)&&t.includes("Competencias técnicas logradas"),"Hito 4 individual: rúbrica por área + nivel alcanzado + competencias técnicas");
ok(/Comunicación asertiva \| Logrado \| En desarrollo \| En desarrollo/.test(t),"nivel alcanzado = mediana de los docentes");
ru=await baja("#i-gword");t=leer(ru);ok(t.includes("24 sostienen hasta el final (de 25 inscriptos)")&&!t.includes("Bruno Ejemplo")&&t.includes("Anexo · Rúbrica"),"Hito 4 grupal: 24 de 25 sostienen, sin el desvinculado, con anexo de rúbrica");
await C.selectOption("#i-est","todos");ru=await baja("#i-word");t=execFileSync("python3",["-I","-c","import docx,sys;d=docx.Document(sys.argv[1]);print(sum(1 for p in d.paragraphs if p.text=='Informe individual de evaluación'))",ru]).toString().trim();
ok(t==="24","Hito 4, todos: "+t+" informes (sin el desvinculado)");
const [pop]=await Promise.all([C.context().waitForEvent("page"),C.click("#i-pdf")]);await pop.waitForLoadState();await pop.waitForTimeout(500);await pop.screenshot({path:OUT+"hito4-pdf.png"});
const [pop2]=await Promise.all([C.context().waitForEvent("page"),C.click("#i-gpdf")]);await pop2.waitForLoadState();await pop2.waitForTimeout(500);await pop2.screenshot({path:OUT+"hito4-grupo-pdf.png",fullPage:true});
await L.screenshot({path:OUT+"hito4-tarjeta.png",fullPage:false});

console.log("5) Registrar y Ranking sin el desvinculado");
await L.click("[data-tab=registrar]");await L.waitForTimeout(300);ok((await L.locator("#r-list .stu").count())===24,"Registrar clase: 24 participantes");
await C.click("[data-tab=ranking]");await C.waitForTimeout(400);ok(!(await C.textContent("#k-list")).includes("Bruno"),"Ranking sin el desvinculado");
console.log("errores JS:",errs.length?errs:"ninguno");console.log(f?f+" FALLAS":"TODO OK");await b.close();await pool.end();process.exit(f?1:0)})();
