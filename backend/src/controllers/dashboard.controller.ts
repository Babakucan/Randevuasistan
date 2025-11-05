import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { getUserSalonProfile } from '../utils/salon';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const querySalonId = req.query.salonId as string | undefined;
    const { salonId: activeSalonId } = await getUserSalonProfile(userId, querySalonId);
    const salonId = activeSalonId;

    // Get all counts
    const [appointments, customers, employees, services] = await Promise.all([
      prisma.appointment.count({ where: { salonId } }),
      prisma.customer.count({ where: { salonId } }),
      prisma.employee.count({ where: { salonId } }),
      prisma.service.count({ where: { salonId } }),
    ]);

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await prisma.appointment.findMany({
      where: {
        salonId,
        startTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        service: true,
      },
    });

    const todayEarnings = todayAppointments.reduce(
      (sum, apt) => sum + Number(apt.service.price),
      0
    );

    // Get this week's appointments
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const weekAppointments = await prisma.appointment.count({
      where: {
        salonId,
        startTime: {
          gte: weekStart,
        },
      },
    });

    // Get this month's earnings
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - 1);

    const monthAppointments = await prisma.appointment.findMany({
      where: {
        salonId,
        startTime: {
          gte: monthStart,
        },
      },
      include: {
        service: true,
      },
    });

    const monthEarnings = monthAppointments.reduce(
      (sum, apt) => sum + Number(apt.service.price),
      0
    );

    res.status(200).json({
      success: true,
      data: {
        totalAppointments: appointments,
        totalCustomers: customers,
        totalEmployees: employees,
        totalServices: services,
        todayAppointments: todayAppointments.length,
        todayEarnings,
        thisWeekAppointments: weekAppointments,
        thisMonthEarnings: monthEarnings,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats',
    });
  }
};

export const getRecentActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const querySalonId = req.query.salonId as string | undefined;
    const { salonId: activeSalonId } = await getUserSalonProfile(userId, querySalonId);
    const salonId = activeSalonId;

    // Get recent activities
    const [recentAppointments, recentCustomers, recentEmployees, recentServices] = await Promise.all([
      prisma.appointment.findMany({
        where: { salonId },
        include: {
          customer: true,
          service: true,
          employee: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.customer.findMany({
        where: { salonId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.employee.findMany({
        where: { salonId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.service.findMany({
        where: { salonId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const activities: any[] = [];

    recentAppointments.forEach((apt) => {
      activities.push({
        id: apt.id,
        type: 'appointment',
        description: `${apt.customer.name} randevu aldı`,
        details: `${apt.service.name} - ${apt.employee?.name || 'Atanmamış'}`,
        timestamp: apt.createdAt,
        createdAt: apt.createdAt,
      });
    });

    recentCustomers.forEach((customer) => {
      activities.push({
        id: customer.id,
        type: 'customer',
        description: `${customer.name} müşteri olarak eklendi`,
        details: 'Yeni müşteri kaydı',
        timestamp: customer.createdAt,
        createdAt: customer.createdAt,
      });
    });

    recentEmployees.forEach((employee) => {
      activities.push({
        id: employee.id,
        type: 'employee',
        description: `${employee.name} çalışan olarak eklendi`,
        details: `Pozisyon: ${employee.position || 'Belirtilmemiş'}`,
        timestamp: employee.createdAt,
        createdAt: employee.createdAt,
      });
    });

    recentServices.forEach((service) => {
      activities.push({
        id: service.id,
        type: 'service',
        description: `${service.name} hizmeti eklendi`,
        details: `Fiyat: ${service.price} TL`,
        timestamp: service.createdAt,
        createdAt: service.createdAt,
      });
    });

    // Sort by creation date (most recent first)
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({
      success: true,
      data: activities.slice(0, 10),
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent activities',
    });
  }
};

