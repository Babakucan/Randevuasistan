import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { getUserSalonProfile } from '../utils/salon';

const createEmployeeSchema = z.object({
  name: z.string().min(1),
  email: z.union([z.string().email(), z.string().length(0), z.null()]).optional(),
  phone: z.union([z.string(), z.string().length(0), z.null()]).optional(),
  position: z.union([z.string(), z.string().length(0), z.null()]).optional(),
  specialties: z.array(z.string()).optional(),
  workingHours: z.record(z.any()).optional(),
  leaveDays: z.array(z.string()).optional(),
  bio: z.union([z.string(), z.string().length(0), z.null()]).optional(),
  experienceYears: z.union([z.number(), z.null()]).optional(),
  hourlyRate: z.union([z.number(), z.null()]).optional(),
  isActive: z.boolean().optional(),
});

const updateEmployeeSchema = createEmployeeSchema.partial();

export const getEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const salonId = req.query.salonId as string | undefined;

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const employees = await prisma.employee.findMany({
      where: { salonId: activeSalonId },
      include: {
        employeeServices: {
          include: {
            service: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get employees',
    });
  }
};

export const getEmployeeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const salonId = req.query.salonId as string | undefined;

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const employee = await prisma.employee.findFirst({
      where: {
        id,
        salonId: activeSalonId,
      },
      include: {
        employeeServices: {
          include: {
            service: true,
          },
        },
        appointments: {
          orderBy: { startTime: 'desc' },
          take: 10,
        },
      },
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get employee',
    });
  }
};

export const createEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const body = createEmployeeSchema.parse(req.body);
    const salonId = req.query.salonId as string | undefined;

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const employee = await prisma.employee.create({
      data: {
        salonId: activeSalonId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        position: body.position,
        specialties: body.specialties || [],
        workingHours: body.workingHours || {},
        leaveDays: body.leaveDays || [],
        bio: body.bio,
        experienceYears: body.experienceYears,
        hourlyRate: body.hourlyRate,
        isActive: body.isActive ?? true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
    });
  }
};

export const updateEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const body = updateEmployeeSchema.parse(req.body);
    const salonId = req.query.salonId as string | undefined;

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    // Prepare update data, handling null/undefined values properly
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email || null;
    if (body.phone !== undefined) updateData.phone = body.phone || null;
    if (body.position !== undefined) updateData.position = body.position || null;
    if (body.specialties !== undefined) updateData.specialties = body.specialties || [];
    if (body.workingHours !== undefined) updateData.workingHours = body.workingHours || {};
    if (body.leaveDays !== undefined) updateData.leaveDays = body.leaveDays || [];
    if (body.bio !== undefined) updateData.bio = body.bio || null;
    if (body.experienceYears !== undefined) updateData.experienceYears = body.experienceYears ?? null;
    if (body.hourlyRate !== undefined) updateData.hourlyRate = body.hourlyRate ?? null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const employee = await prisma.employee.updateMany({
      where: {
        id,
        salonId: activeSalonId,
      },
      data: updateData,
    });

    if (employee.count === 0) {
      throw new AppError('Employee not found', 404);
    }

    const updatedEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee',
    });
  }
};

export const deleteEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const salonId = req.query.salonId as string | undefined;

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const employee = await prisma.employee.deleteMany({
      where: {
        id,
        salonId: activeSalonId,
      },
    });

    if (employee.count === 0) {
      throw new AppError('Employee not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
    });
  }
};

// Employee Service Assignment
export const assignServiceToEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id: employeeId } = req.params;
    const { serviceId, isAvailable = true } = req.body;
    const salonId = req.query.salonId as string | undefined;

    if (!serviceId) {
      throw new AppError('Service ID is required', 400);
    }

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    // Check if employee exists and belongs to salon
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        salonId: activeSalonId,
      },
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Check if service exists and belongs to salon
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        salonId: activeSalonId,
      },
    });

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    // Create or update employee service relationship
    const employeeService = await prisma.employeeService.upsert({
      where: {
        employeeId_serviceId: {
          employeeId,
          serviceId,
        },
      },
      update: {
        isAvailable,
      },
      create: {
        employeeId,
        serviceId,
        isAvailable,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Service assigned to employee successfully',
      data: employeeService,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Assign service to employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign service to employee',
    });
  }
};

export const removeServiceFromEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id: employeeId, serviceId } = req.params;
    const salonId = req.query.salonId as string | undefined;

    if (!serviceId) {
      throw new AppError('Service ID is required', 400);
    }

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    // Check if employee exists and belongs to salon
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        salonId: activeSalonId,
      },
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Delete employee service relationship
    await prisma.employeeService.deleteMany({
      where: {
        employeeId,
        serviceId,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Service removed from employee successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Remove service from employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove service from employee',
    });
  }
};

