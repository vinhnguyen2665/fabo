-- ========================================================
-- FABO POS SERVICE: V2__seed_pos_master_data.sql
-- Add floor plan coordinates & seed real master data
-- ========================================================

-- 1. Alter dining_tables to support 2D floor plan map
ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS pos_x INT DEFAULT 50;
ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS pos_y INT DEFAULT 50;
ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS width INT DEFAULT 110;
ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS height INT DEFAULT 110;
ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS shape VARCHAR(20) DEFAULT 'RECTANGLE';
ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS rotation INT DEFAULT 0;

-- 2. Link table for menu_item <-> modifier_group
CREATE TABLE IF NOT EXISTS menu_item_modifier_groups (
    menu_item_id VARCHAR(36) NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    modifier_group_id VARCHAR(36) NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, modifier_group_id)
);

-- 3. Seed Dining Areas
INSERT INTO dining_areas (id, branch_id, name, display_order) VALUES
('A1', 'B01', 'Tầng 1 (Máy Lạnh)', 1),
('A2', 'B01', 'Sân Vườn Ngoài Trời', 2),
('A3', 'B01', 'Phòng VIP', 3)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Dining Tables with coordinates (Floor plan ready)
INSERT INTO dining_tables (id, table_name, area_id, area_name, branch_id, status, capacity, pos_x, pos_y, width, height, shape, rotation) VALUES
('T01', 'Bàn 01', 'A1', 'Tầng 1 (Máy Lạnh)', 'B01', 'EMPTY', 4, 60, 60, 110, 110, 'SQUARE', 0),
('T02', 'Bàn 02', 'A1', 'Tầng 1 (Máy Lạnh)', 'B01', 'OCCUPIED', 4, 220, 60, 110, 110, 'SQUARE', 0),
('T03', 'Bàn 03', 'A1', 'Tầng 1 (Máy Lạnh)', 'B01', 'EMPTY', 2, 380, 60, 90, 90, 'ROUND', 0),
('T04', 'Bàn 04', 'A1', 'Tầng 1 (Máy Lạnh)', 'B01', 'RESERVED', 6, 60, 220, 160, 110, 'RECTANGLE', 0),
('T05', 'Bàn Sân Vườn 1', 'A2', 'Sân Vườn Ngoài Trời', 'B01', 'EMPTY', 4, 80, 80, 110, 110, 'ROUND', 0),
('T06', 'Bàn Sân Vườn 2', 'A2', 'Sân Vườn Ngoài Trời', 'B01', 'CLEANING', 8, 250, 80, 180, 120, 'RECTANGLE', 0),
('T07', 'VIP 01', 'A3', 'Phòng VIP', 'B01', 'EMPTY', 12, 120, 100, 240, 140, 'RECTANGLE', 0)
ON CONFLICT (id) DO UPDATE SET
  table_name = EXCLUDED.table_name,
  area_id = EXCLUDED.area_id,
  area_name = EXCLUDED.area_name,
  pos_x = EXCLUDED.pos_x,
  pos_y = EXCLUDED.pos_y,
  width = EXCLUDED.width,
  height = EXCLUDED.height,
  shape = EXCLUDED.shape;

-- 5. Seed Menu Categories
INSERT INTO menu_categories (id, branch_id, name, display_order, is_active) VALUES
('CAT_NUOC', 'B01', 'Món Nước', 1, TRUE),
('CAT_KHO', 'B01', 'Món Khô', 2, TRUE),
('CAT_COM', 'B01', 'Cơm & Mì', 3, TRUE),
('CAT_UONG', 'B01', 'Đồ Uống', 4, TRUE),
('CAT_TRANGMIENG', 'B01', 'Tráng Miệng & Ăn Kèm', 5, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Menu Items
INSERT INTO menu_items (id, branch_id, category_id, name, price, tax_rate, is_available) VALUES
('M01', 'B01', 'CAT_NUOC', 'Phở Bò Tái Nạm Đặc Biệt', 65000, 0.08, TRUE),
('M02', 'B01', 'CAT_KHO', 'Bún Chả Hà Nội Cổ Truyền', 60000, 0.08, TRUE),
('M03', 'B01', 'CAT_COM', 'Cơm Rang Dưa Bò', 55000, 0.08, TRUE),
('M04', 'B01', 'CAT_UONG', 'Cà Phê Muối Xứ Huế', 35000, 0.10, TRUE),
('M05', 'B01', 'CAT_UONG', 'Trà Đào Cam Sả', 42000, 0.10, TRUE),
('M06', 'B01', 'CAT_UONG', 'Bia Craft IPA Thủ Công', 75000, 0.10, TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  tax_rate = EXCLUDED.tax_rate;

-- 7. Seed Modifier Groups
INSERT INTO modifier_groups (id, name, min_select, max_select) VALUES
('MOD_PHO', 'Đồ Thêm Cho Phở', 0, 3),
('MOD_BUN', 'Đồ Ăn Kèm Bún Chả', 0, 3),
('MOD_COM', 'Topping Cơm Rang', 0, 3),
('MOD_SUGAR', 'Mức Ngọt / Đường', 1, 1),
('MOD_ICE', 'Mức Đá', 1, 1),
('MOD_DRINK_TOPPING', 'Topping Thêm', 0, 3),
('MOD_BEER', 'Phục Vụ Bia', 1, 1)
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Modifiers (Options)
INSERT INTO modifiers (id, modifier_group_id, name, extra_price) VALUES
('OPT_PHO_EGG', 'MOD_PHO', '1 Quả Trứng Chần', 10000),
('OPT_PHO_QUAY', 'MOD_PHO', 'Đĩa Quẩy Giòn (3 cái)', 8000),
('OPT_PHO_BEEF', 'MOD_PHO', 'Thịt Bò Tái Thêm', 25000),

('OPT_BUN_NEM', 'MOD_BUN', 'Nem Cua Bể (1 chiếc)', 15000),
('OPT_BUN_CHA', 'MOD_BUN', 'Thêm Chả Miếng Nướng', 20000),
('OPT_BUN_EXTRA', 'MOD_BUN', 'Đĩa Bún Thêm', 5000),

('OPT_COM_EGG', 'MOD_COM', 'Trứng Ốp La Lòng Đào', 8000),
('OPT_COM_LAPXUONG', 'MOD_COM', 'Lạp Xưởng Tươi', 12000),
('OPT_COM_SOUP', 'MOD_COM', 'Bát Canh Bò Thêm', 5000),

('OPT_SUGAR_100', 'MOD_SUGAR', '100% Đường (Chuẩn)', 0),
('OPT_SUGAR_70', 'MOD_SUGAR', '70% Đường', 0),
('OPT_SUGAR_50', 'MOD_SUGAR', '50% Đường', 0),
('OPT_SUGAR_0', 'MOD_SUGAR', 'Không Đường', 0),

('OPT_ICE_NORMAL', 'MOD_ICE', 'Đá Bình Thường', 0),
('OPT_ICE_LESS', 'MOD_ICE', 'Ít Đá', 0),
('OPT_ICE_NONE', 'MOD_ICE', 'Không Đá', 0),
('OPT_ICE_SEPARATE', 'MOD_ICE', 'Đá Riêng', 0),

('OPT_TOP_TRANCHAU', 'MOD_DRINK_TOPPING', 'Trân Châu Trắng', 8000),
('OPT_TOP_MACCHIATO', 'MOD_DRINK_TOPPING', 'Kem Muối Macchiato', 10000),
('OPT_TOP_THACHDAO', 'MOD_DRINK_TOPPING', 'Thạch Đào Giòn', 8000),

('OPT_BEER_COLD_GLASS', 'MOD_BEER', 'Ly Ướp Lạnh', 0),
('OPT_BEER_WITH_ICE', 'MOD_BEER', 'Dùng Kèm Đá', 0),
('OPT_BEER_NO_ICE', 'MOD_BEER', 'Uống Nguyên Bản (Không Đá)', 0)
ON CONFLICT (id) DO NOTHING;

-- 9. Map Menu Items <-> Modifier Groups
INSERT INTO menu_item_modifier_groups (menu_item_id, modifier_group_id) VALUES
('M01', 'MOD_PHO'),
('M02', 'MOD_BUN'),
('M03', 'MOD_COM'),
('M04', 'MOD_SUGAR'),
('M04', 'MOD_ICE'),
('M04', 'MOD_DRINK_TOPPING'),
('M05', 'MOD_SUGAR'),
('M05', 'MOD_ICE'),
('M05', 'MOD_DRINK_TOPPING'),
('M06', 'MOD_BEER')
ON CONFLICT DO NOTHING;
