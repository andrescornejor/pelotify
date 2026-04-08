-- ==========================================================
-- SCRIPT DE SEGURIDAD PARA SUPABASE (FIX RLS)
-- ==========================================================
-- Este script habilita RLS en TODAS las tablas de la base de datos
-- y asegura que no haya acceso público no autorizado.

-- 1. Habilitar RLS en tablas críticas si no lo están
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) LOOP 
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
    END LOOP; 
END $$;

-- 2. Asegurar Políticas Maestras para Tablas Principales
-- Esto garantiza que aunque se habilite RLS, la app siga funcionando.

-- PROFILES: Lectura pública, escritura propia
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
    CREATE POLICY "Users can manage their own profile" ON public.profiles 
        FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
END $$;

-- MATCHES: Lectura pública, creación por autenticados
DO $$ BEGIN
    DROP POLICY IF EXISTS "Anyone can view matches" ON public.matches;
    CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Authenticated users can create matches" ON public.matches;
    CREATE POLICY "Authenticated users can create matches" ON public.matches 
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
END $$;

-- TEAMS: Lectura pública, creación por capitanes
DO $$ BEGIN
    DROP POLICY IF EXISTS "Anyone can view teams" ON public.teams;
    CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
    CREATE POLICY "Authenticated users can create teams" ON public.teams 
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = captain_id);
END $$;

-- VENUES (Canchas): Lectura pública
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'canchas_businesses') THEN
        DROP POLICY IF EXISTS "Users can view active businesses" ON public.canchas_businesses;
        CREATE POLICY "Users can view active businesses" ON public.canchas_businesses FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- 3. Limpiar permisos excesivos (opcional pero recomendado)
-- Asegura que el rol 'anon' no tenga más permisos de los necesarios
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Nota: RLS filtrará lo que 'anon' puede ver realmente.
