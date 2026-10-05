-- ========================================================
-- FABO POS SERVICE: V1__initial_schema.sql
-- Tables, Menus, Modifiers, PriceBooks, Invoices & Orders
-- ========================================================

CREATE TABLE dining_areas (
    id VARCHAR(36) PRIMARY KEY,
    branch_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0
);

CREATE TABLE dining_tables (
    id VARCHAR(36) PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    area_id VARCHAR(36) NOT NULL,
    area_name VARCHAR(100) NOT NULL,
    branch_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'EMPTY', -- EMPTY, OCCUPIED, RESERVED, CLEANING
    capacity INT DEFAULT 4,
    active_order_id VARCHAR(50),
    last_status_change TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE menu_categories (
    id VARCHAR(36) PRIMARY KEY,
    branch_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE menu_items (
    id VARCHAR(36) PRIMARY KEY,
    branch_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36) REFERENCES menu_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    tax_rate NUMERIC(5, 4) DEFAULT 0.08, -- 0.00, 0.05, 0.08, 0.10
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modifier_groups (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    min_select INT DEFAULT 0,
    max_select INT DEFAULT 1
);

CREATE TABLE modifiers (
    id VARCHAR(36) PRIMARY KEY,
    modifier_group_id VARCHAR(36) NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    extra_price NUMERIC(15, 2) DEFAULT 0
);

CREATE TABLE price_books (
    id VARCHAR(36) PRIMARY KEY,
    branch_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    start_time TIME,
    end_time TIME,
    multiplier NUMERIC(5, 2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE invoices (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    branch_id VARCHAR(36) NOT NULL,
    table_id VARCHAR(36),
    table_name VARCHAR(50),
    cashier_id VARCHAR(36),
    cashier_name VARCHAR(255),
    raw_subtotal NUMERIC(15, 2) NOT NULL,
    total_discount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    service_charge_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_tax NUMERIC(15, 2) NOT NULL DEFAULT 0,
    final_amount NUMERIC(15, 2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL, -- PENDING, PAID, CANCELLED, REFUNDED
    payment_method VARCHAR(50),
    e_invoice_requested BOOLEAN DEFAULT FALSE,
    buyer_tax_code VARCHAR(50),
    buyer_company_name VARCHAR(255),
    buyer_email VARCHAR(255),
    buyer_address TEXT,
    e_invoice_lookup_code VARCHAR(100),
    e_invoice_status VARCHAR(20),
    created_at TIMESTAMP WITHOUT TIME ZONE,
    paid_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    menu_item_id VARCHAR(36) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL,
    tax_rate NUMERIC(5, 4) NOT NULL,
    item_discount NUMERIC(15, 2) DEFAULT 0,
    line_total NUMERIC(15, 2) NOT NULL,
    modifiers_json TEXT,
    note TEXT,
    kitchen_status VARCHAR(20) DEFAULT 'PENDING'
);

CREATE INDEX idx_tables_branch ON dining_tables(branch_id);
CREATE INDEX idx_menu_items_branch ON menu_items(branch_id);
CREATE INDEX idx_invoices_order ON invoices(order_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
