-- ========================================================
-- FABO KDS SERVICE: V1__initial_schema.sql
-- Kitchen Stations, Tickets & Items
-- ========================================================

CREATE TABLE kds_stations (
    id VARCHAR(36) PRIMARY KEY,
    branch_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL -- HOT_KITCHEN, COLD_KITCHEN, BAR, DESSERT
);

CREATE TABLE kds_tickets (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    branch_id VARCHAR(36) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, COOKING, COMPLETED, CANCELLED
    order_time TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_time TIMESTAMP WITH TIME ZONE
);

CREATE TABLE kds_ticket_items (
    id VARCHAR(36) PRIMARY KEY,
    ticket_id VARCHAR(50) NOT NULL REFERENCES kds_tickets(id) ON DELETE CASCADE,
    menu_item_id VARCHAR(36) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    station_id VARCHAR(36) REFERENCES kds_stations(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    modifiers_text TEXT,
    note TEXT
);

CREATE INDEX idx_kds_tickets_branch ON kds_tickets(branch_id);
CREATE INDEX idx_kds_tickets_status ON kds_tickets(status);
