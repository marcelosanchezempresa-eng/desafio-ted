const pptxgen = require("pptxgenjs");
const QR = require("qrcode");
const { applyTheme } = require("/root/.claude/skills/synced/b1794b00-8613-4562-8ee8-5807a95e7248_d7cc4fa0-0498-42e5-ab74-be647d0858aa/pptx/scripts/apply_theme.js");
const SH = "/home/user/desafio-ted/jovenes26-citef/manual/shots2/";
const URL = "https://marcelosanchezempresa-eng.github.io/desafio-ted/";
const OUT = "/home/user/desafio-ted/jovenes26-citef/Presentacion-Semaforo-Jovenes26.pptx";

const THEME = {
  name: "Jovenes 26 CITEF", headFontFace: "Calibri", bodyFontFace: "Calibri",
  colors: { dk1: "0E2338", lt1: "FFFFFF", dk2: "0F4F8A", lt2: "EEF3F9",
    accent1: "1667AE", accent2: "C4D92E", accent3: "1F8A4C", accent4: "F0B400", accent5: "C23636", accent6: "4C6178",
    hlink: "1667AE", folHlink: "0F4F8A" } };
const HEX = { verde: "1F8A4C", amarillo: "F0B400", rojo: "C23636", lima: "C4D92E", azul: "1667AE", azulOsc: "0F4F8A", tinta: "0E2338", gris: "4C6178", fondo: "EEF3F9" };

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.title = "Semáforo Jóvenes 26 · Cómo usar la aplicación";
  pres.author = "CITEF · Jóvenes 26";
  const C = pres.SchemeColor;

  pres.defineSlideMaster({ title: "PORTADA", background: { color: C.text2 },
    objects: [{ placeholder: { options: { name: "title", type: "title", x: 0.7, y: 2.2, w: 8.2, h: 1.6, fontSize: 48, bold: true, italic: true, color: C.background1, valign: "top", align: "left", margin: 0 }, text: "" } },
              { placeholder: { options: { name: "body", type: "body", x: 0.7, y: 3.9, w: 8.0, h: 1.4, fontSize: 22, color: C.background2, valign: "top", align: "left", margin: 0 }, text: "" } }] });
  pres.defineSlideMaster({ title: "CONTENIDO", background: { color: C.background1 },
    objects: [{ placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.35, w: 12.1, h: 0.9, fontSize: 34, bold: true, color: C.text2, valign: "middle", align: "left", margin: 0 }, text: "" } },
              { text: { text: "Semáforo Jóvenes 26 · CITEF", options: { x: 0.6, y: 7.0, w: 6, h: 0.3, fontSize: 10, color: C.accent6, margin: 0 } } }],
    slideNumber: { x: 12.2, y: 7.0, w: 0.5, h: 0.3, fontSize: 10, color: C.accent6, align: "right" } });

  // ----- ayudas -----
  const shot = (s, file, x, y, h, ratio) => { const w = h * ratio;
    s.addShape(pres.shapes.RECTANGLE, { x: x - 0.04, y: y - 0.04, w: w + 0.08, h: h + 0.08, fill: { color: C.background2 }, line: { color: "C8D6E6", width: 1 }, shadow: { type: "outer", blur: 6, offset: 2, angle: 90, color: "0E2338", opacity: 0.18 }, objectName: "marco " + file });
    s.addImage({ path: SH + file, x, y, w, h, altText: "Captura de pantalla de la aplicación (datos de ejemplo)" }); return w; };
  const PHONE = 800 / 1520, WIDE = 2000 / 1520;
  const num = (s, n, x, y) => { s.addShape(pres.shapes.OVAL, { x, y, w: 0.55, h: 0.55, fill: { color: C.accent2 }, line: { color: C.accent2 }, objectName: "número " + n });
    s.addText(String(n), { x, y, w: 0.55, h: 0.55, fontSize: 20, bold: true, color: C.text2, align: "center", valign: "middle", margin: 0, isTextBox: true }); };
  const paso = (s, n, titulo, texto, x, y, w) => { num(s, n, x, y);
    s.addText([{ text: titulo, options: { bold: true, fontSize: 19, color: C.text1, breakLine: true } }, { text: texto, options: { fontSize: 16, color: C.text1 } }],
      { x: x + 0.75, y: y - 0.05, w: w - 0.75, h: 1.15, valign: "top", margin: 0, paraSpaceAfter: 4, isTextBox: true }); };
  const chip = (s, txt, bg, fg, x, y, w) => { s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.48, rectRadius: 0.24, fill: { color: bg }, line: { color: bg }, objectName: "etiqueta " + txt });
    s.addText(txt, { x, y, w, h: 0.48, fontSize: 15, bold: true, color: fg, align: "center", valign: "middle", margin: 0, isTextBox: true }); };
  const caja = (s, txt, x, y, w, h, bg) => { s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: bg }, line: { color: bg }, objectName: "nota" });
    s.addText(txt, { x: x + 0.25, y: y + 0.12, w: w - 0.5, h: h - 0.24, fontSize: 15, color: C.text1, valign: "middle", margin: 0, isTextBox: true }); };
  const nueva = (sec, titulo) => { const s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: sec }); s.addText(titulo, { placeholder: "title" }); return s; };

  // ===== 1. Portada =====
  pres.addSection({ title: "Inicio" });
  let s = pres.addSlide({ masterName: "PORTADA", sectionTitle: "Inicio" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: 1.2, w: 3.3, h: 0.7, rectRadius: 0.06, fill: { color: C.accent2 }, line: { color: C.accent2 }, objectName: "marca" });
  s.addText("Jóvenes 26", { x: 0.7, y: 1.2, w: 3.3, h: 0.7, fontSize: 30, bold: true, italic: true, color: C.text2, align: "center", valign: "middle", margin: 0, isTextBox: true });
  [HEX.verde, HEX.amarillo, HEX.rojo].forEach((c, i) => s.addShape(pres.shapes.OVAL, { x: 4.25 + i * 0.42, y: 1.38, w: 0.34, h: 0.34, fill: { color: c }, line: { color: "FFFFFF", width: 1.5 }, objectName: "luz " + i }));
  s.addText("Semáforo Jóvenes 26", { placeholder: "title" });
  s.addText("Cómo entrar a la aplicación y registrar en cada clase", { placeholder: "body" });
  s.addText("CITEF · Curso Jóvenes 26 · INEFOP", { x: 0.7, y: 6.6, w: 8, h: 0.4, fontSize: 14, color: C.background2, margin: 0, isTextBox: true });
  const qrPng = await QR.toDataURL(URL, { margin: 1, width: 600, color: { dark: "0E2338FF", light: "FFFFFFFF" } });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.55, y: 1.6, w: 3.1, h: 3.75, rectRadius: 0.12, fill: { color: C.background1 }, line: { color: C.background1 }, objectName: "tarjeta QR" });
  s.addImage({ data: qrPng.replace("data:", ""), x: 9.8, y: 1.8, w: 2.6, h: 2.6, altText: "Código QR con la dirección de la aplicación" });
  s.addText("Escaneá para abrir la aplicación", { x: 9.7, y: 4.5, w: 2.8, h: 0.7, fontSize: 14, bold: true, color: C.text2, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addNotes("Bienvenida. Hoy vamos a ver cómo entrar a la aplicación y cómo registrar en cada clase. Al final la probamos todos juntos. Pueden escanear el código QR con el celular para abrir la aplicación.");

  // ===== 2. Para qué sirve =====
  pres.addSection({ title: "Qué es" });
  s = nueva("Qué es", "Una sola base para seguir a los 25 jóvenes");
  s.addText("Cada docente registra en su clase. La coordinación ve el resumen y el ranking para las pasantías.", { x: 0.6, y: 1.35, w: 12, h: 0.5, fontSize: 18, color: C.accent6, margin: 0, isTextBox: true });
  const asp = [["Asistencia y puntualidad", "Llegó en hora y se quedó toda la clase"], ["Actitud frente al aprendizaje", "Se involucra, pregunta, sostiene la tarea"], ["Comunicación", "Con compañeros, docentes, coordinación y CITEF"], ["Cumplimiento de trabajos", "Tareas, entregas y presentaciones orales"]];
  asp.forEach(([t, d], i) => { const x = 0.6 + i * 3.08;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.15, w: 2.85, h: 2.1, rectRadius: 0.12, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: "aspecto " + (i + 1) });
    num(s, i + 1, x + 0.25, 2.35);
    s.addText([{ text: t, options: { bold: true, fontSize: 17, color: C.text1, breakLine: true } }, { text: d, options: { fontSize: 14, color: C.accent6 } }], { x: x + 0.25, y: 3.0, w: 2.4, h: 1.15, valign: "top", margin: 0, paraSpaceAfter: 3, isTextBox: true }); });
  [["Logrado", HEX.verde, "Lo hizo bien"], ["En proceso", HEX.amarillo, "Le costó o lo hizo a medias: conversarlo"], ["No logrado", HEX.rojo, "No lo hizo: seguimiento personal"]].forEach(([t, c, d], i) => { const x = 0.6 + i * 4.1;
    s.addShape(pres.shapes.OVAL, { x, y: 4.85, w: 0.8, h: 0.8, fill: { color: c }, line: { color: c }, objectName: "color " + t });
    s.addText([{ text: t, options: { bold: true, fontSize: 19, color: C.text1, breakLine: true } }, { text: d, options: { fontSize: 14, color: C.accent6 } }], { x: x + 1.0, y: 4.8, w: 2.95, h: 1.0, valign: "middle", margin: 0, isTextBox: true }); });
  caja(s, "Se evalúan conductas que se observan en clase, no el nivel educativo previo.", 0.6, 6.05, 12.1, 0.7, HEX.fondo);
  s.addNotes("Cuatro aspectos, tres colores. Verde: lo hizo bien. Amarillo: le costó, hay que conversarlo. Rojo: no lo hizo, seguimiento personal. Evaluamos conductas observables, así un joven con primaria y uno con bachillerato compiten en igualdad.");

  // ===== 3. Entrar: primera vez =====
  pres.addSection({ title: "Entrar" });
  s = nueva("Entrar", "La primera vez: creá tu contraseña");
  shot(s, "00-ingreso.png", 0.7, 1.45, 5.3, PHONE);
  paso(s, 1, "Abrí la dirección", "marcelosanchezempresa-eng.github.io/desafio-ted\n(o escaneá el QR de la portada)", 4.0, 1.55, 8.6);
  paso(s, 2, "Escribí tu correo", "El mismo que te autorizó la coordinación", 4.0, 2.85, 8.6);
  paso(s, 3, "Elegí una contraseña", "8 caracteres o más. Anotala en un lugar seguro", 4.0, 4.0, 8.6);
  paso(s, 4, "Tocá «Crear mi contraseña»", "Entrás directo. Las próximas veces la app te recuerda", 4.0, 5.15, 8.6);
  s.addNotes("Esto se hace una sola vez. Solo funciona si la coordinación ya autorizó tu correo. Si te equivocás de botón y tocás Entrar la primera vez, te va a decir que la contraseña es incorrecta: tenés que tocar Crear mi contraseña.");

  // ===== 4. Puede guardar =====
  s = nueva("Entrar", "Fijate que diga «Puede guardar»");
  shot(s, "01-inicio.png", 0.7, 1.45, 5.3, PHONE);
  chip(s, "● Puede guardar", "DCF2E4", HEX.verde, 4.0, 1.7, 2.7);
  s.addText("Arriba, debajo del título. Ya podés calificar.", { x: 6.9, y: 1.7, w: 5.8, h: 0.48, fontSize: 17, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  chip(s, "● No autorizado", "FBE0E0", HEX.rojo, 4.0, 2.55, 2.7);
  s.addText("Tu correo no está en la lista: avisá a la coordinación.", { x: 6.9, y: 2.55, w: 5.8, h: 0.48, fontSize: 17, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  caja(s, "Tenela a mano en el celular: en el menú del navegador elegí «Agregar a la pantalla de inicio». Queda un ícono como el de cualquier aplicación.", 4.0, 3.55, 8.7, 1.25, HEX.fondo);
  caja(s, "¿Computadora compartida? Tocá «Salir», al lado del indicador, cuando termines.", 4.0, 5.05, 8.7, 0.9, HEX.fondo);
  s.addNotes("El indicador verde Puede guardar confirma que todo está bien. Si dice No autorizado, el correo no está en la lista o está escrito distinto.");

  // ===== 5. Registrar: elegir clase =====
  pres.addSection({ title: "Registrar" });
  s = nueva("Registrar", "Registrar una clase: empezá así");
  shot(s, "02-todos-presentes.png", 0.7, 1.45, 5.3, PHONE);
  paso(s, 1, "Entrá a «Registrar clase»", "La fecha viene con el día de hoy", 4.0, 1.55, 8.6);
  paso(s, 2, "Elegí tu componente", "Por ejemplo: Lecto Escritura, Informática…", 4.0, 2.75, 8.6);
  paso(s, 3, "Tocá «Todos presentes y puntuales»", "Todos quedan con asistencia en verde. Después corregís solo a quien llegó tarde o faltó", 4.0, 3.95, 8.6);
  caja(s, "No hay botón «Guardar»: cada toque se guarda solo. Debajo de la fecha aparece «Guardado ✓».", 4.0, 5.45, 8.7, 0.95, "DCF2E4");
  s.addNotes("Empezar siempre por Todos presentes ahorra mucho tiempo. Después solo se corrige a los que llegaron tarde o faltaron.");

  // ===== 6. Calificar =====
  s = nueva("Registrar", "Calificá a cada estudiante con un toque");
  shot(s, "04-marcando.png", 0.7, 1.45, 5.3, PHONE);
  paso(s, 4, "Tocá su nombre", "Se abren los cuatro aspectos", 4.0, 1.55, 8.6);
  paso(s, 5, "Un botón por aspecto", "Logrado · En proceso · No logrado. Debajo aparece qué significa", 4.0, 2.65, 8.6);
  paso(s, 6, "Tocá «Siguiente estudiante →»", "Pasa al que sigue. Al completar uno, aparece una ✓", 4.0, 3.75, 8.6);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 4.0, y: 5.0, w: 8.7, h: 1.45, rectRadius: 0.12, fill: { color: HEX.fondo }, line: { color: HEX.fondo }, objectName: "consejos" });
  s.addText([{ text: "¿Te equivocaste? ", options: { bold: true } }, { text: "Tocá el botón correcto. Para dejarlo vacío, tocá de nuevo el mismo.", options: { breakLine: true } },
             { text: "¿Faltó? ", options: { bold: true } }, { text: "«No logrado» en Asistencia: los otros tres se borran solos. Si está justificada, marcá la casilla." }],
    { x: 4.25, y: 5.1, w: 8.25, h: 1.25, fontSize: 15, color: C.text1, valign: "middle", margin: 0, paraSpaceAfter: 6, isTextBox: true });
  s.addNotes("Mostrar en vivo: tocar un nombre, marcar los cuatro aspectos, tocar Siguiente. Si alguien faltó, rojo en asistencia y listo. Llegó tarde: amarillo.");

  // ===== 7. Hitos =====
  s = nueva("Registrar", "Hitos: trabajos, presentaciones y pruebas");
  shot(s, "08-hito-crear.png", 0.7, 1.45, 5.3, PHONE);
  paso(s, 1, "Pestaña «Hitos» y tu componente", "Hay hitos sugeridos que salen del programa", 4.0, 1.55, 8.6);
  paso(s, 2, "Nombre, tipo y fecha de entrega", "Tocá «Crear hito»", 4.0, 2.65, 8.6);
  paso(s, 3, "Calificá a cada estudiante", "Verde: en tiempo y forma · Amarillo: tarde o incompleto · Rojo: no entregó · N/C: no corresponde", 4.0, 3.75, 8.6);
  caja(s, "Un hito vale el doble que una tarea de clase. Una prueba diagnóstica no se carga como hito: mide el punto de partida.", 4.0, 5.2, 8.7, 1.1, "FDF0C8");
  s.addNotes("Los hitos son entregas con fecha. Cuentan el doble dentro de Cumplimiento. Las pruebas diagnósticas no, porque castigarían a quien llega con menos formación.");

  // ===== 8. Revisar =====
  pres.addSection({ title: "Revisar" });
  s = nueva("Revisar", "Revisar lo cargado: Semáforo y Ranking");
  shot(s, "10-semaforo.png", 0.6, 1.4, 4.4, WIDE);
  shot(s, "11-ranking.png", 6.85, 1.4, 4.4, WIDE);
  s.addText([{ text: "Semáforo", options: { bold: true, fontSize: 18, breakLine: true } }, { text: "Cada estudiante en los cuatro aspectos, por semana, quincena o módulo. Marca a quién conversar o entrevistar.", options: { fontSize: 15 } }],
    { x: 0.6, y: 5.95, w: 5.8, h: 0.95, color: C.text1, valign: "top", margin: 0, isTextBox: true });
  s.addText([{ text: "Ranking", options: { bold: true, fontSize: 18, breakLine: true } }, { text: "Orden para las pasantías: línea en 12 cupos y en 15 ampliados.", options: { fontSize: 15 } }],
    { x: 6.85, y: 5.95, w: 5.8, h: 0.95, color: C.text1, valign: "top", margin: 0, isTextBox: true });
  s.addNotes("Revisión semanal: Semáforo, período Semanal. Debajo de los filtros figura cuántas clases cargó cada componente: así se ve si alguien no registró. La Ficha de cada estudiante sirve para preparar la conversación personal.");

  // ===== 9. Coordinación =====
  pres.addSection({ title: "Coordinación" });
  s = nueva("Coordinación", "Para la coordinación: quién entra");
  shot(s, "14b-docentes.png", 0.6, 1.5, 2.15, 1936 / 734);
  const filasC = [["Autorizar", "Configuración → Docentes autorizados: correo, nombre, rol → «Autorizar»"], ["Reiniciar contraseña", "Si alguien la olvidó. Crea una nueva con «Crear mi contraseña». No se pierde nada"], ["Dar de baja", "Si deja el curso. Lo que calificó queda guardado"]];
  filasC.forEach(([t, d], i) => { const y = 4.35 + i * 0.85;
    s.addText([{ text: t + ": ", options: { bold: true } }, { text: d }], { x: 0.6, y, w: 12.1, h: 0.7, fontSize: 16, color: C.text1, valign: "middle", margin: 0, isTextBox: true }); });
  caja(s, "Rol «Coordinación»: autoriza docentes y cambia la configuración. Rol «Docente»: califica y consulta. Cada persona entra con su propia cuenta.", 6.65, 1.45, 6.05, 2.25, HEX.fondo);
  s.addNotes("Arturo, Natalia y Rossana quedan con rol Coordinación. Nadie presta su usuario: cada uno con su correo.");

  // ===== 10. Problemas =====
  pres.addSection({ title: "Ayuda" });
  s = nueva("Ayuda", "Si algo no funciona");
  const filas = [["Lo que aparece", "Qué hacer"],
    ["«Ese correo no está autorizado»", "Pedí a la coordinación que lo agregue. Revisá cómo lo escribiste"],
    ["«Correo o contraseña incorrectos»", "¿Es la primera vez? Tocá «Crear mi contraseña», no «Entrar»"],
    ["Olvidé mi contraseña", "La coordinación toca «Reiniciar contraseña» y creás una nueva"],
    ["«No se pudo guardar… Se reintentará»", "Se cortó internet. No cierres la página: vuelve a intentar sola"],
    ["No aparece mi componente", "La coordinación lo agrega en Configuración"]];
  s.addTable(filas.map((r, i) => r.map(t => ({ text: t, options: i === 0 ? { bold: true, color: "FFFFFF", fill: { color: HEX.azulOsc } } : { color: HEX.tinta, fill: { color: i % 2 ? "FFFFFF" : HEX.fondo } } }))),
    { x: 0.6, y: 1.5, w: 12.1, colW: [4.6, 7.5], fontSize: 16, fontFace: "Calibri", border: { type: "solid", pt: 0.75, color: "C8D6E6" }, rowH: 0.72, valign: "middle", margin: [0.06, 0.15, 0.06, 0.15] });
  s.addNotes("Los cinco problemas más probables y su solución. La guía en PDF tiene todos los casos con capturas.");

  // ===== 11. Práctica =====
  pres.addSection({ title: "Práctica" });
  s = pres.addSlide({ masterName: "PORTADA", sectionTitle: "Práctica" });
  s.addText("Probémosla ahora", { placeholder: "title" });
  s.addText("Unos 15 minutos, todos juntos", { placeholder: "body" });
  const prac = ["Entrá y creá tu contraseña", "Verificá «Puede guardar»", "Registrá 3 estudiantes de práctica", "Dos docentes, misma clase: ¿ves lo que marca el otro?", "La coordinación lo ve en el Semáforo"];
  prac.forEach((t, i) => { const y = 1.35 + i * 1.05;
    s.addShape(pres.shapes.OVAL, { x: 7.9, y, w: 0.6, h: 0.6, fill: { color: C.accent2 }, line: { color: C.accent2 }, objectName: "práctica " + (i + 1) });
    s.addText(String(i + 1), { x: 7.9, y, w: 0.6, h: 0.6, fontSize: 20, bold: true, color: C.text2, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(t, { x: 8.75, y: y - 0.1, w: 4.2, h: 0.8, fontSize: 18, color: C.background1, valign: "middle", margin: 0, isTextBox: true }); });
  s.addText("Al terminar: tocá de nuevo los botones de práctica para dejarlos vacíos.", { x: 0.7, y: 6.4, w: 6.8, h: 0.6, fontSize: 14, color: C.background2, margin: 0, isTextBox: true });
  s.addNotes("Ensayo en vivo. Paso 4 es clave: dos docentes en la misma clase y fecha, uno marca y el otro tiene que verlo en segundos. Al final, borrar las calificaciones de práctica tocando de nuevo los botones.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("ok", OUT);
})().catch(e => { console.error(e); process.exit(1); });
