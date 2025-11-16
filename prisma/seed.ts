import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create a test user with properly hashed password
  const hashedPassword = await bcrypt.hash("password", 10)
  
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
      password: hashedPassword,
    },
  })

  console.log("Created test user:", user.email)
  console.log("Test credentials: email=test@example.com, password=password")

  // Note: In a real seed, you would add sample songs here
  // For now, users can upload their own songs

  console.log("Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

