import { Request } from 'express';

// Pagination helper
export const getPaginationParams = (req: Request) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
};

// Date helpers
export const formatDate = (date: Date | string): string => {
  return new Date(date).toISOString();
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

export const isTimeConflict = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);
  
  return s1 < e2 && s2 < e1;
};

// String helpers
export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Turkish phone number
  if (cleaned.length === 10) {
    return `+90${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `+90${cleaned.slice(1)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('90')) {
    return `+${cleaned}`;
  }
  
  return phone; // Return original if can't format
};

export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 12;
};

// Validation helpers
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Response helpers
export const createSuccessResponse = (data: any, message?: string) => {
  return {
    success: true,
    data,
    message
  };
};

export const createErrorResponse = (error: string, statusCode: number = 400) => {
  return {
    success: false,
    error,
    statusCode
  };
};

// Time helpers
export const getWorkingHours = () => {
  return {
    monday: { start: '09:00', end: '18:00' },
    tuesday: { start: '09:00', end: '18:00' },
    wednesday: { start: '09:00', end: '18:00' },
    thursday: { start: '09:00', end: '18:00' },
    friday: { start: '09:00', end: '18:00' },
    saturday: { start: '09:00', end: '16:00' },
    sunday: { start: '10:00', end: '14:00' }
  };
};

export const isWorkingDay = (date: Date): boolean => {
  const day = date.getDay();
  return day >= 1 && day <= 6; // Monday to Saturday
};

export const isWorkingHour = (date: Date, workingHours: any): boolean => {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const time = date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const dayHours = workingHours[dayName];
  if (!dayHours) return false;
  
  return time >= dayHours.start && time <= dayHours.end;
};

// Appointment helpers
export const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const start = new Date(startTime);
  const end = addMinutes(start, durationMinutes);
  return formatDate(end);
};

export const getAvailableTimeSlots = (
  date: Date,
  workingHours: any,
  durationMinutes: number = 60,
  existingAppointments: any[] = []
): string[] => {
  const slots: string[] = [];
  const dayName = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const dayHours = workingHours[dayName];
  
  if (!dayHours) return slots;
  
  const startTime = new Date(date);
  startTime.setHours(parseInt(dayHours.start.split(':')[0]));
  startTime.setMinutes(parseInt(dayHours.start.split(':')[1]));
  
  const endTime = new Date(date);
  endTime.setHours(parseInt(dayHours.end.split(':')[0]));
  endTime.setMinutes(parseInt(dayHours.end.split(':')[1]));
  
  const currentTime = new Date(startTime);
  
  while (currentTime < endTime) {
    const slotEnd = addMinutes(currentTime, durationMinutes);
    
    if (slotEnd <= endTime) {
      // Check if slot conflicts with existing appointments
      const hasConflict = existingAppointments.some(appointment => {
        const appStart = new Date(appointment.start_time);
        const appEnd = new Date(appointment.end_time);
        return isTimeConflict(
          formatDate(currentTime),
          formatDate(slotEnd),
          formatDate(appStart),
          formatDate(appEnd)
        );
      });
      
      if (!hasConflict) {
        slots.push(formatDate(currentTime));
      }
    }
    
    currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-minute intervals
  }
  
  return slots;
};

// Notification helpers
export const createNotification = (
  salon_id: string,
  type: string,
  title: string,
  message: string,
  target_type?: string,
  target_id?: string
) => {
  return {
    salon_id,
    type,
    title,
    message,
    target_type,
    target_id,
    is_read: false,
    created_at: new Date().toISOString()
  };
};

// Logging helpers
export const logError = (error: any, context?: string) => {
  console.error(`[${new Date().toISOString()}] ${context || 'ERROR'}:`, error);
};

export const logInfo = (message: string, context?: string) => {
  console.log(`[${new Date().toISOString()}] ${context || 'INFO'}:`, message);
};
