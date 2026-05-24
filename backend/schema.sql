-- ==========================================
-- FEHUVIA DATABASE SCHEMA & SEED DATA
-- ==========================================
-- Copy and paste this script directly into the SQL Editor of your Supabase Dashboard.

-- 1. CLEANUP EXISTING TABLES (Order matches foreign key dependencies)
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1.5 CREATE USERS TABLE
-- Stores credentials and wallet settings for authorized SME executives.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(42),
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    portfolio_value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    automation_level VARCHAR(20) DEFAULT 'semi',
    conversion_preference VARCHAR(20) DEFAULT 'manual',
    risk_profile VARCHAR(20) DEFAULT 'balanced',
    bank_linked BOOLEAN DEFAULT FALSE,
    bank_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CREATE SUPPLIERS TABLE
-- Represents standard vendors and partners receiving payments from the SME.
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    wallet_address VARCHAR(42) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CREATE INVOICES TABLE
-- Represents the B2B invoice ledger linked to suppliers, tracking Web3 state & AI ratings.
CREATE TABLE invoices (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'settled', 'scheduled')),
    tx_hash VARCHAR(66) DEFAULT NULL, -- Nullable, filled when transaction succeeds on Morph L2
    ai_status VARCHAR(20) NOT NULL DEFAULT 'review' CHECK (ai_status IN ('safe', 'delay', 'review')),
    ai_reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.5 CREATE AI RECOMMENDATIONS HISTORY TABLE
-- Stores every AI prediction recommendation for audit trails and history display.
CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id VARCHAR(100) REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('safe', 'delay', 'review')),
    reason TEXT NOT NULL,
    predicted_runway INTEGER,
    cash_flow_trend VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SEED DATA - INSERT SUPPLIERS
-- We seed realistic SME counterparties with dummy EVM addresses.
INSERT INTO suppliers (id, name, email, wallet_address) VALUES
('b2a1a8c9-04fa-4d6d-b8d4-53a5e8bcf6ba', 'Morph Logistics Corp', 'billing@morphlogistics.io', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
('c3f1b4a6-7789-4d6d-bcf6-88ef5b48bc12', 'Cyber Security Audit Group', 'payments@cyberaudit.ph', '0x3C44Cd356D2255267510d944e2b0270a29E2F899'),
('d4e1b8c2-23c4-4b5b-a7e8-99df89bcf234', 'Aera Office Properties', 'rent@aeraviews.com', '0x90F79bf6EB2c4f870365E785982E1f101E93b906'),
('e5f1c9d3-34d5-4c6c-b8f9-aaef99bcf456', 'Elite Office Materials', 'orders@eliteoffice.ph', '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65');

-- 5. SEED DATA - INSERT INVOICES
-- Seed data spanning different due dates relative to May 24, 2026.
-- This gives our RAG pipeline a rich cash buffer context to calculate runways.
INSERT INTO invoices (id, supplier_id, amount, issue_date, due_date, status, ai_status, ai_reason) VALUES
('INV-2026-001', 'b2a1a8c9-04fa-4d6d-b8d4-53a5e8bcf6ba', 2500.00, '2026-05-10', '2026-06-02', 'pending', 'safe', 'AI Recommendation: Safe to pay. Cash reserves are projected to remain robust (>45 days runway) even post-settlement.'),
('INV-2026-002', 'c3f1b4a6-7789-4d6d-bcf6-88ef5b48bc12', 4500.00, '2026-05-12', '2026-06-08', 'pending', 'delay', 'AI Recommendation: Postpone payment. Upcoming payroll on Jun 5 introduces liquidity risk; delay past Jun 10 to balance inflow.'),
('INV-2026-003', 'd4e1b8c2-23c4-4b5b-a7e8-99df89bcf234', 3500.00, '2026-05-01', '2026-05-30', 'pending', 'safe', 'AI Recommendation: Safe to pay. Critical supply chain vendor. Maintaining good standing prevents logistics delays.'),
('INV-2026-004', 'e5f1c9d3-34d5-4c6c-b8f9-aaef99bcf456', 1200.00, '2026-05-18', '2026-06-15', 'pending', 'review', 'AI Recommendation: Review manually. Payment amount matches a duplicate billing range. Validate audit log prior to signing.');
