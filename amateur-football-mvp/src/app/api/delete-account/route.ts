import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');

        // Initialize regular client to verify the token
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json({ error: 'Configuración de Supabase incompleta' }, { status: 500 });
        }

        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
        
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

        if (userError || !user) {
            return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
        }

        // Initialize admin client to delete the user
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) {
            return NextResponse.json({ error: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // --- MANUALLY CASCADE DELETIONS TO AVOID FOREIGN KEY ERRORS ---
        const userId = user.id;

        // Try to delete from common relationship tables gracefully
        const tablesWithUserId = ['team_members', 'team_invitations', 'user_badges', 'match_participants'];
        for (const table of tablesWithUserId) {
            await supabaseAdmin.from(table).delete().eq('user_id', userId);
        }

        // Friendships and Requests
        await supabaseAdmin.from('friendships').delete().or(`user_id.eq.${userId},friend_id.eq.${userId}`);
        await supabaseAdmin.from('friend_requests').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

        // Matches stuff
        await supabaseAdmin.from('match_invitations').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
        await supabaseAdmin.from('match_reports').delete().eq('reporter_id', userId);
        await supabaseAdmin.from('player_ratings').delete().or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);
        await supabaseAdmin.from('mvp_votes').delete().or(`voter_id.eq.${userId},voted_player_id.eq.${userId}`);

        // Parent Entities (Might trigger further cascades in public schema, but helps clear the way)
        await supabaseAdmin.from('matches').delete().eq('organizer_id', userId);
        await supabaseAdmin.from('teams').delete().eq('captain_id', userId);

        // Finally the profile
        await supabaseAdmin.from('profiles').delete().eq('id', userId);

        // Múltiples retries en caso de latencia de BD
        await new Promise(r => setTimeout(r, 500));

        // Usamos el admin API para eliminar el usuario por completo del sistema
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (deleteError) {
            console.error('Error al borrar usuario de auth.admin:', deleteError);
            throw deleteError;
        }

        return NextResponse.json({ success: true, message: 'Usuario eliminado correctamente' });
    } catch (error: any) {
        console.error('Error en ruta delete-account:', error);
        return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
    }
}
