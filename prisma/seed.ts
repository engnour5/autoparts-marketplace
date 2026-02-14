import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "engine-parts" },
      update: {},
      create: {
        name: "Engine Parts",
        nameAr: "قطع المحرك",
        slug: "engine-parts",
        icon: "engine",
      },
    }),
    prisma.category.upsert({
      where: { slug: "brakes" },
      update: {},
      create: {
        name: "Brakes",
        nameAr: "الفرامل",
        slug: "brakes",
        icon: "disc",
      },
    }),
    prisma.category.upsert({
      where: { slug: "electrical" },
      update: {},
      create: {
        name: "Electrical",
        nameAr: "الكهرباء",
        slug: "electrical",
        icon: "zap",
      },
    }),
    prisma.category.upsert({
      where: { slug: "body-parts" },
      update: {},
      create: {
        name: "Body Parts",
        nameAr: "أجزاء الهيكل",
        slug: "body-parts",
        icon: "car",
      },
    }),
    prisma.category.upsert({
      where: { slug: "suspension" },
      update: {},
      create: {
        name: "Suspension",
        nameAr: "نظام التعليق",
        slug: "suspension",
        icon: "settings",
      },
    }),
    prisma.category.upsert({
      where: { slug: "filters" },
      update: {},
      create: {
        name: "Filters",
        nameAr: "الفلاتر",
        slug: "filters",
        icon: "filter",
      },
    }),
    prisma.category.upsert({
      where: { slug: "oils-fluids" },
      update: {},
      create: {
        name: "Oils & Fluids",
        nameAr: "الزيوت والسوائل",
        slug: "oils-fluids",
        icon: "droplet",
      },
    }),
    prisma.category.upsert({
      where: { slug: "accessories" },
      update: {},
      create: {
        name: "Accessories",
        nameAr: "إكسسوارات",
        slug: "accessories",
        icon: "star",
      },
    }),
    prisma.category.upsert({
      where: { slug: "tires-wheels" },
      update: {},
      create: {
        name: "Tires & Wheels",
        nameAr: "الإطارات والعجلات",
        slug: "tires-wheels",
        icon: "circle",
      },
    }),
    prisma.category.upsert({
      where: { slug: "exhaust" },
      update: {},
      create: {
        name: "Exhaust System",
        nameAr: "نظام العادم",
        slug: "exhaust",
        icon: "wind",
      },
    }),
  ]);

  console.log(`Created ${categories.length} categories`);

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@autoparts.dz" },
    update: {},
    create: {
      email: "admin@autoparts.dz",
      password: adminPassword,
      name: "Admin",
      role: "ADMIN",
      phone: "+213 555 000 001",
      city: "Algiers",
      isActive: true,
    },
  });
  console.log("Created admin user:", admin.email);

  // Create sample seller
  const sellerPassword = await bcrypt.hash("seller123", 12);
  const seller = await prisma.user.upsert({
    where: { email: "seller@autoparts.dz" },
    update: {},
    create: {
      email: "seller@autoparts.dz",
      password: sellerPassword,
      name: "Ahmed Benali",
      role: "SELLER",
      phone: "+213 555 000 002",
      city: "Algiers",
      isActive: true,
      sellerProfile: {
        create: {
          shopName: "Benali Auto Parts",
          shopNameAr: "قطع غيار بن علي",
          description: "Quality auto parts for all car brands",
          descriptionAr: "قطع غيار عالية الجودة لجميع ماركات السيارات",
          location: "Rue Didouche Mourad, Algiers",
          isVerified: true,
        },
      },
    },
  });
  console.log("Created seller user:", seller.email);

  // Create second seller
  const seller2Password = await bcrypt.hash("seller123", 12);
  const seller2 = await prisma.user.upsert({
    where: { email: "seller2@autoparts.dz" },
    update: {},
    create: {
      email: "seller2@autoparts.dz",
      password: seller2Password,
      name: "Karim Hadj",
      role: "SELLER",
      phone: "+213 555 000 003",
      city: "Oran",
      isActive: true,
      sellerProfile: {
        create: {
          shopName: "Hadj Motors",
          shopNameAr: "حاج موتورز",
          description: "Specialized in European car parts",
          descriptionAr: "متخصصون في قطع غيار السيارات الأوروبية",
          location: "Boulevard de l'ALN, Oran",
          isVerified: true,
        },
      },
    },
  });
  console.log("Created seller2 user:", seller2.email);

  // Create sample customer
  const customerPassword = await bcrypt.hash("customer123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "customer@autoparts.dz" },
    update: {},
    create: {
      email: "customer@autoparts.dz",
      password: customerPassword,
      name: "Youcef Mebarki",
      role: "CUSTOMER",
      phone: "+213 555 000 004",
      city: "Constantine",
      address: "Cité des 500 logements, Constantine",
      isActive: true,
    },
  });
  console.log("Created customer user:", customer.email);

  // Create sample products
  const sampleProducts = [
    {
      name: "Oil Filter - Peugeot 208",
      nameAr: "فلتر زيت - بيجو 208",
      description: "High quality oil filter compatible with Peugeot 208 (2012-2023)",
      descriptionAr: "فلتر زيت عالي الجودة متوافق مع بيجو 208 (2012-2023)",
      price: 1500,
      stock: 25,
      categoryId: categories[5].id, // Filters
      carMake: "Peugeot",
      carModel: "208",
      carYear: "2012-2023",
      sellerId: seller.id,
    },
    {
      name: "Front Brake Pads - Toyota Corolla",
      nameAr: "وسائد فرامل أمامية - تويوتا كورولا",
      description: "Premium front brake pad set for Toyota Corolla",
      descriptionAr: "طقم وسائد فرامل أمامية ممتازة لتويوتا كورولا",
      price: 4500,
      stock: 15,
      categoryId: categories[1].id, // Brakes
      carMake: "Toyota",
      carModel: "Corolla",
      carYear: "2015-2023",
      sellerId: seller.id,
    },
    {
      name: "Car Battery 12V 60Ah",
      nameAr: "بطارية سيارة 12 فولت 60 أمبير",
      description: "Maintenance-free car battery suitable for most vehicles",
      descriptionAr: "بطارية سيارة لا تحتاج صيانة مناسبة لمعظم السيارات",
      price: 12000,
      stock: 10,
      categoryId: categories[2].id, // Electrical
      carMake: "Universal",
      sellerId: seller.id,
    },
    {
      name: "Engine Oil 5W-30 4L",
      nameAr: "زيت محرك 5W-30 4 لتر",
      description: "Fully synthetic engine oil 5W-30, 4 liters",
      descriptionAr: "زيت محرك صناعي بالكامل 5W-30، 4 لتر",
      price: 5500,
      stock: 30,
      categoryId: categories[6].id, // Oils
      carMake: "Universal",
      sellerId: seller.id,
    },
    {
      name: "Air Filter - Renault Symbol",
      nameAr: "فلتر هواء - رينو سيمبول",
      description: "Replacement air filter for Renault Symbol",
      descriptionAr: "فلتر هواء بديل لرينو سيمبول",
      price: 2000,
      stock: 20,
      categoryId: categories[5].id, // Filters
      carMake: "Renault",
      carModel: "Symbol",
      carYear: "2008-2020",
      sellerId: seller2.id,
    },
    {
      name: "Headlight Assembly - VW Golf 7",
      nameAr: "مجموعة مصباح أمامي - فولكس واجن جولف 7",
      description: "Left side headlight assembly for Volkswagen Golf 7",
      descriptionAr: "مجموعة مصباح أمامي يساري لفولكس واجن جولف 7",
      price: 25000,
      stock: 5,
      categoryId: categories[2].id, // Electrical
      carMake: "Volkswagen",
      carModel: "Golf",
      carYear: "2013-2020",
      sellerId: seller2.id,
    },
    {
      name: "Shock Absorber Front - Hyundai Accent",
      nameAr: "ممتص صدمات أمامي - هيونداي أكسنت",
      description: "Front shock absorber for Hyundai Accent",
      descriptionAr: "ممتص صدمات أمامي لهيونداي أكسنت",
      price: 8000,
      stock: 8,
      categoryId: categories[4].id, // Suspension
      carMake: "Hyundai",
      carModel: "Accent",
      carYear: "2010-2023",
      sellerId: seller2.id,
    },
    {
      name: "Timing Belt Kit - Peugeot 307",
      nameAr: "طقم سير التوقيت - بيجو 307",
      description: "Complete timing belt kit with water pump for Peugeot 307",
      descriptionAr: "طقم سير توقيت كامل مع مضخة مياه لبيجو 307",
      price: 15000,
      stock: 6,
      categoryId: categories[0].id, // Engine
      carMake: "Peugeot",
      carModel: "307",
      carYear: "2001-2008",
      sellerId: seller.id,
    },
  ];

  for (const product of sampleProducts) {
    await prisma.product.create({
      data: {
        ...product,
        currency: "DZD",
        isAvailable: true,
        images: "[]",
      },
    });
  }

  console.log(`Created ${sampleProducts.length} sample products`);

  console.log("\n--- Seed Complete ---");
  console.log("Admin: admin@autoparts.dz / admin123");
  console.log("Seller: seller@autoparts.dz / seller123");
  console.log("Seller2: seller2@autoparts.dz / seller123");
  console.log("Customer: customer@autoparts.dz / customer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
