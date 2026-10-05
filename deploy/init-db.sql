-- PostgreSQL Multi-Database Initialization Script for Fabo POS Cloud
CREATE DATABASE fabo_hrm_db;
CREATE DATABASE fabo_pos_db;
CREATE DATABASE fabo_kds_db;
CREATE DATABASE fabo_payment_db;
CREATE DATABASE fabo_inventory_db;
CREATE DATABASE fabo_finance_db;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fabo_hrm_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE fabo_pos_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE fabo_kds_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE fabo_payment_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE fabo_inventory_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE fabo_finance_db TO postgres;
