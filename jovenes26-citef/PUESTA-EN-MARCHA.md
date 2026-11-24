# Puesta en marcha con Supabase

La app nueva está en `docs/` (se publica con GitHub Pages) y guarda todo en Supabase.
Los docentes entran con **correo y contraseña**: no necesitan cuenta de claude.ai.

Se hace **una sola vez**, en unos 20 minutos.

## 1. Crear el proyecto en Supabase
1. Entre a **supabase.com** → *Start your project* y cree una cuenta (puede entrar con GitHub).
2. *New project*: nombre `jovenes26-citef`, una contraseña para la base (guárdela) y la región **South America (São Paulo)**, que es la más cercana. Plan **Free**.
3. Espere uno o dos minutos a que el proyecto esté listo.

## 2. Crear las tablas y las reglas de seguridad
1. Menú izquierdo → **SQL Editor** → *New query*.
2. Pegue **todo** el contenido de `jovenes26-citef/supabase/esquema.sql` y toque **Run**. Tiene que decir *Success*.
3. *New query* otra vez. Pegue el contenido de **`semilla-privada.sql`** (se lo envié aparte, **no está en GitHub** porque tiene los nombres de los estudiantes) y toque **Run**.
   Esto carga los 25 estudiantes, los componentes, el calendario y lo deja a usted como coordinación.

## 3. Cerrar el registro libre
**Authentication** → **Sign In / Providers** (o *Providers*) → **Email**:
- deje *Email* habilitado;
- **desactive** *Allow new users to sign up*. Así solo la coordinación crea cuentas.

## 4. Crear las cuentas
**Authentication** → **Users** → **Add user** → **Create new user**:
- primero la suya (`marcelosanchezempresa@gmail.com`), después la de Natalia y la de cada docente;
- contraseña de 8 caracteres o más, con **Auto Confirm User** marcado.

Cada correo, además, tiene que estar **autorizado**. El suyo ya lo está, por la semilla. Los demás se autorizan desde la app: **Configuración → Docentes autorizados**.

## 5. Conectar la app con el proyecto
**Project Settings** → **API** (o *API Keys*). Copie:
- **Project URL** (`https://xxxx.supabase.co`);
- la clave **anon** / **publishable**. Esta clave es pública: puede enviármela por el chat sin problema.

> ⚠️ **Nunca** comparta la clave **service_role** / **secret**.

Con esos dos datos completo `docs/config.js`. También puede hacerlo usted mismo desde GitHub, editando ese archivo.

## 6. Publicar la app (GitHub Pages)
En GitHub: repositorio `desafio-ted` → **Settings** → **Pages**:
- *Source*: **Deploy from a branch**;
- *Branch*: `claude/citef-student-evaluation-app-4gumgx`, carpeta **/docs** → **Save**.

En uno o dos minutos la app queda en:
**https://marcelosanchezempresa-eng.github.io/desafio-ted/**

## 7. Probar
Abra la dirección, entre con su correo y contraseña. Arriba tiene que decir **«Puede guardar»**.

## Para tener en cuenta
- **La app anterior en claude.ai** queda como estaba. Para no mezclar datos, usen solo la nueva.

## Receso: pausa de Supabase (plan gratuito)
**Qué pasa.** Si nadie usa la app durante unos **7 días**, Supabase pausa el proyecto. Cuenta como uso entrar a la app o al panel de Supabase. En el receso (24/12 al 31/01) se va a pausar, probablemente a fines de diciembre.

**Los datos no se pierden.** Al pausar, la base queda guardada tal cual y Supabase hace además una copia de respaldo. Se conserva todo: clases, semáforo, asistencia, hitos, juicios, notas, rúbricas, configuración, docentes y contraseñas.

**Mientras está pausado,** la app muestra un error de conexión y no deja entrar.

**Cómo reactivarlo, al volver en febrero:**
1. Entrá a **supabase.com** con tu cuenta.
2. Abrí el proyecto `jovenes26-citef`, que figura como *Paused*.
3. Tocá **Restore project** y esperá unos minutos, hasta que figure activo.
4. Abrí la app y comprobá que estén los datos.

**Plazo.** Según la documentación de Supabase (consultada el 17/11/2026), un proyecto pausado se puede restaurar desde el panel durante **1 año**; antes el plazo era de 90 días. Pasado ese plazo, igual se puede descargar desde el panel el respaldo que se hizo al pausar. El receso dura unas 6 semanas.

**Para no depender solo de Supabase:**
- **Antes del 23/12**, descargá el **respaldo completo** (ver abajo) y guardalo en dos lugares.
- **Opcional:** si una persona de coordinación entra a la app una vez por semana durante el receso, el proyecto no se pausa.
- Los planes pagos de Supabase no se pausan nunca y hacen respaldos diarios. Conviene si la app se usa a escala institucional.

> Estas son políticas de Supabase y pueden cambiar. Por eso el respaldo propio es la garantía principal.

## Respaldo completo (coordinación)
**Configuración → Respaldo completo → Descargar respaldo completo.**
Se descarga `respaldo-jovenes26-AAAA-MM-DD.sql`, con toda la base: configuración, estudiantes, docentes autorizados, clases, hitos, juicios, notas y rúbricas.
- Hacelo antes de cada receso y al cierre de cada hito.
- Guardalo en un lugar privado (tu computadora y un Drive institucional). Tiene nombres de estudiantes y correos: **no lo subas a GitHub**.
- No incluye contraseñas. Si hubiera que reconstruir la base, cada docente crea la suya de nuevo con «Crear mi contraseña».

**Cómo restaurar desde el respaldo:**
1. **Si el proyecto sigue existiendo** y faltan datos: SQL Editor → New query → pegá todo el archivo → **Run**. Lo que ya está en la base no se pisa; la configuración vuelve a la del respaldo.
2. **Si hay que empezar de cero** con un proyecto nuevo: corré primero, en este orden, `esquema.sql`, `autoregistro.sql`, `componentes-e-instancias.sql` y `hitos-inefop.sql`. Después corré el archivo de respaldo y actualizá `docs/config.js` con la URL y la clave *anon* del proyecto nuevo.
3. Si el archivo es muy grande para pegarlo en el SQL Editor, pedí ayuda para correrlo con `psql`, que no tiene ese límite.

## Configuración: quitar elementos y cambios sin guardar
- El botón **✕** ya no borra de inmediato: pregunta «¿Quitar…?» y hay que confirmar con **Sí, quitar**.
- Nada se guarda en la base hasta tocar **Guardar configuración**. Si algo se quitó por error, tocá **Descartar cambios** y vuelve lo guardado.
- Si se guardó sin querer la configuración sin los módulos, `jovenes26-citef/supabase/restaurar-modulos.sql` los vuelve a cargar (Módulo 1: 13/10/2026 al 23/12/2026; Módulo 2: 01/02/2027 al 15/03/2027).

## Auto-registro de docentes (activado)
Cada docente crea su propia contraseña la primera vez, **solo si su correo está autorizado**.
1. SQL Editor → New query → pegar `jovenes26-citef/supabase/autoregistro.sql` → **Run**.
2. Authentication → Sign In / Providers → *User Signups*: **encender** «Allow new users to sign up» y **apagar** «Confirm email». Guardar.
3. Contraseña olvidada: Configuración → Docentes autorizados → **Reiniciar contraseña**.

## Actualización 3: componentes por docente, instancias de evaluación e informes
1. SQL Editor → New query → pegar `jovenes26-citef/supabase/componentes-e-instancias.sql` → **Run**.
2. En la app: Configuración → Docentes autorizados → **Componentes** junto a cada docente → marcar sus componentes → Guardar.
   Hasta que se asignen, el docente no puede cargar (la coordinación sí, en todos).
3. Configuración → **Instancias de evaluación**: revisar nombres y fechas (vienen 30/11/2026, 23/12/2026 y 12/03/2027).
4. Pestaña **Evaluaciones**: cada docente escribe juicios por estudiante y del grupo. La coordinación descarga los informes en Word o PDF.

## Borrar los datos de prueba
`jovenes26-citef/supabase/borrar-datos-de-prueba.sql`: primero muestra qué se borra (clases e hitos creados antes del 17/11/2026), después borra. No toca estudiantes, componentes, configuración ni docentes.

## Hitos de evaluación INEFOP
`jovenes26-citef/supabase/hitos-inefop.sql` (después de componentes-e-instancias.sql):
- **Hito 1 · 30/11/2026 · Diagnóstico inicial:** nota de 1 a 12 (complemento), resultado de la actividad de diagnóstico y juicio conceptual de cada docente; juicio del grupo.
- **Hito 4 · 30/04/2027 · Evaluación final:** nota de 1 a 12, juicio conceptual, competencias técnicas logradas y rúbrica de competencias transversales (comunicación asertiva, trabajo colaborativo, orientación a objetivos; niveles Inicial / En desarrollo / Logrado / Destacado).
- **Informe de los técnicos** (coordinación), individual y grupal, en cada hito.
- Informes: individual, grupal (con planilla de notas), listas de asistencia diaria (Word, PDF y CSV).
- Participantes desvinculados: Configuración → Estudiantes → «Se desvinculó». No aparecen para calificar ni en el informe final.

## Quién puede cargar en cada componente
- **Cada persona**, docente o coordinación, ve para cargar (Registrar clase, Hitos y Evaluaciones) **solo los componentes que tiene asignados** en Configuración → Docentes autorizados.
- **La base de datos** también lo controla. Aunque alguien intentara saltarse la pantalla, un docente no puede guardar nada en un componente ajeno.
- **Para corregir el error de un docente,** la coordinación marca la casilla **«Corregir otro componente (coordinación)»**. Mientras está marcada, aparece un aviso rojo que dice de quién es el componente. Lo que se cargue queda registrado a nombre de quien corrigió. La casilla se desmarca sola al recargar la página.
- **Consultar no tiene restricción.** Semáforo, Ranking e Informes muestran todos los componentes a todos.

## Horario de clases
**Una sola vez:** SQL Editor → New query → pegar `jovenes26-citef/supabase/horario-noviembre-2026.sql` → **Run**. Carga las semanas del 16/11, 23/11 y 30/11 según la captura de la coordinación. No pisa nada que ya se haya editado.

**Pestaña «Horario» (todos):**
- Muestra tres semanas, cada componente con su color. Las clases propias tienen borde azul y la etiqueta «Tu clase».
- **«Compartir imagen»** arma una imagen lista para WhatsApp. En el celular abre directamente el menú de compartir; en la computadora la descarga.

**Para la coordinación, con «Editar horario» marcado:**
- **Cambiar un bloque:** tocá el bloque y elegí un componente, «Otro (escribir)» o «Sin clase». La nota es opcional.
- **Mostrar como (opcional):** un bloque de un componente puede verse con otro nombre y color. Por ejemplo, «DAT» queda vinculado a Género: sus docentes lo ven como «Tu clase» y reciben los avisos, pero en el horario y en la imagen dice «DAT».
- **Sin calificación:** casilla para actividades ocasionales que no se califican. El bloque muestra la etiqueta «Sin calificación» (también en la imagen) y «Copiar la semana anterior» no lo copia.
- **«Editar semana completa»** (la forma más práctica): abre una planilla con los 10 bloques de la semana.
  - **«Copiar la semana anterior»** completa toda la planilla. Después se cambia lo que haga falta en cada lista. No copia las actividades ocasionales «sin calificación», como el DAT.
  - Los bloques modificados quedan con borde oscuro. **Nada se guarda hasta tocar «Guardar semana»**, que guarda todo de una vez.
  - **«Avisar a los docentes…»** viene desmarcado en una semana nueva y marcado si la semana ya estaba cargada. Avisa solo de los bloques que cambiaron.
- **«Avisar a los docentes como cambio de horario»:** a los docentes afectados les aparece un aviso en la pantalla de inicio y un punto en la pestaña, hasta que tocan «Entendido».
- **Colores:** se cambian en Configuración → Componentes. Si dos bloques seguidos tienen el mismo componente, se muestran unidos (por ejemplo, Informática de 8:15 a 12:00).

**Pantalla de inicio:** cada docente ve «Hoy tenés clase…» o «Tu próxima clase…».

> Los avisos aparecen al abrir la app. No llegan como notificación al teléfono con la app cerrada.

## Fotos de los participantes
**Una sola vez:** SQL Editor → New query → pegar `jovenes26-citef/supabase/fotos-participantes.sql` → **Run**. Crea un espacio privado para las fotos:
- las ven solo los docentes y la coordinación autorizados, con su contraseña;
- solo la coordinación puede subirlas, cambiarlas o quitarlas.

**Subirlas (coordinación):** Configuración → Estudiantes → **«Subir varias fotos»** → elegí todos los archivos juntos.
- Cada archivo se reconoce por el id (`e01 - …`) o por el nombre del participante, sin importar tildes ni mayúsculas.
- La app avisa si algún archivo no coincide con nadie.
- La app recorta cada foto en cuadrado y la achica antes de guardarla.

**Cambiar o quitar una foto:** tocá la foto del participante en la lista. Si alguien no tiene foto, al tocar su círculo de iniciales se sube una.

**Dónde aparecen:** en Registrar clase, Hitos, Evaluaciones, Ranking y la Ficha. Quien no tiene foto aparece con sus iniciales en un círculo de color.

**Dónde no aparecen:** en los informes para INEFOP, los CSV, la imagen del horario ni el respaldo completo. Guardá las fotos originales aparte.

> Las fotos son datos personales (Ley 18.331). Nunca se suben a GitHub: van directo del dispositivo de la coordinación al espacio privado de Supabase.

## Ranking y clases pendientes
- **Puesto en el ranking:** solo lleva número quien tiene el mínimo de registros del período (Configuración → «Mín. registros para rankear»).
- **«Todavía sin datos suficientes»:** los demás aparecen en esta sección aparte, sin puesto, con su índice parcial y cuántos registros tienen (por ejemplo, «2/10 reg.»).
- **Etiqueta «Entrevista»:** marca a quien tiene algún aspecto por debajo del 50 % o al menos el 15 % de sus marcas en «No logrado».
- **«Ranking provisorio»:** mientras haya participantes sin datos suficientes, la coordinación ve este aviso. Incluye cuántas clases del horario de los últimos 14 días faltan registrar, por componente.
- **Aviso a cada docente:** en el inicio aparecen sus clases del horario sin registrar, con un botón que abre esa fecha y ese componente. No se cuentan los bloques «sin calificación» ni los recesos.
