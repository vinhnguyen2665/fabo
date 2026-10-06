-- ========================================================
-- FABO KDS SERVICE: V2__seed_kds_master_data.sql
-- Seed kitchen stations & active tickets for cooking
-- ========================================================

-- 1. Seed Stations
INSERT INTO kds_stations (id, branch_id, name, type) VALUES
('ST_HOT', 'B01', 'Bếp Nóng & Món Nước', 'HOT_KITCHEN'),
('ST_BAR', 'B01', 'Quầy Pha Chế & Bar', 'BAR')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Initial Ticket for Occupied Table 02
INSERT INTO kds_tickets (id, order_id, branch_id, table_name, status, order_time) VALUES
('TCK-1024', 'ORD-1024', 'B01', 'Bàn 02', 'COOKING', CURRENT_TIMESTAMP - INTERVAL '5 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO kds_ticket_items (id, ticket_id, menu_item_id, item_name, quantity, station_id, status, modifiers_text, note) VALUES
('tck-it-1', 'TCK-1024', 'M01', 'Phở Bò Tái Nạm Đặc Biệt', 2, 'ST_HOT', 'COOKING', '1 Quả Trứng Chần (+10.000₫)', 'Ít bánh phở, nước trong'),
('tck-it-2', 'TCK-1024', 'M04', 'Cà Phê Muối Xứ Huế', 2, 'ST_BAR', 'PENDING', '70% Đường, Bình thường đá', 'Pha đậm vị cà phê')
ON CONFLICT (id) DO NOTHING;
