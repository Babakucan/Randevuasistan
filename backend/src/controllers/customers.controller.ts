import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { getUserSalonProfile } from '../utils/salon';

const createCustomerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  birthDate: z.string().optional(),
  notes: z.string().optional(),
});

const updateCustomerSchema = createCustomerSchema.partial();

export const getCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const salonId = req.query.salonId as string | undefined;

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const customers = await prisma.customer.findMany({
      where: { salonId: activeSalonId },
      include: {
        appointments: {
          orderBy: { startTime: 'desc' },
          include: {
            service: {
              select: {
                id: true,
                name: true,
                duration: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customers',
    });
  }
};

export const getCustomerById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const salonId = req.query.salonId as string | undefined;

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        salonId: activeSalonId,
      },
      include: {
        appointments: {
          orderBy: { startTime: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer',
    });
  }
};

export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const body = createCustomerSchema.parse(req.body);
    const salonId = req.query.salonId as string | undefined;

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const customer = await prisma.customer.create({
      data: {
        salonId: activeSalonId,
        name: body.name,
        phone: body.phone,
        email: body.email,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        notes: body.notes,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer,
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

    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
    });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const body = updateCustomerSchema.parse(req.body);
    const salonId = req.query.salonId as string | undefined;

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const customer = await prisma.customer.updateMany({
      where: {
        id,
        salonId: activeSalonId,
      },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.phone && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.birthDate && { birthDate: new Date(body.birthDate) }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });

    if (customer.count === 0) {
      throw new AppError('Customer not found', 404);
    }

    const updatedCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: updatedCustomer,
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

    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
    });
  }
};

export const deleteCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const salonId = req.query.salonId as string | undefined;

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const customer = await prisma.customer.deleteMany({
      where: {
        id,
        salonId: activeSalonId,
      },
    });

    if (customer.count === 0) {
      throw new AppError('Customer not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
    });
  }
};

