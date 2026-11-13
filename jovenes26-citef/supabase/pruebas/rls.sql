\set ON_ERROR_STOP 0
create or replace function pg_temp.como(rol text, correo text) returns void language plpgsql as $$
begin perform set_config('request.jwt.claims', case when correo is null then '' else json_build_object('email',correo)::text end, false);
  execute format('set role %I', rol); end $$;

\echo '== 1. Docente autorizado: dos docentes marcan a la vez la misma clase'
select pg_temp.como('authenticated','profe@ej.uy');
select mi_perfil();
select evaluar_clase('2026-11-16_lect','2026-11-16','lect','{"e01":{"as":"v","ac":"a"}}');
reset role; select pg_temp.como('authenticated','profe2@ej.uy');
select evaluar_clase('2026-11-16_lect','2026-11-16','lect','{"e01":{"co":"r"},"e02":{"as":"r"}}');
select 'ev resultante: '||ev::text from clases where id='2026-11-16_lect';
\echo '-- desmarcar (valor vacío) no borra lo demás:'
select evaluar_clase('2026-11-16_lect','2026-11-16','lect','{"e01":{"ac":""}}');
select 'ev: '||(ev->'e01')::text from clases where id='2026-11-16_lect';
\echo '-- docente intenta cambiar la configuración (debe fallar o no afectar filas):'
update config set data='{"x":1}' where id=1 returning 'ACTUALIZÓ (MAL)';
select 'config sigue vacía: '||(data='{}'::jsonb) from config;
\echo '-- docente intenta borrar una clase (solo coordinación):'
delete from clases where id='2026-11-16_lect' returning 'BORRÓ (MAL)';
\echo '-- docente crea y califica un hito:'
insert into hitos(id,comp,nombre,fecha) values ('h1','lect','CV','2026-11-20');
select evaluar_hito('h1','{"e01":{"l":"v"}}');
select 'hito: '||ev::text from hitos where id='h1';
\echo '-- docente intenta agregarse como coordinación:'
update docentes set rol='coordinacion' where email='profe@ej.uy' returning 'SE ASCENDIÓ (MAL)';
reset role;

\echo '== 2. Coordinación'
select pg_temp.como('authenticated','coord@ej.uy');
update config set data='{"nombre":"J26"}' where id=1 returning 'config guardada OK';
insert into docentes(email,nombre) values ('nuevo@ej.uy','Profe nuevo') returning 'docente agregado OK';
reset role;

\echo '== 3. Cuenta con sesión pero NO autorizada'
select pg_temp.como('authenticated','intruso@gmail.com');
select mi_perfil();
select 'clases visibles: '||count(*) from clases;
select 'docentes visibles: '||count(*) from docentes;
select evaluar_clase('2026-11-16_lect','2026-11-16','lect','{"e01":{"as":"r"}}');
insert into clases(id,fecha,comp) values ('x','2026-11-16','lect');
reset role;

\echo '== 4. Docente dado de baja'
select pg_temp.como('authenticated','baja@ej.uy');
select 'clases visibles: '||count(*) from clases;
select evaluar_hito('h1','{"e02":{"l":"r"}}');
reset role;

\echo '== 5. Visitante sin sesión (anon)'
select pg_temp.como('anon',null);
select 'clases visibles: '||count(*) from clases;
select evaluar_clase('a','2026-11-16','lect','{}');
reset role;
\echo '== Estado final'
select 'e01 final: '||(ev->'e01')::text from clases where id='2026-11-16_lect';
