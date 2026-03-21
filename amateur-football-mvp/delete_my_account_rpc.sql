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

    -- 2. Limpiar tablas asociadas manualmente (para evitar errores de llaves foráneas 'foreign keys')
    DELETE FROM public.team_members WHERE user_id = v_user_id;
    DELETE FROM public.team_invitations WHERE user_id = v_user_id;
    DELETE FROM public.user_badges WHERE user_id = v_user_id;
    DELETE FROM public.match_participants WHERE user_id = v_user_id;
    DELETE FROM public.match_messages WHERE user_id = v_user_id;
    DELETE FROM public.team_messages WHERE user_id = v_user_id;
    
    DELETE FROM public.friendships WHERE user_id = v_user_id OR friend_id = v_user_id;
    DELETE FROM public.friend_requests WHERE sender_id = v_user_id OR receiver_id = v_user_id;
    
    DELETE FROM public.match_invitations WHERE sender_id = v_user_id OR receiver_id = v_user_id;
    DELETE FROM public.match_reports WHERE reporter_id = v_user_id;
    DELETE FROM public.player_ratings WHERE from_user_id = v_user_id OR to_user_id = v_user_id;
    DELETE FROM public.mvp_votes WHERE voter_id = v_user_id OR voted_player_id = v_user_id;

    -- 3. Eliminar entidades padre que le pertenezcan
    DELETE FROM public.matches WHERE creator_id = v_user_id;
    DELETE FROM public.teams WHERE captain_id = v_user_id;

    -- 4. Borrar su perfil público
    DELETE FROM public.profiles WHERE id = v_user_id;

    -- 5. Finalmente, ELIMINAR EL USUARIO DEL SISTEMA DE AUTENTICACIÓN (Supabase Auth)
    -- Al ser SECURITY DEFINER y ejecutado por el rol de admin de base de datos que la crea (postgres), tiene permisos para esto.
    DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;
