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
   Esto carga los 25 estudiantes, los 11 componentes, el calendario y lo deja a usted como coordinación.

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
- **Receso de fin de año:** en el plan gratis, Supabase **pausa** el proyecto después de unos 7 días sin uso. Durante el receso (24/12 al 31/01) se va a pausar. Al volver, en febrero, entre a supabase.com y toque **Restore project**. Los datos no se pierden.
- **Copia de respaldo:** el plan gratis no permite descargar respaldos desde el panel. Descargue el CSV del Ranking y del Semáforo al cierre de cada módulo.
- **La app anterior en claude.ai** queda como estaba. Para no mezclar datos, usen solo la nueva.
