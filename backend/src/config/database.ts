import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for regular operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for operations requiring service role
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Database tables
export const TABLES = {
  SALON_PROFILES: 'salon_profiles',
  SERVICES: 'services',
  CUSTOMERS: 'customers',
  EMPLOYEES: 'employees',
  EMPLOYEE_SERVICES: 'employee_services',
  APPOINTMENTS: 'appointments',
  AI_CONVERSATIONS: 'ai_conversations',
  CALL_HISTORY: 'call_history',
  CALL_RECORDINGS: 'call_recordings',
  CONVERSATION_ANALYTICS: 'conversation_analytics',
  NOTIFICATIONS: 'notifications',
  SALON_SETTINGS: 'salon_settings'
} as const;

export default supabase;
