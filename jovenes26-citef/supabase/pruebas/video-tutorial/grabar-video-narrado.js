// Video tutorial (vertical, sin audio) con DATOS DE EJEMPLO: clases pendientes + Hito 1 con botones.
const {chromium}=require("playwright");const {Pool}=require("pg");const fs=require("fs");const {execFileSync}=require("child_process");
const pool=new Pool({host:"/var/lib/postgresql/j26test",port:55432,user:"postgres",database:"postgres"});
const MOCK=fs.readFileSync(__dirname+"/mock-supabase.js","utf8");const OUT=__dirname+"/../video/";fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
const SEED="/home/user/desafio-ted/jovenes26-citef/supabase/horario-noviembre-2026.sql";
const W=390,H=844;const TTS=__dirname+"/../tts/";const DUR=JSON.parse(fs.readFileSync(TTS+"duraciones.json","utf8"));const habla=[];
(async()=>{
  // Datos de ejemplo
  const nombres=["Ana","Bruno","Carla","Diego","Elena","Facundo","Gimena","Hugo","Inés","Joaquín","Karen","Lucas","Micaela","Nicolás","Oriana","Pablo","Quimey","Rodrigo","Sofía","Tomás","Úrsula","Valentín","Wanda","Ximena","Yamil"];
  await pool.query("update config set data=jsonb_set(jsonb_set(data-'horario','{estudiantes}',$1::jsonb),'{min}','10')",[JSON.stringify(nombres.map((n,i)=>({id:"e"+i,nivel:"",nombre:n+" Ejemplo"})))]);
  execFileSync("su",["postgres","-c","psql -q -h /var/lib/postgresql/j26test -p 55432 -f -"],{input:fs.readFileSync(SEED)});
  await pool.query("truncate clases,hitos,juicios; truncate docentes; delete from storage.objects");
  await pool.query("insert into docentes(email,nombre,rol,componentes) values ('prof@ej.uy','Profe Ejemplo','docente','{lectoescritura}'),('coord@ej.uy','Coord','coordinacion','{}')");
  let r=7;const rnd=()=>(r=(r*9301+49297)%233280)/233280;
  for(const f of ["2026-11-11","2026-11-13"]){const ev={};for(let i=0;i<25;i++){const L=()=>{const x=rnd()+i*0.01;return x<0.6?"v":x<0.9?"a":"r"};ev["e"+i]={as:L(),ac:L(),co:L(),cu:L()}}
    await pool.query("insert into clases(id,fecha,comp,ev,autor) values($1,$2,'lectoescritura',$3,'prof@ej.uy')",[f+"_lectoescritura",f,JSON.stringify(ev)]);}
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:2,locale:"es-UY",colorScheme:"light"});
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/@supabase/,x=>x.fulfill({contentType:"text/javascript",body:MOCK}));
  await ctx.addInitScript(()=>{try{localStorage.clear();localStorage.setItem("mockEmail","prof@ej.uy")}catch(x){}});
  const t0=Date.now();const p=await ctx.newPage();await p.goto("http://localhost:8765/");await p.waitForTimeout(1800);
  await p.addStyleTag({content:`
    #vcap{position:fixed;left:12px;right:12px;bottom:22px;z-index:9999;background:rgba(14,35,56,.94);color:#fff;border-radius:16px;padding:14px 16px;font:700 19px/1.3 Montserrat,system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.35);transition:opacity .25s}
    #vcap small{display:block;font:500 15px/1.35 'Atkinson Hyperlegible',system-ui,sans-serif;color:#cfe0f2;margin-top:4px}
    #vcap b{color:#c4d92e}
    #vtap{position:fixed;z-index:10000;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;border:5px solid #c4d92e;background:rgba(196,217,46,.25);pointer-events:none;opacity:0;transition:opacity .15s,transform .35s;transform:scale(.6)}
    #vtap.on{opacity:1;transform:scale(1)}
    #vcard{position:fixed;inset:0;z-index:10001;background:linear-gradient(160deg,#1667ae,#0f4f8a);color:#fff;display:flex;flex-direction:column;justify-content:center;padding:34px;gap:14px;font-family:Montserrat,system-ui,sans-serif}
    #vcard .m{align-self:flex-start;background:#c4d92e;color:#0f4f8a;font:italic 800 30px Montserrat;padding:6px 14px;border-radius:8px}
    #vcard h1{font:italic 800 34px/1.15 Montserrat;margin:10px 0 0}
    #vcard p{font:500 19px/1.4 'Atkinson Hyperlegible',system-ui;color:#cfe0f2;margin:0}
    #vcard ol{font:700 19px/1.6 'Atkinson Hyperlegible';margin:6px 0 0;padding-left:1.2em}
    header.top{position:static!important}`});
  // Captura de pantalla del navegador a resolución completa (CDP screencast)
  const FR=OUT+"frames/";fs.mkdirSync(FR,{recursive:true});const frames=[];const cdp=await ctx.newCDPSession(p);
  cdp.on("Page.screencastFrame",async f=>{const n=FR+String(frames.length).padStart(5,"0")+".jpg";fs.writeFileSync(n,Buffer.from(f.data,"base64"));frames.push({n,t:f.metadata.timestamp});try{await cdp.send("Page.screencastFrameAck",{sessionId:f.sessionId})}catch(e){}});
  await cdp.send("Page.startScreencast",{format:"jpeg",quality:88,maxWidth:W*2,maxHeight:H*2,everyNthFrame:1});
  const t1=Date.now();
  const card=async(html,ms)=>{await p.evaluate(h=>{let c=document.getElementById("vcard");if(!c){c=document.createElement("div");c.id="vcard";document.body.appendChild(c)}c.innerHTML=h},html);await p.waitForTimeout(ms);await p.evaluate(()=>{const c=document.getElementById("vcard");if(c)c.remove()});};
  const cap=async(t,sub="",ms=2600)=>{await p.evaluate(([t,s])=>{let c=document.getElementById("vcap");if(!c){c=document.createElement("div");c.id="vcap";document.body.appendChild(c)}c.innerHTML=t+(s?`<small>${s}</small>`:"")},[t,sub]);await p.waitForTimeout(ms);};
  const sinCap=()=>p.evaluate(()=>{const c=document.getElementById("vcap");if(c)c.remove()});
  const ver=async(loc,block="center")=>{await loc.evaluate((e,b)=>e.scrollIntoView({block:b,behavior:"smooth"}),block);await p.waitForTimeout(700);};
  const tap=async(loc,espera=900)=>{await ver(loc);const bx=await loc.boundingBox();
    await p.evaluate(([x,y])=>{let t=document.getElementById("vtap");if(!t){t=document.createElement("div");t.id="vtap";document.body.appendChild(t)}t.style.left=x+"px";t.style.top=y+"px";t.classList.add("on")},[bx.x+bx.width/2,bx.y+bx.height/2]);
    await p.waitForTimeout(450);await loc.click();await p.waitForTimeout(250);await p.evaluate(()=>document.getElementById("vtap").classList.remove("on"));await p.waitForTimeout(espera);};
  const elegir=async(sel,val,espera=900)=>{const loc=p.locator(sel);await ver(loc);const bx=await loc.boundingBox();
    await p.evaluate(([x,y])=>{let t=document.getElementById("vtap");if(!t){t=document.createElement("div");t.id="vtap";document.body.appendChild(t)}t.style.left=x+"px";t.style.top=y+"px";t.classList.add("on")},[bx.x+bx.width/2,bx.y+bx.height/2]);
    await p.waitForTimeout(450);await loc.selectOption(val);await p.waitForTimeout(250);await p.evaluate(()=>document.getElementById("vtap").classList.remove("on"));await p.waitForTimeout(espera);};
  const escribir=async(loc,txt)=>{await ver(loc);await loc.click();await loc.pressSequentially(txt,{delay:28});await loc.blur();await p.waitForTimeout(700);};

  // Narración: cada frase marca su inicio; la acción ocurre mientras se dice.
  const hablar=i=>{habla.push({i,t:Date.now()/1000});return p.waitForTimeout(Math.round((DUR[i]+0.35)*1000));};
  // ---- Portada
  await p.evaluate(h=>{const c=document.createElement("div");c.id="vcard";c.innerHTML=h;document.body.appendChild(c)},`<span class="m">Jóvenes 26</span><h1>Cómo poner al día tus registros</h1><p>Para el informe del Hito 1 (30/11) que Natalia entrega a INEFOP.</p><ol><li>Clases pendientes</li><li>Evaluación del Hito 1</li></ol>`);
  await p.waitForTimeout(600); await hablar(0);
  // ---- Parte 1
  await p.evaluate(()=>{document.getElementById("vcard").innerHTML='<span class="m">Parte 1</span><h1>Clases pendientes</h1>';});
  let h=hablar(1); await p.waitForTimeout(1500); await p.evaluate(()=>{document.getElementById("vcard").remove();scrollTo(0,0)});
  await cap("Al entrar, la app te avisa qué clases <b>te faltan registrar</b>.","Salen del horario de Natalia.",0); await h;
  h=hablar(2); await cap("Se abre esa <b>fecha</b> y tu <b>componente</b>.","Se puede cargar con fecha pasada.",0); await tap(p.locator("[data-pend]"),200); await h;
  h=hablar(3); await cap("<b>«Todos presentes y puntuales»</b>","Después corregís solo a quien llegó tarde o faltó.",0); await tap(p.locator("#r-todos"),200); await h;
  h=hablar(4); await cap("Tocá el nombre y marcá <b>un botón por aspecto</b>.","🟢 Logrado · 🟡 En proceso · 🔴 No logrado",0);
  await tap(p.locator(".stu-head").first(),150); for(const [k,l] of [["ac","v"],["co","a"],["cu","v"]]) await tap(p.locator(`.stu[open-card] .dim[data-k=${k}] .lvl[data-l=${l}]`),80); await h;
  h=hablar(5); await cap("<b>«Siguiente estudiante»</b> y así con todos.","Cada toque se guarda solo.",0); await p.waitForTimeout(700); await tap(p.locator(".stu[open-card] .next"),200); await h;
  await sinCap();
  // ---- Parte 2
  await p.evaluate(()=>{const c=document.createElement("div");c.id="vcard";c.innerHTML='<span class="m">Parte 2</span><h1>Evaluación del Hito 1</h1><p>Con botones y frases sugeridas.</p>';document.body.appendChild(c)});
  h=hablar(6); await p.waitForTimeout(1700); await p.evaluate(()=>{document.getElementById("vcard").remove();scrollTo(0,0)});
  await cap("<b>Evaluaciones</b> → <b>Hito 1</b> y tu componente.","",0); await tap(p.locator("[data-tab=evaluaciones]"),150); await elegir("#e-inst","i1",100); await h;
  h=hablar(7); await cap("Una sola vez: la <b>actividad de diagnóstico</b>.","",0);
  { const act=p.locator('#e-grupo textarea[data-suj=_actividad]'); await ver(act); await act.click(); await act.pressSequentially("Lectura de un aviso laboral y cinco preguntas.",{delay:22}); await act.blur(); } await h;
  h=hablar(8); await cap("La <b>nota de 1 a 12</b> y el <b>resultado</b> en una línea.","",0);
  await tap(p.locator("#e-list .stu-head").first(),100); await elegir("#e-list .stu[open-card] .jnota","9",100);
  { const l=p.locator("#e-list .stu[open-card] textarea[data-k=logros]"); await ver(l); await l.click(); await l.pressSequentially("Respondió 4 de 5 preguntas.",{delay:18}); await l.blur(); } await h;
  h=hablar(9); await cap("Elegí el <b>nivel de partida</b>.","La app sugiere uno según el semáforo; decidís vos.",0); await p.waitForTimeout(1200); await tap(p.locator('#e-list .stu[open-card] .nivel-sel .lvl[data-l=v]'),100); await h;
  h=hablar(10); await cap("Tocá las <b>frases sugeridas</b>: el juicio se arma solo.","Si querés, ajustás una palabra.",0);
  await tap(p.locator('#e-list .stu[open-card] .sug-chips[data-tag=juicio] .sug').first(),250); await tap(p.locator('#e-list .stu[open-card] .sug-chips[data-tag=juicio] .sug').first(),100); await h;
  h=hablar(11); await cap("<b>Orientaciones</b> con un toque, y <b>«Siguiente estudiante»</b>.","Todo se guarda solo.",0);
  await tap(p.locator('#e-list .stu[open-card] .sug-chips[data-tag=orient] .sug').nth(1),150); await tap(p.locator("#e-list .stu[open-card] .next"),100); await h;
  await sinCap();
  // ---- Cierre
  await p.evaluate(()=>{const c=document.createElement("div");c.id="vcard";c.innerHTML='<span class="m">Jóvenes 26</span><h1>¡Gracias, profes!</h1><p>Antes del <b style="color:#c4d92e">viernes 27/11 al mediodía</b>:</p><ol><li>Clases al día</li><li>Hito 1: nota y juicio de cada participante, y el juicio del grupo</li></ol><p style="margin-top:14px">Dudas: escribile a Natalia.</p>';document.body.appendChild(c)});
  await hablar(12); await p.waitForTimeout(1200);
  await p.waitForTimeout(300);await cdp.send("Page.stopScreencast");await ctx.close();await b.close();
  let lista="";frames.forEach((f,i)=>{const d=i<frames.length-1?Math.max(0.01,frames[i+1].t-f.t):0.6;lista+=`file '${f.n}'\nduration ${d.toFixed(3)}\n`});lista+=`file '${frames[frames.length-1].n}'\n`;
  fs.writeFileSync(OUT+"lista.txt",lista);
  const t0f=frames[0].t; fs.writeFileSync(OUT+"habla.json",JSON.stringify(habla.map(x=>({i:x.i,ofs:+(x.t-t0f).toFixed(3)}))));const skip=0;
  execFileSync("ffmpeg",["-y","-loglevel","error","-f","concat","-safe","0","-i",OUT+"lista.txt","-vf","fps=30,scale=720:-2:flags=lanczos,format=yuv420p","-c:v","libx264","-preset","slow","-crf","24","-movflags","+faststart","-an",OUT+"solo-video.mp4"]);
  console.log("ok",skip);
  await pool.end()})();
