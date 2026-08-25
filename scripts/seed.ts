import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const nissan = await prisma.brand.upsert({
    where: {
      slug: "nissan",
    },
    update: {},
    create: {
      name: "Nissan",
      slug: "nissan",
    },
  });

  await prisma.carModel.upsert({
    where: {
      brandId_slug: {
        brandId: nissan.id,
        slug: "nv200",
      },
    },
    update: {},
    create: {
      name: "NV200",
      slug: "nv200",
      brandId: nissan.id,
    },
  });

  const categories = [
    "Carroçaria",
    "Motor",
    "Iluminação",
    "Travagem",
    "Suspensão",
    "Elétrica",
    "Interior",
  ];

  for (const name of categories) {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");

    await prisma.category.upsert({
      where: {
        slug,
      },
      update: {},
      create: {
        name,
        slug,
      },
    });
  }

  console.log("Dados iniciais criados com sucesso.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });