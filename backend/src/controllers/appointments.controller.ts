import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { getUserSalonProfile } from '../utils/salon';

const createAppointmentSchema = z.object({
  customerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  employeeId: z.string().uuid().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show']).optional(),
  notes: z.string().optional(),
  source: z.enum(['manual', 'whatsapp', 'phone', 'ai']).optional(),
});

const updateAppointmentSchema = createAppointmentSchema.partial();

export const getAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const salonId = req.query.salonId as string | undefined;
    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const appointments = await prisma.appointment.findMany({
      where: { salonId: activeSalonId },
      include: {
        customer: true,
        service: true,
        employee: true,
      },
      orderBy: { startTime: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments',
    });
  }
};

export const getAppointmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const salonId = req.query.salonId as string | undefined;

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        salonId: activeSalonId,
      },
      include: {
        customer: true,
        service: true,
        employee: true,
      },
    });

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointment',
    });
  }
};

export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const body = createAppointmentSchema.parse(req.body);
    const salonId = req.query.salonId as string | undefined;

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const appointment = await prisma.appointment.create({
      data: {
        salonId: activeSalonId,
        customerId: body.customerId,
        serviceId: body.serviceId,
        employeeId: body.employeeId,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        status: body.status || 'scheduled',
        notes: body.notes,
        source: body.source || 'manual',
      },
      include: {
        customer: true,
        service: true,
        employee: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment,
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

    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
    });
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const body = updateAppointmentSchema.parse(req.body);
    const salonId = req.query.salonId as string | undefined;

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const appointment = await prisma.appointment.updateMany({
      where: {
        id,
        salonId: activeSalonId,
      },
      data: {
        ...(body.customerId && { customerId: body.customerId }),
        ...(body.serviceId && { serviceId: body.serviceId }),
        ...(body.employeeId !== undefined && { employeeId: body.employeeId }),
        ...(body.startTime && { startTime: new Date(body.startTime) }),
        ...(body.endTime && { endTime: new Date(body.endTime) }),
        ...(body.status && { status: body.status }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.source && { source: body.source }),
      },
    });

    if (appointment.count === 0) {
      throw new AppError('Appointment not found', 404);
    }

    const updatedAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: true,
        service: true,
        employee: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: updatedAppointment,
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

    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
    });
  }
};

export const deleteAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const salonId = req.query.salonId as string | undefined;

    const { salonId: activeSalonId } = await getUserSalonProfile(userId, salonId);

    const appointment = await prisma.appointment.deleteMany({
      where: {
        id,
        salonId: activeSalonId,
      },
    });

    if (appointment.count === 0) {
      throw new AppError('Appointment not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
    });
  }
};

