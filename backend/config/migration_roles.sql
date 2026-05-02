-- ══════════════════════════════════════════
-- MIGRATION: Add Role-Based Access Control
-- Run: psql -U postgres -d videostream -f migration_roles.sql
-- ══════════════════════════════════════════

-- Step 1: Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'));

-- Step 2: Add is_banned column
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  is_banned BOOLEAN DEFAULT FALSE;

-- Step 3: Add ban_reason column
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  ban_reason TEXT DEFAULT NULL;

-- Step 4: Add video reports table
CREATE TABLE IF NOT EXISTS video_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Add withdrawal requests table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(50) DEFAULT 'paypal',
  account_details TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  admin_note TEXT DEFAULT '',
  processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Step 6: Add audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  details TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Create first admin user (change email/password as needed)
-- Password is: Admin@123 (bcrypt hash)
INSERT INTO users (username, email, password_hash, role)
VALUES (
  'admin',
  'admin@videostream.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin'
) ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_video_reports_status ON video_reports(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id);