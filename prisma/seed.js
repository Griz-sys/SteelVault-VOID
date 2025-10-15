// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ---- Clients ----
  const client1 = await prisma.client.upsert({
    where: { email: "client1@example.com" },
    update: {},
    create: {
      name: "ABC Constructions",
      email: "client1@example.com",
      companyName: "ABC Constructions Ltd.",
      contactNo: "9876543210",
      address: "123, Main Street, Delhi",
      totalProjects: 2,
      activeProjects: 1,
      completedProjects: 1,
      totalProjectValue: 5000000.00,
      totalWeightage: 1000.50,
    },
  });

  // ---- Users ----
  const user1 = await prisma.user.upsert({
    where: { email: "tl1@example.com" },
    update: {},
    create: {
      name: "Rohit Sharma",
      email: "tl1@example.com",
      password: "hashedpassword123",
      userType: "TEAM_LEAD",
      clientId: client1.id,
      contactNo: "9876500000",
      address: "Mumbai, India",
      gender: "Male",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "eng1@example.com" },
    update: {},
    create: {
      name: "Priya Verma",
      email: "eng1@example.com",
      password: "hashedpassword456",
      userType: "ENGINEER",
      clientId: client1.id,
      contactNo: "9876511111",
      address: "Delhi, India",
      gender: "Female",
    },
  });

  // ---- Projects ----
  const project1 = await prisma.project.upsert({
    where: { projectNo: "P001" },
    update: {},
    create: {
      projectNo: "P001",
      solProjectNo: "SOL-1001",
      name: "Metro Expansion",
      description: "Underground metro expansion project",
      clientId: client1.id,
      solTLId: user1.id,
      status: "IN_PROGRESS",
      priority: "HIGH",
      progress: 25.5,
      branch: "Delhi",
      startDate: new Date("2025-01-15"),
      expectedCompletion: new Date("2026-01-15"),
      totalDays: 365,
      totalProjectHours: "1200",
      projectComplexity: "COMPLEX",
      solJobNo: "SJ-2025-01",
      projectDataFolder: "/projects/metro-expansion",
    },
  });

  const project2 = await prisma.project.upsert({
    where: { projectNo: "P002" },
    update: {},
    create: {
      projectNo: "P002",
      solProjectNo: "SOL-1002",
      name: "Mall Construction",
      description: "Commercial mall construction project",
      clientId: client1.id,
      solTLId: user1.id,
      status: "PLANNING",
      priority: "MEDIUM",
      progress: 0.0,
      branch: "Gurgaon",
      startDate: new Date("2025-02-01"),
      expectedCompletion: new Date("2026-03-01"),
      totalDays: 395,
      projectComplexity: "MEDIUM",
      solJobNo: "SJ-2025-02",
      projectDataFolder: "/projects/mall-construction",
    },
  });

  // ---- Document Logs ----
  await prisma.documentLog.createMany({
    data: [
      {
        fileName: "metro_plan.pdf",
        clientId: client1.id,
        projectId: project1.id,
        storagePath: "/docs/metro_plan.pdf",
        size: 2048,
        logType: "PLAN",
      },
      {
        fileName: "mall_blueprint.dwg",
        clientId: client1.id,
        projectId: project2.id,
        storagePath: "/docs/mall_blueprint.dwg",
        size: 5096,
        logType: "BLUEPRINT",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
