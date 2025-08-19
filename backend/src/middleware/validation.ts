import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Appointment validation
export const validateCreateAppointment = [
  body('customer_id').isUUID().withMessage('Valid customer ID required'),
  body('service_id').isUUID().withMessage('Valid service ID required'),
  body('start_time').isISO8601().withMessage('Valid start time required'),
  body('end_time').isISO8601().withMessage('Valid end time required'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('source').optional().isIn(['manual', 'whatsapp', 'phone', 'ai']).withMessage('Invalid source'),
  handleValidationErrors
];

export const validateUpdateAppointment = [
  body('customer_id').optional().isUUID().withMessage('Valid customer ID required'),
  body('service_id').optional().isUUID().withMessage('Valid service ID required'),
  body('start_time').optional().isISO8601().withMessage('Valid start time required'),
  body('end_time').optional().isISO8601().withMessage('Valid end time required'),
  body('status').optional().isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show']).withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  handleValidationErrors
];

// Customer validation
export const validateCreateCustomer = [
  body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('phone').trim().isMobilePhone('tr-TR').withMessage('Valid phone number required'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('birth_date').optional().isISO8601().withMessage('Valid birth date required'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('preferences').optional().isObject().withMessage('Preferences must be an object'),
  handleValidationErrors
];

export const validateUpdateCustomer = [
  body('name').optional().trim().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('phone').optional().trim().isMobilePhone('tr-TR').withMessage('Valid phone number required'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('birth_date').optional().isISO8601().withMessage('Valid birth date required'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('preferences').optional().isObject().withMessage('Preferences must be an object'),
  handleValidationErrors
];

// Employee validation
export const validateCreateEmployee = [
  body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('phone').optional().trim().isMobilePhone('tr-TR').withMessage('Valid phone number required'),
  body('position').optional().isString().withMessage('Position must be a string'),
  body('specialties').optional().isArray().withMessage('Specialties must be an array'),
  body('working_hours').optional().isObject().withMessage('Working hours must be an object'),
  body('bio').optional().isString().withMessage('Bio must be a string'),
  body('experience_years').optional().isInt({ min: 0 }).withMessage('Experience years must be a positive integer'),
  body('hourly_rate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  handleValidationErrors
];

export const validateUpdateEmployee = [
  body('name').optional().trim().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('phone').optional().trim().isMobilePhone('tr-TR').withMessage('Valid phone number required'),
  body('position').optional().isString().withMessage('Position must be a string'),
  body('specialties').optional().isArray().withMessage('Specialties must be an array'),
  body('working_hours').optional().isObject().withMessage('Working hours must be an object'),
  body('bio').optional().isString().withMessage('Bio must be a string'),
  body('experience_years').optional().isInt({ min: 0 }).withMessage('Experience years must be a positive integer'),
  body('hourly_rate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  handleValidationErrors
];

// Service validation
export const validateCreateService = [
  body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('duration').isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().isString().withMessage('Category must be a string'),
  handleValidationErrors
];

export const validateUpdateService = [
  body('name').optional().trim().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('duration').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().isString().withMessage('Category must be a string'),
  handleValidationErrors
];

// Auth validation
export const validateLogin = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

export const validateRegister = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('salon_name').trim().isLength({ min: 2, max: 255 }).withMessage('Salon name must be between 2 and 255 characters'),
  body('owner_name').trim().isLength({ min: 2, max: 255 }).withMessage('Owner name must be between 2 and 255 characters'),
  body('phone').optional().trim().isMobilePhone('tr-TR').withMessage('Valid phone number required'),
  handleValidationErrors
];

// AI conversation validation
export const validateAIConversation = [
  body('customer_phone').trim().isMobilePhone('tr-TR').withMessage('Valid phone number required'),
  body('platform').isIn(['whatsapp', 'phone']).withMessage('Platform must be whatsapp or phone'),
  body('message').isString().withMessage('Message is required'),
  handleValidationErrors
];
