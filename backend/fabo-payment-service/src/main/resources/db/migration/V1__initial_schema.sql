-- ========================================================
-- FABO PAYMENT SERVICE: V1__initial_schema.sql
-- VietQR Napas247 Transactions & Webhook Logs
-- ========================================================

CREATE TABLE payment_transactions (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    invoice_id VARCHAR(50),
    amount NUMERIC(15, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'VIETQR',
    vietqr_raw_payload TEXT,
    vietqr_crc VARCHAR(4),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED, EXPIRED
    bank_name VARCHAR(100),
    transaction_ref VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE webhook_logs (
    id VARCHAR(36) PRIMARY KEY,
    provider VARCHAR(50) NOT NULL, -- SEPAY, CASSO, BANK_DIRECT
    payload_raw TEXT NOT NULL,
    signature VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PROCESSED',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pay_trans_order ON payment_transactions(order_id);
CREATE INDEX idx_pay_trans_ref ON payment_transactions(transaction_ref);
