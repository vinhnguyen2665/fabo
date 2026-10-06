-- ========================================================
-- FABO AUTH & HRM SERVICE: V2__seed_hrm_master_data.sql
-- Add pin_code & seed branches, roles, staff users, shifts
-- ========================================================

-- 1. Add pin_code to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_code VARCHAR(100);

-- 2. Seed Brand & Branch
INSERT INTO brands (id, name, tax_code) VALUES
('BRAND_01', 'Hệ Thống Ẩm Thực Fabo F&B', '0316888999')
ON CONFLICT (id) DO NOTHING;

INSERT INTO branches (id, brand_id, name, address, phone, is_active) VALUES
('B01', 'BRAND_01', 'Fabo Central Landmark 81', 'Tầng B1, TTTM Vincom Landmark 81, TP. Hồ Chí Minh', '0287779999', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Roles
INSERT INTO roles (id, branch_id, name, description) VALUES
('ROLE_STORE_MANAGER', 'B01', 'STORE_MANAGER', 'Quản lý cửa hàng / Toàn quyền vận hành & cấu hình sơ đồ bàn'),
('ROLE_CASHIER', 'B01', 'CASHIER', 'Thu ngân bán hàng / Order, in bill và kết ca'),
('ROLE_WAITER', 'B01', 'WAITER', 'Nhân viên phục vụ / Gọi món & kiểm tra bàn')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Staff Users with PIN Codes
INSERT INTO users (id, branch_id, username, password_hash, full_name, email, phone, role_id, pin_code, is_active) VALUES
('staff-01', 'B01', 'cashier_ha', '$2a$10$abcdefghijklmnopqrstuv', 'Trần Thu Hà', 'ha.tran@fabo.vn', '0901234567', 'ROLE_CASHIER', '1234', TRUE),
('staff-02', 'B01', 'cashier_nam', '$2a$10$abcdefghijklmnopqrstuv', 'Nguyễn Văn Nam', 'nam.nguyen@fabo.vn', '0912345678', 'ROLE_CASHIER', '5678', TRUE),
('staff-03', 'B01', 'manager_long', '$2a$10$abcdefghijklmnopqrstuv', 'Lê Hoàng Long', 'long.le@fabo.vn', '0987654321', 'ROLE_STORE_MANAGER', '9999', TRUE)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role_id = EXCLUDED.role_id,
  pin_code = EXCLUDED.pin_code;

-- 5. Seed Work Shifts
INSERT INTO work_shifts (id, branch_id, name, start_time, end_time) VALUES
('SHIFT_01', 'B01', 'Ca Sáng (06:30 - 14:30)', '06:30:00', '14:30:00'),
('SHIFT_02', 'B01', 'Ca Chiều (14:00 - 22:30)', '14:00:00', '22:30:00'),
('SHIFT_03', 'B01', 'Ca Tối (22:00 - 06:00)', '22:00:00', '06:00:00')
ON CONFLICT (id) DO NOTHING;
