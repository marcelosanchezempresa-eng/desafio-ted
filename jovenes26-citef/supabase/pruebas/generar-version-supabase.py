#!/usr/bin/env python3
"""Convierte la app de claude.ai (base db del artifact) en la versión web con Supabase."""
import sys
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()

def R(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:120])
    s = s.replace(old, new)

# ---------- documento completo (ya no lo envuelve claude.ai) ----------
s = ('<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
     '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
     '<meta name="robots" content="noindex">\n' + s)
R('<style>\n/* Layout:', '''<style>
html{color-scheme:light}
body{margin:0}
[hidden]{display:none!important}
/* Layout:''')
R('</style>\n\n<header class="top">', '''.login{max-width:26rem;margin:6vh auto 0;display:flex;flex-direction:column;gap:12px}
.login .field input{width:100%}
.login .acciones{display:flex;gap:8px;flex-wrap:wrap}
.linklike{background:none;border:0;padding:0;color:var(--accent);text-decoration:underline;cursor:pointer;font-weight:700}
.salir{background:none;border:1px solid var(--band-muted);color:var(--band-ink);border-radius:99px;padding:2px 10px;font-size:.8rem;cursor:pointer}
.doc-item{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) auto auto;gap:6px;align-items:center}
@media (max-width:560px){.doc-item{grid-template-columns:1fr 1fr}}
.doc-item .baja{opacity:.55}
</style>
</head>
<body>

<header class="top">''')
R('<span class="estado" id="estado" role="status">Conectando…</span>',
  '<span class="estado" id="estado" role="status">Conectando…</span><button class="salir" id="salir" type="button" hidden>Salir</button>')
s = s.rstrip() + '\n</body>\n</html>\n'
R('<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js"></script>\n'
  '<script src="config.js"></script>\n<link rel="preconnect" href="https://fonts.googleapis.com">')

# ---------- pantalla de ingreso ----------
R('  <div id="ro" class="banner error" hidden></div>', '''  <div id="ro" class="banner error" hidden></div>

  <section id="login" class="panel login" hidden>
    <h2 style="font-size:1.3rem">Entrar</h2>
    <p class="note" id="l-ayuda">Use el correo que la coordinación autorizó. La primera vez, toque «Crear mi contraseña».</p>
    <form id="l-form" class="login" style="margin:0">
      <div class="field"><label for="l-email">Correo electrónico</label><input type="email" id="l-email" autocomplete="email" required></div>
      <div class="field" id="l-pass-f"><label for="l-pass">Contraseña</label><input type="password" id="l-pass" autocomplete="current-password" minlength="8"></div>
      <div class="acciones">
        <button class="btn primary" id="l-entrar" type="submit">Entrar</button>
        <button class="btn" id="l-crear" type="button">Crear mi contraseña</button>
      </div>
      <button class="linklike" id="l-olvido" type="button">Olvidé mi contraseña</button>
      <p class="status" id="l-status" role="status"></p>
    </form>
    <form id="l-nueva" class="login" style="margin:0" hidden>
      <div class="field"><label for="l-pass2">Nueva contraseña (mínimo 8 caracteres)</label><input type="password" id="l-pass2" autocomplete="new-password" minlength="8" required></div>
      <button class="btn primary" type="submit">Guardar contraseña</button>
      <p class="status" id="l-status2" role="status"></p>
    </form>
  </section>''')

# ---------- configuración: docentes autorizados ----------
R('''    <div class="panel row" style="justify-content:space-between">
      <p class="status" id="c-status" style="margin:0"></p>''', '''    <div class="panel" id="c-docentes-panel"><h2 style="font-size:1.15rem;margin-bottom:6px">Docentes autorizados</h2>
      <p class="note">Solo estos correos pueden entrar y calificar. Cada cambio se guarda al instante.</p>
      <div class="cfg-list" id="c-docentes"></div>
      <div class="row" style="margin-top:10px">
        <div class="field" style="flex:1;min-width:200px"><label for="d-email">Correo</label><input type="text" id="d-email" inputmode="email" placeholder="nombre@ejemplo.com"></div>
        <div class="field" style="flex:1;min-width:160px"><label for="d-nombre">Nombre</label><input type="text" id="d-nombre"></div>
        <div class="field"><label for="d-rol">Rol</label><select id="d-rol"><option value="docente">Docente</option><option value="coordinacion">Coordinación</option></select></div>
        <button class="btn" id="d-add" type="button">Autorizar</button>
      </div>
      <p class="status" id="d-status"></p>
    </div>
    <div class="panel row" style="justify-content:space-between">
      <p class="status" id="c-status" style="margin:0"></p>''')
R('<div id="cfg-lock" class="banner warn" hidden>Solo la coordinación (permiso de edición) puede guardar cambios aquí. Puede consultar la configuración.</div>',
  '<div id="cfg-lock" class="banner warn" hidden>Solo la coordinación puede cambiar la configuración. Usted puede consultarla.</div>')

# ---------- textos de ayuda ----------
R('''        <li>Revise su correo: le tiene que llegar una <b>invitación</b> a la aplicación «Semáforo Jóvenes 26».</li>
        <li>Entre a <b>claude.ai</b> con <b>ese mismo correo</b>. Si no tiene cuenta, créela con ese correo.</li>
        <li>Abra el enlace de la invitación. Arriba a la derecha tiene que decir <b>«Puede guardar»</b> en verde.</li>
        <li>Si dice <b>«Solo lectura»</b> en rojo, todavía no puede calificar: avise a la coordinación.</li>''',
'''        <li>La coordinación le da <b>la dirección de la aplicación</b>, su <b>correo de usuario</b> y una <b>contraseña</b>.</li>
        <li>Abra la dirección, escriba su correo y la contraseña, y toque <b>«Entrar»</b>. El celular la recuerda: no hace falta escribirla cada vez.</li>
        <li>Arriba tiene que decir <b>«Puede guardar»</b> en verde. Si dice <b>«No autorizado»</b>, avise a la coordinación.</li>''')
R('<p class="note">Hay una guía completa con capturas de pantalla en PDF. Esta es la versión corta.</p>',
  '<p class="note">Hay una guía completa con capturas de pantalla en PDF. Esta es la versión corta.</p>\n      <p class="note" id="ayuda-login" hidden>Para empezar, entre con su correo en la pantalla de ingreso.</p>')

# ---------- capa de datos: Supabase ----------
R('let db=null, user=null, myId=null, canAdmin=false;', 'let sb=null, perfil=null, myId=null, canAdmin=false, docentes=[];')
R('const MSG_RO="<b>Su cuenta puede ver la aplicación, pero no guardar calificaciones.</b> Para poder guardar, la coordinación tiene que invitarlo <b>por correo con permiso de Editor</b>. Abrir el enlace no alcanza. Cuando reciba la invitación, entre a claude.ai con ese correo y vuelva a abrir la aplicación.";',
  'const MSG_RO="<b>Su correo no está autorizado para guardar calificaciones.</b> Pida a la coordinación que lo agregue en <b>Configuración → Docentes autorizados</b>. Después toque «Salir» y vuelva a entrar.";')
R('document.body.classList.add("solo-lectura"); marcarEstado("no","Solo lectura");',
  'document.body.classList.add("solo-lectura"); marcarEstado("no","No autorizado");')
R('''  status("No se guardó: su cuenta es de solo lectura."); hStatus("No se guardó: su cuenta es de solo lectura.");''',
  '''  status("No se guardó: su correo no está autorizado."); hStatus("No se guardó: su correo no está autorizado.");''')
s = s.replace('No se guardó: su cuenta es de solo lectura.', 'No se guardó: su correo no está autorizado.')

# flush: enviar a Supabase por las funciones evaluar_clase / evaluar_hito
R('''  busy[path]=true; const ref=db.doc(path);
  const data={ev:body,editadoEn:new Date().toISOString(),...(myId?{editadoPor:myId}:{})};
  try{
    try{ await ref.update(data); }
    catch(e){
      if(!(e&&e.code==="invalid_argument")) throw e;
      // invalid_argument: o la clase todavía no existe, o la base rechaza a esta cuenta
      if(!makers[path]){pasarASoloLectura();return}
      try{ await ref.set(makers[path]()); }
      catch(e2){ if(e2&&e2.code==="invalid_argument"){pasarASoloLectura();return} throw e2; }
    }''', '''  busy[path]=true; const [coll,id]=path.split("/");
  try{
    const {error}=coll==="clases"
      ? await sb.rpc("evaluar_clase",{p_id:id,p_fecha:id.slice(0,10),p_comp:id.slice(11),p_cambios:body})
      : await sb.rpc("evaluar_hito",{p_id:id,p_cambios:body});
    if(error){ if(esSinPermiso(error)){pasarASoloLectura();return} throw error; }''')
R('''  }catch(e){
    say("No se pudo guardar ("+(e&&e.code||"error")+"). "+(e&&e.code==="permission_denied"?"Su acceso es de solo lectura: pida a la coordinación permiso de colaborador.":"Se reintentará en unos segundos."));''',
  '''  }catch(e){
    say("No se pudo guardar (sin conexión o error del servidor). Se reintentará en unos segundos; no cierre la página.");''')
R('function mergePending(coll,next,prev){', '''// Error de permisos de la base (correo no autorizado o dado de baja)
const esSinPermiso=e=>!!e&&(e.code==="42501"||/sin_permiso|row-level security|permission denied/i.test(e.message||""));
function mergePending(coll,next,prev){''')

# setEval / hitos: "db" pasa a ser "sb"
R('  if(!db){status("Sin conexión al registro compartido: el cambio no se guardó.");return}',
  '  if(!sb||!perfil){status("Sin conexión: el cambio no se guardó.");return}')
R('''  if(!db) return; if(!comp){$("#h-cstatus").textContent="Elija un componente.";return}''',
  '''  if(!sb) return; if(!comp){$("#h-cstatus").textContent="Elija un componente.";return}''')
R('''  const data={comp,nombre,tipo:$("#h-tipo").value,fecha,ev:{},creadoEn:new Date().toISOString(),...(myId?{autor:myId}:{})};
  $("#h-cstatus").textContent="Creando…";
  try{await db.doc("hitos/"+id).set(data); hitos[id]=data; selHito=id; $("#h-nombre").value=""; $("#h-cstatus").textContent="Hito creado ✓"; renderHitos();}
  catch(e){ if(e&&e.code==="invalid_argument"){pasarASoloLectura(); $("#h-cstatus").textContent="No se pudo crear: su cuenta es de solo lectura.";} else $("#h-cstatus").textContent="No se pudo crear ("+(e.code||"error")+"). Revise la conexión y vuelva a intentar.";}''',
  '''  const data={id,comp,nombre,tipo:$("#h-tipo").value,fecha,ev:{},autor:myId,editado_por:myId};
  $("#h-cstatus").textContent="Creando…";
  const {error}=await sb.from("hitos").insert(data);
  if(!error){hitos[id]=data; selHito=id; $("#h-nombre").value=""; $("#h-cstatus").textContent="Hito creado ✓"; renderHitos();}
  else if(esSinPermiso(error)){pasarASoloLectura(); $("#h-cstatus").textContent="No se pudo crear: su correo no está autorizado.";}
  else $("#h-cstatus").textContent="No se pudo crear. Revise la conexión y vuelva a intentar.";''')
R('''  if(e.target.id==="h-del-si"){const id=selHito; try{await db.doc("hitos/"+id).delete(); delete hitos[id]; delete overlay["hitos/"+id]; selHito=null; delAsk=false; renderHitos();}catch(err){hStatus("No se pudo eliminar ("+(err.code||"error")+").")} return}''',
  '''  if(e.target.id==="h-del-si"){const id=selHito; const {error}=await sb.from("hitos").delete().eq("id",id);
    if(error){hStatus("No se pudo eliminar. Revise la conexión y vuelva a intentar.");return}
    delete hitos[id]; delete overlay["hitos/"+id]; selHito=null; delAsk=false; renderHitos(); return}''')
R('''  if(!db||!canAdmin) return;''', '''  if(!sb||!canAdmin) return;''')
R('''  try{await db.doc("config/curso").set(draft); $("#c-status").textContent="Configuración guardada ✓"; }
  catch(e){$("#c-status").textContent=e&&e.code==="invalid_argument"?"No se pudo guardar: solo quien tiene permiso de Editor puede cambiar la configuración.":"No se pudo guardar ("+(e.code||"error")+"). Revise la conexión y vuelva a intentar.";}''',
  '''  const {error}=await sb.from("config").upsert({id:1,data:draft,editado_en:new Date().toISOString(),editado_por:myId});
  if(!error){cfg=Object.assign(structuredClone(DEFAULT_CFG),draft); $("#c-status").textContent="Configuración guardada ✓"; renderAll();}
  else $("#c-status").textContent=esSinPermiso(error)?"No se pudo guardar: solo la coordinación puede cambiar la configuración.":"No se pudo guardar. Revise la conexión y vuelva a intentar.";''')

# renderConfig: lista de docentes autorizados
R('''function renderConfig(){
  $("#cfg-lock").hidden=canAdmin; $("#c-save").disabled=!canAdmin;''', '''function renderDocentes(){
  $("#c-docentes-panel").hidden=!canAdmin; if(!canAdmin) return;
  const rol=r=>r==="coordinacion"?"Coordinación":"Docente";
  setHTML($("#c-docentes"),docentes.length?docentes.map(d=>`<div class="doc-item" data-email="${esc(d.email)}"><span class="${d.activo?"":"baja"}" style="min-width:0;overflow:hidden;text-overflow:ellipsis"><b>${esc(d.nombre||"(sin nombre)")}</b><br><span class="muted" style="font-size:.85rem">${esc(d.email)}</span></span><span class="muted">${rol(d.rol)}${d.activo?"":" · dado de baja"}</span>${d.email===myId?'<span class="muted" style="font-size:.85rem">(usted)</span>':`<button class="btn" type="button" data-act="${d.activo?"baja":"alta"}">${d.activo?"Dar de baja":"Reactivar"}</button>`}<span></span></div>`).join(""):'<p class="muted">Todavía no hay docentes autorizados.</p>');
}
async function cargarDocentes(){
  if(!canAdmin) return; const {data,error}=await sb.from("docentes").select("*").order("nombre");
  if(!error){docentes=data||[]; renderDocentes();}
}
$("#d-add").onclick=async()=>{
  const email=$("#d-email").value.trim().toLowerCase(), nombre=$("#d-nombre").value.trim(), rol=$("#d-rol").value;
  if(!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)){$("#d-status").textContent="Escriba un correo válido.";return}
  $("#d-status").textContent="Guardando…";
  const {error}=await sb.from("docentes").upsert({email,nombre,rol,activo:true});
  if(error){$("#d-status").textContent="No se pudo autorizar. Revise la conexión y vuelva a intentar.";return}
  $("#d-email").value=""; $("#d-nombre").value=""; $("#d-status").textContent=(window.J26_SUPABASE||{}).autoRegistro?"Autorizado ✓ Ya puede crear su contraseña en la pantalla de ingreso.":"Autorizado ✓ Último paso: en supabase.com → Authentication → Users → Add user → Create new user, cree la cuenta con este mismo correo y una contraseña (deje marcado «Auto Confirm User»). Después pásele al docente la dirección, el correo y la contraseña."; cargarDocentes();
};
$("#c-docentes").addEventListener("click",async e=>{
  const b=e.target.closest("[data-act]"); if(!b) return; const email=b.closest(".doc-item").dataset.email;
  const {error}=await sb.from("docentes").update({activo:b.dataset.act==="alta"}).eq("email",email);
  $("#d-status").textContent=error?"No se pudo cambiar. Vuelva a intentar.":"Cambio guardado ✓"; cargarDocentes();
});
function renderConfig(){
  $("#cfg-lock").hidden=canAdmin; $("#c-save").disabled=!canAdmin; renderDocentes();''')

# CSV: descarga directa del navegador
R('''  const dl=window.claude&&await claude.use("downloads");
  const msg=t=>(kind==="ranking"?$("#k-formula"):$("#s-cov")).textContent=t;
  if(!dl){msg("La descarga no está disponible en esta vista.");return}
  try{await dl.save({filename:`jovenes26-${kind}-${todayStr()}.csv`,data:csv})}catch(e){msg("Descarga cancelada.")}''',
  '''  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
  a.download=`jovenes26-${kind}-${todayStr()}.csv`; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);''')

# ---------- arranque ----------
i = s.index('// ---------- Arranque ----------')
j = s.index('})();\n</script>', i)
s = s[:i] + r'''// ---------- Arranque ----------
$("#r-fecha").value=todayStr();
$$(".view").forEach(x=>x.hidden=true); $("nav.tabs").hidden=true;
const filas=rows=>Object.fromEntries((rows||[]).map(r=>[r.id,r]));
function mostrarApp(v){ $$(".view").forEach(x=>{ if(!v) x.hidden=true; }); $("nav.tabs").hidden=!v; $("#login").hidden=v; $("#salir").hidden=!v;
  if(v){ const t=gp("tab"); showTab(t&&$(`[data-tab="${t}"]`)?t:"registrar"); } }
async function cargarTodo(){
  const [c,k,h]=await Promise.all([
    sb.from("config").select("data").eq("id",1).maybeSingle(),
    sb.from("clases").select("*").order("fecha",{ascending:false}).limit(5000),
    sb.from("hitos").select("*").order("fecha",{ascending:false}).limit(2000)]);
  if(c.error||k.error||h.error) throw (c.error||k.error||h.error);
  cfg=Object.assign(structuredClone(DEFAULT_CFG),(c.data&&c.data.data)||{});
  const nk=filas(k.data); mergePending("clases",nk,clases); clases=nk;
  const nh=filas(h.data); mergePending("hitos",nh,hitos); hitos=nh;
  if(!fechaLista){fechaLista=true; if(antesDelInicio($("#r-fecha").value)) $("#r-fecha").value=cfg.inicio;}
  if(!typing()){draft=null; renderAll();}
}
let fechaLista=false, canal=null;
function escuchar(){
  if(canal) return;
  const cambio=(tabla,mapa)=>p=>{
    if(p.eventType==="DELETE"){ if(p.old&&p.old.id) delete mapa()[p.old.id]; }
    else if(p.new&&p.new.id){ const n={[p.new.id]:p.new}; mergePending(tabla,n,{}); mapa()[p.new.id]=n[p.new.id]; }
    if(!typing()) renderAll();
  };
  canal=sb.channel("j26")
    .on("postgres_changes",{event:"*",schema:"public",table:"clases"},cambio("clases",()=>clases))
    .on("postgres_changes",{event:"*",schema:"public",table:"hitos"},cambio("hitos",()=>hitos))
    .on("postgres_changes",{event:"*",schema:"public",table:"config"},p=>{ if(p.new&&p.new.data){cfg=Object.assign(structuredClone(DEFAULT_CFG),p.new.data); if(!typing()){draft=null;renderAll();}} })
    .subscribe(st=>{ if(st==="SUBSCRIBED") cargarTodo().catch(()=>{}); });
}
// Al volver a la pestaña (por ejemplo, después de bloquear el celular) se recargan los datos por si se perdió algún aviso
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible"&&perfil&&perfil.autorizado) cargarTodo().catch(()=>{}); });

async function entrar(session){
  if(!session){ perfil=null; mostrarApp(false); marcarEstado("","Sin sesión"); $("#conn").hidden=true; $("#who").textContent=""; return; }
  $("#conn").hidden=false; $("#conn").className="banner"; $("#conn").textContent="Conectando con la base de datos…";
  const {data,error}=await sb.rpc("mi_perfil");
  if(error){ $("#conn").className="banner error"; $("#conn").textContent="No se pudo conectar con la base de datos. Revise la conexión a internet y recargue la página."; marcarEstado("no","Sin conexión"); return; }
  perfil=data; myId=perfil.email; canAdmin=perfil.rol==="coordinacion";
  $("#who").textContent=(perfil.nombre||perfil.email)+(canAdmin?" · coordinación":"");
  mostrarApp(true);
  if(!perfil.autorizado){ $("#conn").hidden=true; pasarASoloLectura();
    $$(".view").forEach(x=>x.hidden=true); $("nav.tabs").hidden=true;
    $("#ro").innerHTML+="<br><br>Usted entró como <b>"+esc(perfil.email)+"</b>. Si ese no es el correo que le dio la coordinación, toque «Salir» y entre con el correcto."; return; }
  try{ await cargarTodo(); }catch(e){ $("#conn").className="banner error"; $("#conn").textContent="No se pudieron leer los datos. Recargue la página."; return; }
  $("#conn").hidden=true; marcarEstado("ok","Puede guardar"); escuchar(); cargarDocentes();
}

// ---------- Ingreso ----------
const lst=t=>$("#l-status").textContent=t;
const tradErr=e=>{const m=(e&&e.message)||"";
  if(/Invalid login credentials/i.test(m)) return (window.J26_SUPABASE||{}).autoRegistro?"Correo o contraseña incorrectos. Si es la primera vez, toque «Crear mi contraseña».":"Correo o contraseña incorrectos. Revise que sean los que le dio la coordinación (respetando mayúsculas y minúsculas).";
  if(/Email not confirmed/i.test(m)) return "Todavía no confirmó su correo. Busque el mensaje de confirmación (revise también Spam) y toque el enlace.";
  if(/already registered|already been registered/i.test(m)) return "Ese correo ya tiene contraseña. Toque «Entrar», o «Olvidé mi contraseña».";
  if(/at least|Password should/i.test(m)) return "La contraseña tiene que tener al menos 8 caracteres.";
  if(/rate limit|too many/i.test(m)) return "Demasiados intentos seguidos. Espere unos minutos y vuelva a intentar.";
  return "No se pudo completar. Revise la conexión y vuelva a intentar.";};
$("#l-form").addEventListener("submit",async e=>{ e.preventDefault();
  const email=$("#l-email").value.trim().toLowerCase(), password=$("#l-pass").value;
  if(!password){lst("Escriba su contraseña.");return}
  lst("Entrando…"); const {error}=await sb.auth.signInWithPassword({email,password}); if(error) lst(tradErr(error)); else lst("");
});
$("#l-crear").onclick=async()=>{
  const email=$("#l-email").value.trim().toLowerCase(), password=$("#l-pass").value;
  if(!email||!password||password.length<8){lst("Escriba su correo y una contraseña nueva de al menos 8 caracteres.");return}
  lst("Creando…"); const {data,error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});
  if(error){lst(tradErr(error));return}
  lst(data.session?"":"Listo. Le enviamos un correo a "+email+": ábralo y toque el enlace para confirmar. Después vuelva acá y toque «Entrar».");
};
$("#l-olvido").onclick=async()=>{
  const email=$("#l-email").value.trim().toLowerCase(); if(!email){lst("Escriba su correo y vuelva a tocar «Olvidé mi contraseña».");return}
  const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
  lst(error?tradErr(error):"Le enviamos un correo a "+email+" con un enlace para crear una contraseña nueva.");
};
$("#l-nueva").addEventListener("submit",async e=>{ e.preventDefault();
  const {error}=await sb.auth.updateUser({password:$("#l-pass2").value});
  $("#l-status2").textContent=error?tradErr(error):"Contraseña guardada ✓"; if(!error){$("#l-nueva").hidden=true;$("#l-form").hidden=false;}
});
$("#salir").onclick=async()=>{ await sb.auth.signOut(); location.reload(); };

(async()=>{
  const C=window.J26_SUPABASE||{};
  if(!window.supabase||!C.url||!C.anonKey){ mostrarApp(false); $("#login").hidden=true; $("#conn").hidden=false; $("#conn").className="banner error";
    $("#conn").innerHTML=!window.supabase?"No se pudo cargar la conexión con la base de datos. Revise la conexión a internet y recargue la página.":"Falta configurar la base de datos: complete <b>config.js</b> con la dirección y la clave pública del proyecto de Supabase."; marcarEstado("no","Sin configurar"); return; }
  // Sin auto-registro (lo recomendado): la coordinación crea las cuentas en Supabase y entrega la contraseña inicial.
  if(!C.autoRegistro){ $("#l-crear").hidden=true;
    $("#l-ayuda").textContent="Escriba su correo y la contraseña que le dio la coordinación.";
    $("#l-olvido").onclick=()=>lst("Pida a la coordinación una contraseña nueva. La coordinación la cambia desde el panel de Supabase."); }
  sb=window.supabase.createClient(C.url,C.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  sb.auth.onAuthStateChange((ev,session)=>{
    if(ev==="PASSWORD_RECOVERY"){ mostrarApp(false); $("#l-form").hidden=true; $("#l-nueva").hidden=false; return; }
    if(ev==="SIGNED_IN"||ev==="SIGNED_OUT"||ev==="INITIAL_SESSION") setTimeout(()=>entrar(session),0);
  });
})();
''' + s[j:]
# referencias al artifact que no deben quedar
for bad in ['claude.use', 'db.doc(', 'db.collection(']:
    assert bad not in s, bad
open(dst, "w", encoding="utf-8").write(s)
print("ok", len(s))
