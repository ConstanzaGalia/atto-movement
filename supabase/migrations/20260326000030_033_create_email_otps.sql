-- OTP codes for email verification and password reset (service role only)

CREATE TABLE IF NOT EXISTS email_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('email_verify', 'password_reset')),
  code_hash TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_otps_email_purpose ON email_otps(email, purpose);
CREATE INDEX IF NOT EXISTS idx_email_otps_expires ON email_otps(expires_at);

ALTER TABLE email_otps ENABLE ROW LEVEL SECURITY;

-- No public policies: only service role (bypasses RLS) accesses this table
