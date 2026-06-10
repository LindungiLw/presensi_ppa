const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;

  const hash = await bcrypt.hash(password, 10);
  const admin = await prisma.user.upsert({
    where: { email: email },
    update: {},
    create: {
      email: email,
      nama: "Superadmin",
      password: hash,
      role: "SUPERADMIN"
    }
  });
  console.log("Superadmin created:", admin.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
