# Semáforo Jóvenes 26 · CITEF

Aplicación de seguimiento semanal/quincenal para el curso **Jóvenes 26** (CITEF, Flores; respaldo INEFOP).

- **App publicada (compartida):** https://claude.ai/artifact/F7yi3vRJknicjcmxyFiu3L
- **Código:** `index.html` (página única, sin dependencias salvo Google Fonts).

## Qué evalúa
Cuatro aspectos, cada uno en semáforo (verde = logrado, amarillo = en proceso, rojo = no logrado):
1. Asistencia y puntualidad (opción "falta justificada": no computa).
2. Actitud frente al aprendizaje.
3. Comunicación (con compañeros, docentes, coordinación y CITEF).
4. Cumplimiento de trabajos y presentaciones orales (opción "hoy no había entrega").

## Hitos de cumplimiento
Cada componente define hitos con fecha (trabajo práctico, presentación oral, prueba). Se evalúan en semáforo o «No corresponde». Cada hito vale como N tareas de clase (2 por defecto) dentro de Cumplimiento. La pestaña Hitos ofrece hitos sugeridos a partir del programa de cada componente.

## Calendario
Inicio 13/10/2026. Módulo 1: 13/10–23/12. Receso: 24/12–31/01. Módulo 2: 01/02–15/03/2027 (fechas provisorias, editables en Configuración). Semanas y quincenas se cuentan de lunes a viernes; las que caen enteras en receso se omiten.

## Cálculo
- Verde = 100, amarillo = 50, rojo = 0. Se promedia cada aspecto en el período.
- Índice de empleabilidad = promedio ponderado (25 % cada aspecto por defecto, editable).
- Ausencia (rojo en asistencia) deja sin calificar los otros tres aspectos de esa clase.
- Ranking: desempate por menos rojos y luego mejor asistencia; quienes tienen menos de N registros quedan al final.
- Líneas de corte de pasantías: 12 cupos y 15 ampliados (editables).
- "Entrevista": algún aspecto < 50 % o rojos ≥ 15 % de las calificaciones del período.

## Roles
- **Coordinación** (permiso de edición del artifact): edita la configuración (estudiantes, componentes, pesos, cupos).
- **Docentes** (permiso de colaborador): registran sus clases; ven semáforo, ranking y fichas.

## Datos
- `config/curso`: configuración.
- `clases/{fecha}_{componente}`: un documento por clase con la evaluación de cada estudiante.
- `hitos/{fecha}_{componente}_{id}`: un documento por hito con la evaluación de cada estudiante.

## Permisos (importante)
La app está en una cuenta personal de claude.ai. Para que un docente pueda **guardar**, el dueño tiene que invitarlo **por correo con permiso de Editor** y el enlace público tiene que estar **apagado**. Con el enlace público encendido, todos los invitados quedan como lectores. La app lo muestra arriba: «Puede guardar» (verde) o «Solo lectura» (rojo).

## Manual
- `Guia-docentes-Semaforo-Jovenes26.pdf`: guía paso a paso con capturas.
- `manual/`: fuente HTML y capturas (datos de ejemplo) para regenerarla.

## Versión con Supabase (recomendada)
- App: `docs/` (GitHub Pages). Conexión: `docs/config.js`.
- Base de datos: `jovenes26-citef/supabase/esquema.sql` (tablas, reglas RLS, funciones `evaluar_clase` / `evaluar_hito`).
- Pasos: `jovenes26-citef/PUESTA-EN-MARCHA.md`.
- Los datos reales del curso (`semilla-privada.sql`) **no** se suben al repositorio.
- `supabase/pruebas/`: pruebas de RLS y de punta a punta contra un PostgreSQL local. `generar-version-supabase.py` arma `docs/index.html` a partir de `index.html`.
