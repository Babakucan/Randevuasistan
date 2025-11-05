import { SalonProfile } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/error';

/**
 * Get user's salon profile(s)
 * If salonId is provided, returns that specific salon
 * Otherwise, returns the first salon profile
 */
export async function getUserSalonProfile(
  userId: string,
  salonId?: string
): Promise<{ id: string; salonId: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { salonProfiles: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.salonProfiles || user.salonProfiles.length === 0) {
    throw new AppError('Salon profile not found', 404);
  }

  // If salonId is provided, find that specific salon
  if (salonId) {
    const salon = user.salonProfiles.find((sp: SalonProfile) => sp.id === salonId);
    if (!salon) {
      throw new AppError('Salon profile not found or access denied', 404);
    }
    return { id: userId, salonId: salon.id };
  }

  // Otherwise, return the first salon profile
  return { id: userId, salonId: user.salonProfiles[0].id };
}

