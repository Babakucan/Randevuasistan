import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding user data...');

  // Get the first user with salon profile
  const user = await prisma.user.findFirst({
    include: {
      salonProfiles: true,
    },
  });

  if (!user) {
    console.error('❌ No user found in database. Please register first.');
    process.exit(1);
  }

  if (!user.salonProfiles || user.salonProfiles.length === 0) {
    console.error('❌ No salon profile found for user. Please register first.');
    process.exit(1);
  }

  const salon = user.salonProfiles[0];
  console.log(`✅ Found user: ${user.email}`);
  console.log(`✅ Found salon: ${salon.name}`);

  // Check if data already exists
  const existingServices = await prisma.service.count({
    where: { salonId: salon.id },
  });

  if (existingServices > 0) {
    console.log('⚠️  Data already exists for this salon. Skipping...');
    process.exit(0);
  }

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        salonId: salon.id,
        name: 'Saç Kesimi',
        description: 'Profesyonel saç kesimi hizmeti',
        duration: 30,
        price: 150,
        category: 'Kesim',
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        salonId: salon.id,
        name: 'Saç Boyama',
        description: 'Profesyonel saç boyama hizmeti',
        duration: 120,
        price: 400,
        category: 'Boyama',
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        salonId: salon.id,
        name: 'Fön',
        description: 'Profesyonel fön hizmeti',
        duration: 30,
        price: 100,
        category: 'Şekillendirme',
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        salonId: salon.id,
        name: 'Saç Bakımı',
        description: 'Profesyonel saç bakım hizmeti',
        duration: 45,
        price: 200,
        category: 'Bakım',
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        salonId: salon.id,
        name: 'Kaş Alımı',
        description: 'Profesyonel kaş alım hizmeti',
        duration: 20,
        price: 80,
        category: 'Estetik',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${services.length} services`);

  // Create employees
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        salonId: salon.id,
        name: 'Ahmet Yılmaz',
        email: 'ahmet@salon.com',
        phone: '5551111111',
        position: 'Kuaför',
        specialties: ['Saç Kesimi', 'Saç Boyama'],
        workingHours: {
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: '10:00', close: '16:00' },
          sunday: { open: null, close: null },
        },
        isActive: true,
      },
    }),
    prisma.employee.create({
      data: {
        salonId: salon.id,
        name: 'Ayşe Demir',
        email: 'ayse@salon.com',
        phone: '5552222222',
        position: 'Kuaför',
        specialties: ['Fön', 'Saç Kesimi', 'Kaş Alımı'],
        workingHours: {
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: '10:00', close: '16:00' },
          sunday: { open: null, close: null },
        },
        isActive: true,
      },
    }),
    prisma.employee.create({
      data: {
        salonId: salon.id,
        name: 'Mehmet Kaya',
        email: 'mehmet@salon.com',
        phone: '5553333333',
        position: 'Kuaför',
        specialties: ['Saç Boyama', 'Saç Bakımı'],
        workingHours: {
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: '10:00', close: '16:00' },
          sunday: { open: null, close: null },
        },
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${employees.length} employees`);

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        salonId: salon.id,
        name: 'Fatma Şahin',
        phone: '5554444444',
        email: 'fatma@example.com',
        notes: 'Düzenli müşteri, saç kesimi tercih ediyor',
      },
    }),
    prisma.customer.create({
      data: {
        salonId: salon.id,
        name: 'Zeynep Yıldız',
        phone: '5555555555',
        email: 'zeynep@example.com',
        notes: 'Saç boyama hizmeti alıyor',
      },
    }),
    prisma.customer.create({
      data: {
        salonId: salon.id,
        name: 'Elif Özkan',
        phone: '5556666666',
        email: 'elif@example.com',
        notes: 'Yeni müşteri',
      },
    }),
    prisma.customer.create({
      data: {
        salonId: salon.id,
        name: 'Selin Arslan',
        phone: '5557777777',
        email: 'selin@example.com',
        notes: 'Fön ve bakım hizmeti tercih ediyor',
      },
    }),
    prisma.customer.create({
      data: {
        salonId: salon.id,
        name: 'Büşra Çelik',
        phone: '5558888888',
        email: 'busra@example.com',
        notes: 'Düzenli müşteri',
      },
    }),
    prisma.customer.create({
      data: {
        salonId: salon.id,
        name: 'Gizem Aydın',
        phone: '5559999999',
        email: 'gizem@example.com',
        notes: 'Kaş alım hizmeti tercih ediyor',
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} customers`);

  // Create appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointments = [];

  // Today's appointments
  for (let i = 0; i < 3; i++) {
    const appointmentDate = new Date(today);
    appointmentDate.setHours(10 + i * 2, 0, 0, 0);
    
    const service = services[i % services.length];
    const endTime = new Date(appointmentDate);
    endTime.setMinutes(endTime.getMinutes() + service.duration);

    appointments.push(
      prisma.appointment.create({
        data: {
          salonId: salon.id,
          customerId: customers[i % customers.length].id,
          serviceId: service.id,
          employeeId: employees[i % employees.length].id,
          startTime: appointmentDate,
          endTime: endTime,
          status: i === 0 ? 'scheduled' : i === 1 ? 'confirmed' : 'scheduled',
          source: 'manual',
          notes: `Test randevu ${i + 1}`,
        },
      })
    );
  }

  // Tomorrow's appointments
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (let i = 0; i < 4; i++) {
    const appointmentDate = new Date(tomorrow);
    appointmentDate.setHours(11 + i * 2, 0, 0, 0);
    
    const service = services[(i + 1) % services.length];
    const endTime = new Date(appointmentDate);
    endTime.setMinutes(endTime.getMinutes() + service.duration);

    appointments.push(
      prisma.appointment.create({
        data: {
          salonId: salon.id,
          customerId: customers[(i + 1) % customers.length].id,
          serviceId: service.id,
          employeeId: employees[(i + 1) % employees.length].id,
          startTime: appointmentDate,
          endTime: endTime,
          status: 'scheduled',
          source: 'manual',
          notes: `Test randevu ${i + 4 + 1}`,
        },
      })
    );
  }

  // Next week's appointments
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  for (let i = 0; i < 3; i++) {
    const appointmentDate = new Date(nextWeek);
    appointmentDate.setHours(13 + i * 2, 0, 0, 0);
    
    const service = services[(i + 2) % services.length];
    const endTime = new Date(appointmentDate);
    endTime.setMinutes(endTime.getMinutes() + service.duration);

    appointments.push(
      prisma.appointment.create({
        data: {
          salonId: salon.id,
          customerId: customers[(i + 2) % customers.length].id,
          serviceId: service.id,
          employeeId: employees[(i + 2) % employees.length].id,
          startTime: appointmentDate,
          endTime: endTime,
          status: 'scheduled',
          source: 'manual',
          notes: `Test randevu ${i + 8 + 1}`,
        },
      })
    );
  }

  await Promise.all(appointments);
  console.log(`✅ Created ${appointments.length} appointments`);

  console.log('\n🎉 Seeding completed!');
  console.log(`\n📊 Summary:`);
  console.log(`   - Services: ${services.length}`);
  console.log(`   - Employees: ${employees.length}`);
  console.log(`   - Customers: ${customers.length}`);
  console.log(`   - Appointments: ${appointments.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

