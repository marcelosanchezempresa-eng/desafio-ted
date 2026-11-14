// Datos del proyecto de Supabase (Project Settings → API Keys).
// La clave «anon» es pública por diseño: la seguridad la dan las reglas de la base (esquema.sql).
// NUNCA ponga aquí la clave «service_role» / «secret».
window.J26_SUPABASE = {
  url: "https://uhmsnjxnpztbsgqpejot.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVobXNuanhucHp0YnNncXBlam90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2MDk0NDUsImV4cCI6MjExMDE4NTQ0NX0.Sk-yEKfZHBEYOh6ydgjKxfdYSwMgVsV259Av7gChjZ4",
  // false (recomendado): la coordinación crea cada cuenta en Supabase → Authentication → Users → Add user.
  // true: cada docente crea su propia contraseña desde la app (requiere que Supabase pueda enviar correos).
  autoRegistro: false
};
