import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { getUserSalonProfile } from '../utils/salon';

const createEmployeeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  workingHours: z.record(z.any()).optional(),
  leaveDays: z.array(z.string()).optional(),
  bio: z.string().optional(),
  experienceYears: z.number().optional(),
  hourlyRate: z.number().optional(),
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

    const employee = await prisma.employee.updateMany({
      where: {
        id,
        salonId: activeSalonId,
      },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.position !== undefined && { position: body.position }),
        ...(body.specialties !== undefined && { specialties: body.specialties }),
        ...(body.workingHours !== undefined && { workingHours: body.workingHours }),
        ...(body.leaveDays !== undefined && { leaveDays: body.leaveDays }),
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.experienceYears !== undefined && { experienceYears: body.experienceYears }),
        ...(body.hourlyRate !== undefined && { hourlyRate: body.hourlyRate }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
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

export const assignServiceToEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id: employeeId } = req.params;
    const { serviceId, assign } = req.body;
    const salonId = req.query.salonId as string | undefined;

    if (!serviceId || typeof assign !== 'boolean') {
      res.status(400).json({
        success: false,
        message: 'serviceId and assign (boolean) are required',
      });
      return;
    }

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    // Verify employee belongs to salon
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        salonId: activeSalonId,
      },
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Verify service belongs to salon
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        salonId: activeSalonId,
      },
    });

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    if (assign) {
      // Assign service to employee (upsert to handle duplicates)
      await prisma.employeeService.upsert({
        where: {
          employeeId_serviceId: {
            employeeId,
            serviceId,
          },
        },
        update: {
          isAvailable: true,
        },
        create: {
          employeeId,
          serviceId,
          isAvailable: true,
        },
      });
    } else {
      // Remove service assignment
      await prisma.employeeService.deleteMany({
        where: {
          employeeId,
          serviceId,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: assign ? 'Service assigned to employee successfully' : 'Service removed from employee successfully',
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

