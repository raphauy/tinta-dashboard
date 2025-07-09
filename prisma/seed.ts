import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crear usuario admin
  const admin = await prisma.user.upsert({
    where: { email: 'rapha.uy@rapha.uy' },
    update: {},
    create: {
      email: 'rapha.uy@rapha.uy',
      name: 'Admin User',
      role: Role.ADMIN,
    },
  })

  console.log('Admin user created:', admin)

  // Crear usuario cliente de ejemplo
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      name: 'Client User',
      role: Role.CLIENT,
    },
  })

  console.log('Client user created:', client)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })