-- Create database if not exists
CREATE DATABASE fresh_shop_db;

-- Create user if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'fresh_shop_user') THEN
        CREATE ROLE fresh_shop_user WITH LOGIN PASSWORD 'fresh_shop_password';
    END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fresh_shop_db TO fresh_shop_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO fresh_shop_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fresh_shop_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fresh_shop_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO fresh_shop_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO fresh_shop_user;
