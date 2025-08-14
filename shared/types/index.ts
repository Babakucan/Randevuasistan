import { z } from 'zod';

// Appointment Types
export const AppointmentStatusSchema = z.enum(['beklemede', 'onaylandı', 'iptal', 'tamamlandı']);
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;

export const AppointmentSourceSchema = z.enum(['telefon', 'whatsapp', 'web']);
export type AppointmentSource = z.infer<typeof AppointmentSourceSchema>;

export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  customer_name: z.string().min(1),
  customer_phone: z.string().min(10),
  service: z.string().min(1),
  date: z.string().date(),
  time: z.string(),
  status: AppointmentStatusSchema,
  notes: z.string().optional(),
  source: AppointmentSourceSchema,
  ai_processed: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Appointment = z.infer<typeof AppointmentSchema>;

// Customer Types
export const CustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  notes: z.string().optional(),
  preferred_services: z.array(z.string()).optional(),
  total_appointments: z.number().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Customer = z.infer<typeof CustomerSchema>;

// Service Types
export const ServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  duration: z.number().min(1), // dakika cinsinden
  price: z.number().min(0),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Service = z.infer<typeof ServiceSchema>;

// Salon Settings Types
export const WorkingHoursSchema = z.object({
  monday: z.object({ open: z.string(), close: z.string() }),
  tuesday: z.object({ open: z.string(), close: z.string() }),
  wednesday: z.object({ open: z.string(), close: z.string() }),
  thursday: z.object({ open: z.string(), close: z.string() }),
  friday: z.object({ open: z.string(), close: z.string() }),
  saturday: z.object({ open: z.string(), close: z.string() }),
  sunday: z.object({ open: z.string(), close: z.string() }),
});

export const SalonSettingsSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().min(10),
  working_hours: WorkingHoursSchema,
  break_time: z.number().default(15), // dakika cinsinden
  max_appointments_per_day: z.number().default(20),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type SalonSettings = z.infer<typeof SalonSettingsSchema>;

// API Response Types
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  });

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// AI Types
export const AIProcessingResultSchema = z.object({
  customer_name: z.string().optional(),
  customer_phone: z.string().optional(),
  service: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  confidence: z.number().min(0).max(1),
  raw_text: z.string(),
});

export type AIProcessingResult = z.infer<typeof AIProcessingResultSchema>;

// WhatsApp Types
export const WhatsAppMessageSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  text: z.string(),
  timestamp: z.string().datetime(),
  type: z.enum(['text', 'image', 'audio', 'video']),
});

export type WhatsAppMessage = z.infer<typeof WhatsAppMessageSchema>;

// Auth Types
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'user']).default('user'),
  salon_id: z.string().uuid().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  salon_name: z.string().min(1),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
