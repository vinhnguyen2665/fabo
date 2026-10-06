-- ========================================================
-- FABO INVENTORY SERVICE: V2__seed_inventory_master_data.sql
-- Seed ingredients & Recipe BOM for Menu Items
-- ========================================================

-- 1. Seed Ingredients
INSERT INTO ingredients (id, name, unit, current_stock, minimum_stock, moving_average_cost, branch_id) VALUES
('ING_BEEF', 'Thịt Bò Tái Hoa', 'kg', 25.5, 5.0, 260000, 'B01'),
('ING_PHO_NOODLE', 'Bánh Phở Tươi', 'kg', 40.0, 10.0, 25000, 'B01'),
('ING_EGG', 'Trứng Gà Ta', 'quả', 120, 20, 3500, 'B01'),
('ING_COFFEE_BEANS', 'Cà Phê Hạt Robusta Rang Mộc', 'kg', 18.0, 3.0, 180000, 'B01'),
('ING_CONDENSED_MILK', 'Sữa Đặc Ngôi Sao Phương Nam', 'lon', 45, 10, 22000, 'B01'),
('ING_SALT_CREAM', 'Kem Béo Muối Hồng', 'hộp', 15, 3, 65000, 'B01'),
('ING_TEA_PEACH', 'Trà Đào Cozy', 'hộp', 30, 5, 32000, 'B01'),
('ING_RICE', 'Gạo Tám Thơm', 'kg', 50.0, 15.0, 22000, 'B01'),
('ING_PICKLE', 'Dưa Chua Muối Truyền Thống', 'kg', 12.0, 2.0, 30000, 'B01')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Recipes
INSERT INTO recipes (id, menu_item_id, name, yield_servings, description) VALUES
('REC_M01', 'M01', 'Định lượng: Phở Bò Tái Nạm Đặc Biệt', 1, 'Bánh phở tươi 150g, Bò tái 100g, 1 quả trứng nếu gọi thêm'),
('REC_M03', 'M03', 'Định lượng: Cơm Rang Dưa Bò', 1, 'Cơm đảo 200g, Bò thái lát 80g, Dưa chua 50g'),
('REC_M04', 'M04', 'Định lượng: Cà Phê Muối Xứ Huế', 1, 'Cà phê phin 25g, Sữa đặc 30ml, Kem muối 20ml')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Recipe Items (BOM)
INSERT INTO recipe_items (id, recipe_id, ingredient_id, quantity, unit) VALUES
('BOM_01_1', 'REC_M01', 'ING_PHO_NOODLE', 0.150, 'kg'),
('BOM_01_2', 'REC_M01', 'ING_BEEF', 0.100, 'kg'),
('BOM_03_1', 'REC_M03', 'ING_RICE', 0.200, 'kg'),
('BOM_03_2', 'REC_M03', 'ING_BEEF', 0.080, 'kg'),
('BOM_03_3', 'REC_M03', 'ING_PICKLE', 0.050, 'kg'),
('BOM_04_1', 'REC_M04', 'ING_COFFEE_BEANS', 0.025, 'kg'),
('BOM_04_2', 'REC_M04', 'ING_CONDENSED_MILK', 0.080, 'lon')
ON CONFLICT (id) DO NOTHING;
