-- ========================================================
-- FABO FINANCE & CRM SERVICE: V1__initial_schema.sql
-- Cash Drawer Shifts, P&L Expenses, Loyalty CRM & Vouchers
-- ========================================================

CREATE TABLE cash_drawer_shifts (
    id VARCHAR(50) PRIMARY KEY,
    branch_id VARCHAR(36) NOT NULL,
    cashier_id VARCHAR(36) NOT NULL,
    cashier_name VARCHAR(255) NOT NULL,
    opened_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    closed_at TIMESTAMP WITHOUT TIME ZONE,
    initial_cash NUMERIC(15, 2) NOT NULL DEFAULT 0,
    counted_cash NUMERIC(15, 2),
    calculated_cash NUMERIC(15, 2) DEFAULT 0,
    vietqr_revenue NUMERIC(15, 2) DEFAULT 0,
    card_revenue NUMERIC(15, 2) DEFAULT 0,
    variance NUMERIC(15, 2) DEFAULT 0,
    note TEXT,
    status VARCHAR(20) DEFAULT 'OPEN' -- OPEN, CLOSED
);

CREATE TABLE expense_entries (
    id VARCHAR(36) PRIMARY KEY,
    branch_id VARCHAR(36) NOT NULL,
    category VARCHAR(50) NOT NULL, -- UTILITIES, RENT, LABOR, INGREDIENTS, OTHER
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    paid_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    recorded_by VARCHAR(255)
);

CREATE TABLE loyalty_tiers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- SILVER, GOLD, DIAMOND
    min_spend NUMERIC(15, 2) NOT NULL,
    discount_percent NUMERIC(5, 2) DEFAULT 0,
    point_rate NUMERIC(5, 4) DEFAULT 0.05
);

CREATE TABLE customers (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    current_tier_id VARCHAR(36) REFERENCES loyalty_tiers(id) ON DELETE SET NULL,
    total_points INT DEFAULT 0,
    total_spend NUMERIC(15, 2) DEFAULT 0,
    birthday DATE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_point_transactions (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_id VARCHAR(50),
    points INT NOT NULL,
    type VARCHAR(20) NOT NULL, -- EARN, REDEEM, EXPIRE, BONUS
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vouchers (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- PERCENT, FIXED_AMOUNT
    discount_value NUMERIC(15, 2) NOT NULL,
    min_order_amount NUMERIC(15, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from TIMESTAMP WITHOUT TIME ZONE,
    valid_to TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX idx_shifts_branch ON cash_drawer_shifts(branch_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_vouchers_code ON vouchers(code);
