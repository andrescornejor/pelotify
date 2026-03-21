-- DELETING ACCOUNTS WITHOUT A NODEJS SERVER (STATIC EXPORT / CAPACITOR FIX)
-- Cuando exportas Next.js a una aplicación móvil estática (output: 'export'), las rutas API
-- como /api/delete-account dejan de funcionar y devuelven HTML.
--
-- Para arreglar esto, creamos una función "RPC" (Procedimiento Remoto) en la base de datos
-- que tiene permisos de administrador (SECURITY DEFINER) para que cualquier jugador
-- autenticado pueda solicitar la eliminación y purga total de su PROPIA cuenta 
-- directamente desde el Frontend hacia la base de datos.

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- 1. Obtener el ID del usuario que está ejecutando la función (el usuario logueado en la app)
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado. Debes iniciar sesión para eliminar tu cuenta.';
    END IF;

    -- 2. Limpiar tablas dinámicamente o chequeando si existen para no quebrar (safe-delete)
    
    -- Tablas con columna user_id
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name='team_members') THEN
        DELETE FROM public.team_members WHERE user_id = v_user_id; END IF;
        
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name='user_badges') THEN
        DELETE FROM public.user_badges WHERE user_id = v_user_id; END IF;
        
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name='match_participants') THEN
        DELETE FROM public.match_participants WHERE user_id = v_user_id; END IF;
        
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name='match_messages') THEN
        DELETE FROM public.match_messages WHERE user_id = v_user_id; END IF;
        
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name='team_messages') THEN
        DELETE FROM public.team_messages WHERE user_id = v_user_id; END IF;

    -- Tablas de Relaciones Dobles o nombres específicos
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name='friendships') THEN
        DELETE FROM public.friendships WHERE user_id = v_user_id OR friend_id = v_user_id; END IF;
        
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name='friend_requests') THEN
        DELETE FROM public.friend_requests WHERE sender_id = v_user_id OR receiver_id = v_user_id; END IF;
        
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name='match_invitations') THEN
        DELETE FROM public.match_invitations WHERE sender_id = v_user_id OR receiver_id = v_user_id; END IF;
        
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name='match_reports') THEN
        DELETE FROM public.match_reports WHERE reporter_id = v_user_id; END IF;
        
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name='player_ratings') THEN
        DELETE FROM public.player_ratings WHERE from_user_id = v_user_id OR to_user_id = v_user_id; END IF;
        
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name='mvp_votes') THEN
        DELETE FROM public.mvp_votes WHERE voter_id = v_user_id OR voted_player_id = v_user_id; END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name='profile_comments') THEN
        DELETE FROM public.profile_comments WHERE author_id = v_user_id OR profile_id = v_user_id; END IF;

    -- 3. Eliminar entidades padre que le pertenezcan
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name='matches') THEN
        DELETE FROM public.matches WHERE creator_id = v_user_id; END IF;
        
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name='teams') THEN
        DELETE FROM public.teams WHERE captain_id = v_user_id; END IF;

    -- 4. Borrar su perfil público
    DELETE FROM public.profiles WHERE id = v_user_id;

    -- 5. Finalmente, ELIMINAR EL USUARIO DEL SISTEMA DE AUTENTICACIÓN (Supabase Auth)
    -- Al ser SECURITY DEFINER y ejecutado por el rol de admin de base de datos que la crea (postgres), tiene permisos para esto.
    DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;
