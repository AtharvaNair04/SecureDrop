import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  /*
   * 1. Permissions
   */
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'UPLOAD_FILE' },
      update: {},
      create: { name: 'UPLOAD_FILE' },
    }),
    prisma.permission.upsert({
      where: { name: 'DELETE_FILE' },
      update: {},
      create: { name: 'DELETE_FILE' },
    }),
    prisma.permission.upsert({
      where: { name: 'VIEW_FILE' },
      update: {},
      create: { name: 'VIEW_FILE' },
    }),
    prisma.permission.upsert({
      where: { name: 'VIEW_SUBMISSIONS' },
      update: {},
      create: { name: 'VIEW_SUBMISSIONS' },
    }),
    prisma.permission.upsert({
      where: { name: 'UPDATE_SUBMISSION_STATUS' },
      update: {},
      create: { name: 'UPDATE_SUBMISSION_STATUS' },
    }),
  ]);

  /*
   * 2. Roles
   */
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {
      permissions: {
        set: permissions.map((p) => ({ id: p.id })),
      },
    },
    create: {
      name: 'ADMIN',
      permissions: {
        connect: permissions.map((p) => ({ id: p.id })),
      },
    },
  });

  const userPermissions = permissions.filter(
    (p) => p.name === 'UPLOAD_FILE',
  );

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {
      permissions: {
        set: userPermissions.map((p) => ({ id: p.id })),
      },
    },
    create: {
      name: 'USER',
      permissions: {
        connect: userPermissions.map((p) => ({ id: p.id })),
      },
    },
  });

  /*
   * 3. Admin user
   */
  const adminEmail = 'admin@securedrop.local';
  const adminPassword = 'SuperSecretAdmin123!';

  const hashedPassword = await argon2.hash(adminPassword);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
    },
  });

  /*
   * 4. Link admin user -> ADMIN role
   */
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  /*
   * 5. Optional test user role assignment
   */
  const existingUser = await prisma.user.findUnique({
    where: { email: 'test@test.com' },
  });

  if (existingUser) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: existingUser.id,
          roleId: userRole.id,
        },
      },
      update: {},
      create: {
        userId: existingUser.id,
        roleId: userRole.id,
      },
    });
  }

  console.log('✅ Seed complete');
  console.log('Admin login:');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });