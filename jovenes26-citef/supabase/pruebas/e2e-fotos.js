// Fotos de participantes: subida por la coordinación, vista por docentes, permisos. Usa imágenes sintéticas (no fotos reales).
const {chromium}=require("playwright");const {Pool}=require("pg");const fs=require("fs");const {execFileSync}=require("child_process");
const pool=new Pool({host:"/var/lib/postgresql/j26test",port:55432,user:"postgres",database:"postgres"});
const MOCK=fs.readFileSync(__dirname+"/mock-supabase.js","utf8");const OUT=__dirname+"/../ux/";const TMP=__dirname+"/../fotos-sinteticas/";
(async()=>{
fs.rmSync(TMP,{recursive:true,force:true});fs.mkdirSync(TMP,{recursive:true});
execFileSync("python3",["-I","-c",`
from PIL import Image,ImageDraw
import sys
d=sys.argv[1]
for n,c in [("e0 - Ana Ejemplo","#f2709c"),("Bruno Ejemplo","#9fd8e8"),("CARLA ejemplo","#a9d18e"),("Desconocido Perez","#ffe45c")]:
    im=Image.new("RGB",(300,360),c);dr=ImageDraw.Draw(im);dr.ellipse((90,60,210,180),fill="#0e2338");dr.rectangle((60,200,240,360),fill="#0e2338");im.save(d+n+".jpg")
`,TMP]);
await pool.query("truncate clases,hitos,juicios; truncate docentes; delete from storage.objects");
fs.rmSync(__dirname+"/storage-fotos",{recursive:true,force:true});fs.mkdirSync(__dirname+"/storage-fotos");
await pool.query("insert into docentes(email,nombre,rol,componentes) values ('coord@ej.uy','Natalia Ejemplo','coordinacion','{administracion}'),('lect@ej.uy','Marcelo Ejemplo','docente','{lectoescritura}')");
const b=await chromium.launch();const errs=[];let fa=0;const ok=(c,m)=>{console.log((c?"  OK  ":"  FALLA ")+m);if(!c)fa++};
async function abrir(email,w=1100,h=900){const ctx=await b.newContext({viewport:{width:w,height:h},locale:"es-UY",deviceScaleFactor:2});
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/@supabase/,r=>r.fulfill({contentType:"text/javascript",body:MOCK}));
  await ctx.addInitScript(e=>{try{localStorage.clear();localStorage.setItem("mockEmail",e)}catch(x){}},email);
  const p=await ctx.newPage();p.on("pageerror",e=>errs.push(e.message));await p.goto("http://localhost:8765/");await p.waitForTimeout(1500);return p}
const filas=async()=>(await pool.query("select name from storage.objects where bucket_id='fotos' order by name")).rows.map(r=>r.name);
console.log("1) La coordinación sube varias fotos");
const C=await abrir("coord@ej.uy");await C.click("[data-tab=config]");await C.waitForTimeout(400);
ok(await C.isVisible("#c-fotos-varias"),"ve «Subir varias fotos»");
await C.setInputFiles("#c-fotos-in",fs.readdirSync(TMP).map(f=>TMP+f));await C.waitForTimeout(3500);
const msg=await C.textContent("#c-fotos-status");console.log("    «"+msg+"»");
ok(JSON.stringify(await filas())==='["e0.jpg","e1.jpg","e2.jpg"]',"se guardaron 3 (por id, por nombre y sin importar mayúsculas): "+(await filas()).join(", "));
ok(msg.includes("3 fotos guardadas")&&msg.includes("Desconocido Perez"),"avisa cuál archivo no reconoció");
const dim=execFileSync("python3",["-I","-c","from PIL import Image;import sys;print(Image.open(sys.argv[1]).size)",__dirname+"/storage-fotos/e0.jpg"]).toString().trim();
ok(dim==="(256, 256)","la app recorta en cuadrado y achica: "+dim);
console.log("2) El docente las ve");
const L=await abrir("lect@ej.uy",430);await L.selectOption("#r-comp","lectoescritura");await L.waitForTimeout(500);
ok((await L.locator("#r-list img.av").count())===3&&(await L.locator("#r-list .av.ini").count())>=20,"Registrar clase: 3 fotos y las demás con iniciales");
const nat=await L.locator("#r-list img.av").first().evaluate(i=>i.complete&&i.naturalWidth);ok(nat===256,"la foto carga (ancho "+nat+")");
await L.screenshot({path:OUT+"fotos-registrar.png"});
await L.click("[data-tab=ficha]");await L.waitForTimeout(400);ok(await L.isVisible("#f-body img.av.lg"),"Ficha: foto grande");
await L.click("[data-tab=evaluaciones]");await L.waitForTimeout(400);ok((await L.locator("#e-list img.av").count())===3,"Evaluaciones: con fotos");
console.log("3) Permisos");
const up=await L.evaluate(async()=>{const c=window.supabase.createClient("x","y");const r=await c.storage.from("fotos").upload("e5.jpg",new Blob(["x"]),{upsert:true});return r.error?"rechazado":"subió"});
ok(up==="rechazado","un docente no puede subir fotos");
const rm=await L.evaluate(async()=>{const c=window.supabase.createClient("x","y");const r=await c.storage.from("fotos").remove(["e0.jpg"]);return (r.data||[]).length});
ok(rm===0&&(await filas()).includes("e0.jpg"),"un docente no puede borrar fotos");
const X=await abrir("intruso@gmail.com",430);const vis=await X.evaluate(async()=>{const c=window.supabase.createClient("x","y");const r=await c.storage.from("fotos").list("");return (r.data||[]).length});
ok(vis===0,"un correo no autorizado no ve ninguna foto");
console.log("4) Cambiar y quitar");
await C.locator('[data-foto="e1"]').click();await C.waitForTimeout(200);ok((await C.textContent("#c-fotos-status")).includes("Cambiar"),"tocar una foto existente ofrece Cambiar / Quitar");
await C.click('[data-fa="quitar"]');await C.waitForTimeout(1200);ok(!(await filas()).includes("e1.jpg"),"«Quitar» borra la foto");
await C.locator('[data-foto="e3"]').click();await C.waitForTimeout(200);
await C.setInputFiles("#c-foto-uno",TMP+"Desconocido Perez.jpg");await C.waitForTimeout(1500);
ok((await filas()).includes("e3.jpg"),"tocar a alguien sin foto sube una foto para esa persona: «"+await C.textContent("#c-fotos-status")+"»");
await C.locator("#c-est").screenshot({path:OUT+"fotos-config.png",clip:undefined}).catch(()=>{});
console.log("5) Las fotos no salen en descargas");
const csv=await C.evaluate(()=>document.documentElement.outerHTML.includes("storage-fotos"));ok(!csv,"sin rutas de archivos en la página");
console.log("errores JS:",errs.length?errs:"ninguno");console.log(fa?fa+" FALLAS":"TODO OK");await b.close();await pool.end();process.exit(fa?1:0)})();
