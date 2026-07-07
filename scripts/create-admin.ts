import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

async function main() {
  const password = await hashPassword("admin123");

  await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@smartclear.com",
      password,
      role: "OFFICER",
    },
  });

  console.log("Admin created.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });