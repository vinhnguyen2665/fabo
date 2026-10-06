-- ========================================================
-- FABO FINANCE & CRM SERVICE: V2__seed_finance_master_data.sql
-- Seed loyalty tiers, customers and sample drawer shifts
-- ========================================================

-- 1. Seed Loyalty Tiers
INSERT INTO loyalty_tiers (id, name, min_spend, discount_percent, point_rate) VALUES
('TIER_SILVER', 'Hội Viên Bạc', 0, 0, 0.05),
('TIER_GOLD', 'Hội Viên Vàng', 2000000, 5.0, 0.08),
('TIER_DIAMOND', 'Hội Viên Kim Cương', 10000000, 10.0, 0.10)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Customers
INSERT INTO customers (id, full_name, phone, email, current_tier_id, total_points, total_spend) VALUES
('CUST_01', 'Nguyễn Thu Thảo', '0909123456', 'thao.nguyen@gmail.com', 'TIER_GOLD', 150, 3200000),
('CUST_02', 'Phạm Minh Đức', '0988776655', 'duc.pm@gmail.com', 'TIER_SILVER', 45, 850000)
ON CONFLICT (phone) DO NOTHING;

-- 3. Seed Sample Completed Shifts
INSERT INTO cash_drawer_shifts (id, branch_id, cashier_id, cashier_name, opened_at, closed_at, initial_cash, counted_cash, calculated_cash, vietqr_revenue, card_revenue, variance, status) VALUES
('SHIFT-CLOSE-01', 'B01', 'staff-01', 'Trần Thu Hà', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '16 hours', 1000000, 4850000, 4850000, 8920000, 1200000, 0, 'CLOSED')
ON CONFLICT (id) DO NOTHING;
