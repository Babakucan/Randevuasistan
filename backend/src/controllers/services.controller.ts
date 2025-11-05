import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { getUserSalonProfile } from '../utils/salon';

const createServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  duration: z.number().min(1),
  price: z.number().min(0),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateServiceSchema = createServiceSchema.partial();

export const getServices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const salonId = req.query.salonId as string | undefined;
    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const services = await prisma.service.findMany({
      where: { salonId: activeSalonId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get services',
    });
  }
};

export const getServiceById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const salonId = req.query.salonId as string | undefined;

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const service = await prisma.service.findFirst({
      where: {
        id,
        salonId: activeSalonId,
      },
    });

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service',
    });
  }
};

export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const body = createServiceSchema.parse(req.body);
    const salonId = req.query.salonId as string | undefined;

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const service = await prisma.service.create({
      data: {
        salonId: activeSalonId,
        name: body.name,
        description: body.description,
        duration: body.duration,
        price: body.price,
        category: body.category,
        isActive: body.isActive ?? true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service,
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

    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
    });
  }
};

export const updateService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const body = updateServiceSchema.parse(req.body);
    const salonId = req.query.salonId as string | undefined;

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const service = await prisma.service.updateMany({
      where: {
        id,
        salonId: activeSalonId,
      },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.duration && { duration: body.duration }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    if (service.count === 0) {
      throw new AppError('Service not found', 404);
    }

    const updatedService = await prisma.service.findUnique({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService,
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

    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
    });
  }
};

export const deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const salonId = req.query.salonId as string | undefined;

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const service = await prisma.service.deleteMany({
      where: {
        id,
        salonId: activeSalonId,
      },
    });

    if (service.count === 0) {
      throw new AppError('Service not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
    });
  }
};

