import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL || '';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // =============== USUARIO DEL SISTEMA ===============

  console.log('👤 Creando usuarios...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@correo.com' },
    update: {},
    create: {
      email: 'admin@correo.com',
      passwordHash: await bcrypt.hash('Admin123!', 10),
      role: 'admin',
      fullName: 'Administrador del Sistema',
      isActive: true,
    },
  });

  const cooridnatorUser = await prisma.user.upsert({
    where: { email: 'coordinador@correo.com' },
    update: {},
    create: {
      email: 'coordinador@correo.com',
      passwordHash: await bcrypt.hash('Coord123!', 10),
      role: 'coordinator',
      fullName: 'Coordinador del Sistema',
      isActive: true,
    },
  });

  // =============== PERSONAL ===============

  console.log('👨‍✈️ Creando personal...');

  const staff = await prisma.staff.upsert({
    where: { employeeNumber: 'EMP-001' },
    update: {},
    create: {
      userId: cooridnatorUser.id,
      employeeNumber: 'EMP-001',
      fullName: 'Coordinador del Sistema',
      email: 'coordinador@correo.com',
      phone: '+52 661 242 3585',
      role: 'supervisor',
      hireDate: new Date('2020-01-05'),
      birthDate: new Date('1985-05-20'),
      emergencyContact: 'Juan Rodríguez',
      emergencyPhone: '+52 661 242 3585',
      status: 'active',
      isActive: true,
    },
  });

  console.log('✅ Seed completado exitosamente!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error durante el seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
