-- Masada Database Initialization Script
-- This script sets up the initial database configuration for Ethiopian usability testing platform

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone to Ethiopian time
SET timezone = 'Africa/Addis_Ababa';

-- Create custom types for Ethiopian context
DO $$ BEGIN
    CREATE TYPE ethiopian_region AS ENUM (
        'Addis Ababa',
        'Afar',
        'Amhara',
        'Benishangul-Gumuz',
        'Dire Dawa',
        'Gambela',
        'Harari',
        'Oromia',
        'Sidama',
        'SNNPR',
        'Somali',
        'Tigray'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
-- These will be created after Prisma migration

-- Insert initial system configuration
-- This will be handled by the seed script

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Masada database initialized successfully for Ethiopian usability testing platform';
END $$;