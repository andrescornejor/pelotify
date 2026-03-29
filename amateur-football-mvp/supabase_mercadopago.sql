-- Agrega campos de Mercado Pago Connect a la tabla de perfiles
ALTER TABLE profiles 
ADD COLUMN mp_access_token TEXT,
ADD COLUMN mp_refresh_token TEXT,
ADD COLUMN mp_user_id TEXT,
ADD COLUMN mp_public_key TEXT;
