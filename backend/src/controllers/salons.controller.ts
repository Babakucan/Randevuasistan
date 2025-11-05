import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';

const createSalonSchema = z.object({
  name: z.string().min(1),
  ownerName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  workingHours: z.record(z.any()).optional(),
});

const updateSalonSchema = createSalonSchema.partial();

export const getSalons = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { salonProfiles: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user.salonProfiles,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Get salons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get salons',
    });
  }
};

export const getSalonById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const salon = await prisma.salonProfile.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        services: true,
        customers: true,
        employees: true,
        appointments: true,
      },
    });

    if (!salon) {
      throw new AppError('Salon not found', 404);
    }

    res.status(200).json({
      success: true,
      data: salon,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Get salon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get salon',
    });
  }
};

export const createSalon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const body = createSalonSchema.parse(req.body);

    const salon = await prisma.salonProfile.create({
      data: {
        userId,
        name: body.name,
        ownerName: body.ownerName,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        description: body.description || null,
        logoUrl: body.logoUrl || null,
        workingHours: body.workingHours || {},
      },
    });

    res.status(201).json({
      success: true,
      message: 'Salon created successfully',
      data: salon,
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

    console.error('Create salon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create salon',
    });
  }
};

export const updateSalon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const body = updateSalonSchema.parse(req.body);

    const salon = await prisma.salonProfile.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.ownerName && { ownerName: body.ownerName }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
        ...(body.workingHours !== undefined && { workingHours: body.workingHours }),
      },
    });

    if (salon.count === 0) {
      throw new AppError('Salon not found', 404);
    }

    const updatedSalon = await prisma.salonProfile.findUnique({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Salon updated successfully',
      data: updatedSalon,
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

    console.error('Update salon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update salon',
    });
  }
};

export const deleteSalon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const salon = await prisma.salonProfile.deleteMany({
      where: {
        id,
        userId,
      },
    });

    if (salon.count === 0) {
      throw new AppError('Salon not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Salon deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Delete salon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete salon',
    });
  }
};

