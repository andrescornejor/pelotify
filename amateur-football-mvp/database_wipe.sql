-- PELIGRO: Este script borra TODO el contenido de la base de datos de usuario.
-- Ejecutar en el SQL Editor de Supabase.

-- Deshabilitar triggers temporalmente para mayor velocidad si es necesario
-- SET session_replication_role = 'replica';

-- Borrar participantes y amigos primero (llaves foráneas)
TRUNCATE TABLE public.match_participants CASCADE;
TRUNCATE TABLE public.match_invitations CASCADE;
TRUNCATE TABLE public.friendships CASCADE;
TRUNCATE TABLE public.team_members CASCADE;

-- Borrar entidades principales
TRUNCATE TABLE public.matches CASCADE;
TRUNCATE TABLE public.teams CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- OPCIONAL: Borrar todos los usuarios de Auth (REQUIERE PERMISOS DE ADMIN)
-- Nota: Esto borrará los correos y contraseñas registrados.
-- DELETE FROM auth.users;

-- Re-habilitar triggers
-- SET session_replication_role = 'origin';

-- Reiniciar secuencias si existen
-- ALTER SEQUENCE profiles_id_seq RESTART WITH 1;
