// Datos del proyecto de Supabase (Project Settings → API).
// La clave «anon» / «publishable» es pública por diseño: la seguridad la dan las reglas de la base (esquema.sql).
// NUNCA ponga aquí la clave «service_role» / «secret».
window.J26_SUPABASE = {
  url: "",      // ej.: "https://abcdefghijkl.supabase.co"
  anonKey: "",  // ej.: "eyJhbGciOi..." o "sb_publishable_..."
  // false (recomendado): la coordinación crea cada cuenta en Supabase → Authentication → Users → Add user.
  // true: cada docente crea su propia contraseña desde la app (requiere que Supabase pueda enviar correos).
  autoRegistro: false
};
