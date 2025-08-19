// Database Types
export interface SalonProfile {
  id: string;
  user_id: string;
  name: string;
  owner_name: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  logo_url?: string;
  working_hours?: any;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  salon_id: string;
  name: string;
  phone: string;
  email?: string;
  birth_date?: string;
  notes?: string;
  preferences?: any;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  salon_id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  specialties?: any[];
  working_hours?: any;
  leave_days?: any[];
  bio?: string;
  experience_years: number;
  hourly_rate: number;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeService {
  id: string;
  employee_id: string;
  service_id: string;
  is_available: boolean;
  custom_price?: number;
  created_at: string;
}

export interface Appointment {
  id: string;
  salon_id: string;
  customer_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  source: 'manual' | 'whatsapp' | 'phone' | 'ai';
  created_at: string;
  updated_at: string;
}

export interface AIConversation {
  id: string;
  salon_id: string;
  customer_phone: string;
  platform: 'whatsapp' | 'phone';
  messages: any[];
  status: 'active' | 'completed' | 'archived';
  appointment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CallHistory {
  id: string;
  user_id: string;
  customer_phone: string;
  call_type: 'incoming' | 'outgoing' | 'missed';
  duration: number;
  status: 'completed' | 'missed' | 'busy' | 'failed';
  recording_url?: string;
  transcript?: string;
  sentiment_analysis?: any;
  key_points?: any;
  follow_up_required: boolean;
  follow_up_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  salon_id: string;
  type: 'appointment_reminder' | 'new_customer' | 'new_appointment' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  target_type?: 'appointment' | 'customer' | 'employee' | 'service';
  target_id?: string;
  created_at: string;
}

// API Request/Response Types
export interface CreateAppointmentRequest {
  customer_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  notes?: string;
  source?: 'manual' | 'whatsapp' | 'phone' | 'ai';
}

export interface UpdateAppointmentRequest {
  customer_id?: string;
  service_id?: string;
  start_time?: string;
  end_time?: string;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  email?: string;
  birth_date?: string;
  notes?: string;
  preferences?: any;
}

export interface CreateEmployeeRequest {
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  specialties?: any[];
  working_hours?: any;
  bio?: string;
  experience_years?: number;
  hourly_rate?: number;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
}

export interface AIResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  salon_id?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  salon_name: string;
  owner_name: string;
  phone?: string;
}

// Utility Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
