const pptxgen = require("pptxgenjs");
const QR = require("qrcode");
const { applyTheme } = require("/root/.claude/skills/synced/b1794b00-8613-4562-8ee8-5807a95e7248_d7cc4fa0-0498-42e5-ab74-be647d0858aa/pptx/scripts/apply_theme.js");
const SH = "/home/user/desafio-ted/jovenes26-citef/manual/shots4/";
const URL = "https://marcelosanchezempresa-eng.github.io/desafio-ted/";
const OUT = "/home/user/desafio-ted/jovenes26-citef/Guia-Horario-Coordinacion.pptx";

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
  pres.title = "Horario de clases · Guía para la coordinación";
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
  const PHONE = 800 / 1520, WIDE = 2000 / 1520, S3 = "../shots3/";
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

  const pasos = (s, items, x, y0, w, dy) => items.forEach(([t, d], i) => paso(s, i + 1, t, d, x, y0 + i * dy, w));

  // ===== 1. Cargar la semana =====
  pres.addSection({ title: "Cargar" });
  let s = nueva("Cargar", "1 · Cargar el horario de la semana");
  pasos(s, [
    ["Pestaña «Horario»", "Marcá «Editar horario (coordinación)»"],
    ["«Editar semana completa»", "En la semana que querés cargar"],
    ["«Copiar la semana anterior»", "Si la semana se repite: queda todo cargado"],
    ["Cambiá lo que sea distinto", "Lo cambiado queda con borde oscuro"],
    ["«Guardar semana»", "Todo junto. Lo ven todos al abrir la app"]], 0.6, 1.5, 5.2, 0.98);
  shot(s, "01-editar.png", 6.15, 1.5, 1.75, 2152 / 582);
  shot(s, "02-planilla.png", 6.15, 3.55, 2.85, 2136 / 924);
  caja(s, "Nada se guarda hasta «Guardar semana». «Cancelar» descarta todo. Para un cambio puntual, tocá solo ese bloque.", 0.6, 6.55, 12.1, 0.5, HEX.fondo);
  s.addNotes("La forma más rápida: Editar semana completa, Copiar la semana anterior, cambiar lo distinto y Guardar semana. PO TOLS y DAT aparecen en las listas tal como se muestran. El DAT no se copia solo porque es ocasional.");

  // ===== 2. Compartir la imagen =====
  pres.addSection({ title: "Compartir" });
  s = nueva("Compartir", "2 · Compartir la imagen por WhatsApp");
  pasos(s, [
    ["Elegí las semanas", "Con ‹ Esta semana › : la imagen lleva las 3 semanas que se ven"],
    ["Tocá «Compartir imagen»", "Se arma con los colores de cada componente"],
    ["Mandala al grupo", "Celular: menú de compartir → WhatsApp. Computadora: se descarga; adjuntala en WhatsApp Web"]], 0.6, 1.5, 5.6, 1.2);
  shot(s, "03b-boton.png", 0.6, 5.55, 0.98, 2136 / 418);
  shot(s, "03-imagen.png", 6.7, 1.45, 5.0, 1600 / 1314);
  s.addNotes("La imagen es opcional: la app ya muestra el horario actualizado. Sirve para el grupo de WhatsApp, como se hacía con la captura. Tus clases, los recesos y los bloques sin calificación salen marcados.");

  // ===== 3. Avisar a los docentes =====
  pres.addSection({ title: "Avisar" });
  s = nueva("Avisar", "3 · Avisar a los docentes de un cambio");
  shot(s, "04-aviso-docente.png", 0.7, 1.45, 5.3, PHONE);
  pasos(s, [
    ["Cambiá la clase y guardá", "En una clase ya cargada, «Avisar a los docentes» viene marcado solo: dejalo así"],
    ["El docente lo ve al abrir la app", "«Cambios en el horario», con lo que había antes, y un punto en la pestaña Horario"],
    ["Toca «Entendido»", "El aviso desaparece. En el inicio también ve «Tu próxima clase»"]], 4.0, 1.55, 8.6, 1.2);
  caja(s, "Semana nueva: no avisa, para no llenar de avisos. Solo avisa de los bloques que cambiaron.", 4.0, 5.2, 8.7, 0.7, "DCF2E4");
  caja(s, "El aviso aparece al abrir la app, no con el teléfono bloqueado. Si el cambio es urgente, mandá también la imagen por WhatsApp.", 4.0, 6.05, 8.7, 0.75, "FDF0C8");
  s.addNotes("Solo reciben el aviso los docentes del componente afectado; la coordinación ve todos. El aviso queda hasta que el docente toca Entendido.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("ok", OUT);
})().catch(e => { console.error(e); process.exit(1); });
