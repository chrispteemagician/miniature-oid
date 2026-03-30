-- Supabase Schema for -Oid Villages
-- Run this in your Supabase SQL Editor (only need to run once across all -Oids)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (with oid_memberships for tracking which villages they've joined)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  kudos INTEGER DEFAULT 0,
  oid_memberships TEXT[] DEFAULT '{}',
  is_villager BOOLEAN DEFAULT FALSE,
  is_dealer BOOLEAN DEFAULT FALSE,
  referral_code TEXT UNIQUE DEFAULT uuid_generate_v4()::TEXT,
  referred_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If table already exists, add oid_memberships column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS oid_memberships TEXT[] DEFAULT '{}';

-- Kudos transactions table
CREATE TABLE IF NOT EXISTS kudos_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table (village message board)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dealers table
CREATE TABLE IF NOT EXISTS dealers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  website TEXT,
  bio TEXT,
  is_founder BOOLEAN DEFAULT FALSE,
  pro_passes_remaining INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals tracking
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  kudos_awarded INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to increment kudos
CREATE OR REPLACE FUNCTION increment_kudos(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET kudos = kudos + amount WHERE id = user_id;
  INSERT INTO kudos_transactions (user_id, amount, reason)
  VALUES (user_id, amount, 'Activity reward');
END;
$$ LANGUAGE plpgsql;

-- Function to award referral kudos
CREATE OR REPLACE FUNCTION award_referral_kudos()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE users SET kudos = kudos + 50 WHERE id = NEW.referred_by;
    INSERT INTO kudos_transactions (user_id, amount, reason)
    VALUES (NEW.referred_by, 50, 'Referral: ' || NEW.username);

    INSERT INTO referrals (referrer_id, referred_id, kudos_awarded)
    VALUES (NEW.referred_by, NEW.id, 50);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for referral kudos (drop first to avoid duplicate)
DROP TRIGGER IF EXISTS referral_kudos_trigger ON users;
CREATE TRIGGER referral_kudos_trigger
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION award_referral_kudos();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kudos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "Users can insert own record" ON users;
DROP POLICY IF EXISTS "Kudos transactions viewable by owner" ON kudos_transactions;
DROP POLICY IF EXISTS "Messages are publicly readable" ON messages;
DROP POLICY IF EXISTS "Authenticated users can create messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;
DROP POLICY IF EXISTS "Dealers are publicly viewable" ON dealers;
DROP POLICY IF EXISTS "Referrals viewable by referrer" ON referrals;

-- Recreate policies
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own record" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Kudos transactions viewable by owner" ON kudos_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Messages are publicly readable" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create messages" ON messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON messages
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Dealers are publicly viewable" ON dealers
  FOR SELECT USING (true);

CREATE POLICY "Referrals viewable by referrer" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS users_kudos_idx ON users(kudos DESC);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON referrals(referrer_id);
