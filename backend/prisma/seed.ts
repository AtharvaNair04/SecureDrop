import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Create permissions
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
  ]);

  // 2. Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      permissions: {
        connect: permissions.map((p) => ({ id: p.id })),
      },
    },
    include: { permissions: true },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      permissions: {
        connect: permissions
          .filter((p) => p.name !== 'DELETE_FILE') // user cannot delete
          .map((p) => ({ id: p.id })),
      },
    },
    include: { permissions: true },
  });

  console.log('Roles created:', { adminRole, userRole });

  // 3. Assign role to existing user
  const user = await prisma.user.findUnique({
    where: { email: 'test@test.com' },
  });

  if (!user) {
    console.log('User not found, skipping role assignment');
    return;
  }

  // Assign USER role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: userRole.id,
    },
  });

  console.log('Assigned USER role to:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });