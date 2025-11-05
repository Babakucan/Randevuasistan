import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking salon profiles...');

  // Get all users with their salon profiles
  const users = await prisma.user.findMany({
    include: {
      salonProfiles: true,
    },
  });

  console.log(`\n📊 Found ${users.length} user(s):\n`);

  for (const user of users) {
    console.log(`👤 User: ${user.email} (${user.name})`);
    console.log(`   Salon Profiles: ${user.salonProfiles.length}`);
    
    for (const salon of user.salonProfiles) {
      console.log(`   - ${salon.name} (ID: ${salon.id})`);
      console.log(`     Owner: ${salon.ownerName}`);
      console.log(`     Phone: ${salon.phone || 'N/A'}`);
      console.log(`     Email: ${salon.email || 'N/A'}`);
      console.log(`     Created: ${salon.createdAt}`);
      console.log('');
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

