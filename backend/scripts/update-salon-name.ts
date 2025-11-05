import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Updating salon name...');

  // Find the salon profile
  const salon = await prisma.salonProfile.findFirst({
    where: {
      name: 'Anıl Kuaför',
    },
  });

  if (!salon) {
    console.log('❌ Salon not found');
    return;
  }

  console.log(`Found salon: ${salon.name} (ID: ${salon.id})`);

  // Update the salon name
  const updated = await prisma.salonProfile.update({
    where: { id: salon.id },
    data: {
      name: 'Sevim Kuaför',
    },
  });

  console.log(`✅ Salon name updated to: ${updated.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

