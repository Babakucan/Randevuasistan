-- Fix RLS policies for salon_profiles
-- Run this in Supabase SQL Editor

-- Tüm policy'leri sil
DROP POLICY IF EXISTS "Users can view own salon profile" ON salon_profiles;
DROP POLICY IF EXISTS "Users can insert own salon profile" ON salon_profiles;
DROP POLICY IF EXISTS "Users can update own salon profile" ON salon_profiles;
DROP POLICY IF EXISTS "Users can delete own salon profile" ON salon_profiles;

-- Basit policy oluştur
CREATE POLICY "Allow all for authenticated users" ON salon_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Test the policies
-- This should return the current user ID
SELECT auth.uid() as current_user_id;

-- Check if policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'salon_profiles';
