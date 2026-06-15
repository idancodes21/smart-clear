import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.student.createMany({
    data: [
      {
        fullName: "Ikah Collins Ifebuche",
        regNo: "2022/249751",
        department: "Computer Science",
        level: "400",
      },
      {
        fullName: "Jane Smith",
        regNo: "2022/535357",
        department: "Computer Science",
        level: "400",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Students seeded successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });