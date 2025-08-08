-- This is an empty migration.
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

SELECT public.create_hypertable('api.token_prices', 'createdAt');
