-- ========================================================
-- FABO INVENTORY SERVICE: V1__initial_schema.sql
-- Ingredients, Recipe BOM, Goods Receipts & Discrepancies
-- ========================================================

CREATE TABLE ingredients (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL, -- g, ml, quả, miếng
    current_stock NUMERIC(15, 3) NOT NULL DEFAULT 0,
    minimum_stock NUMERIC(15, 3) NOT NULL DEFAULT 0,
    moving_average_cost NUMERIC(15, 2) DEFAULT 0,
    branch_id VARCHAR(36) NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recipes (
    id VARCHAR(36) PRIMARY KEY,
    menu_item_id VARCHAR(36) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    yield_servings INT DEFAULT 1,
    description TEXT
);

CREATE TABLE recipe_items (
    id VARCHAR(36) PRIMARY KEY,
    recipe_id VARCHAR(36) NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id VARCHAR(36) NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity NUMERIC(15, 3) NOT NULL,
    unit VARCHAR(50) NOT NULL
);

CREATE TABLE goods_receipt_notes (
    id VARCHAR(50) PRIMARY KEY,
    branch_id VARCHAR(36) NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    invoice_no VARCHAR(100),
    total_cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'COMPLETED', -- DRAFT, COMPLETED, CANCELLED
    received_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE goods_receipt_items (
    id VARCHAR(36) PRIMARY KEY,
    grn_id VARCHAR(50) NOT NULL REFERENCES goods_receipt_notes(id) ON DELETE CASCADE,
    ingredient_id VARCHAR(36) NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity NUMERIC(15, 3) NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL,
    line_total NUMERIC(15, 2) NOT NULL
);

CREATE TABLE inventory_discrepancy_logs (
    id VARCHAR(36) PRIMARY KEY,
    branch_id VARCHAR(36) NOT NULL,
    ingredient_id VARCHAR(36) NOT NULL,
    requested_qty NUMERIC(15, 3) NOT NULL,
    current_stock NUMERIC(15, 3) NOT NULL,
    order_id VARCHAR(50),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ingredients_branch ON ingredients(branch_id);
CREATE INDEX idx_recipes_menu_item ON recipes(menu_item_id);
CREATE INDEX idx_grn_branch ON goods_receipt_notes(branch_id);
