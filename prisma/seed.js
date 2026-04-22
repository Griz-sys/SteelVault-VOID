import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TOTAL_FAKE_USERS = 25; // 🔁 change between 10–50
const TOTAL_PROJECTS = 6;

async function main() {
  // --- Clear tables ---
  await prisma.documentLog.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.client.deleteMany();

  // -------------------------
  // Create Client
  // -------------------------
  const client = await prisma.client.create({
    data: {
      name: "Steel Vault Industries",
      email: "contact@example.com",
      companyName: "Steel Vault Pvt Ltd",
      contactNo: "9999999999",
      address: "Faridabad, Haryana",
      configuration: {},
      ccListData: [],
      folderStructure: {},
    },
  });

  // -------------------------
  // Create Admin
  // -------------------------
  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@example.com",
      password: "12345",
      userType: "ADMIN",
      department: "Administration",
      designation: "Admin",
      empId: "ADMIN001",
      clientId: client.id,
      isRelieved: false,
    },
  });

  // -------------------------
  // Create Team Lead
  // -------------------------
  const teamLead = await prisma.user.create({
    data: {
      name: "Amit Sharma",
      email: "amit.sharma@example.com",
      password: "12345",
      userType: "EMPLOYEE",
      department: "Engineering",
      designation: "Team Lead",
      empId: "TL001",
      clientId: client.id,
      isRelieved: false,
    },
  });

  // -------------------------
  // Create Fake Employees
  // -------------------------
  const fakeUsers = [];

  for (let i = 1; i <= TOTAL_FAKE_USERS; i++) {
    fakeUsers.push({
      name: `Employee ${i}`,
      email: `employee${i}@example.com`,
      password: "12345",
      userType: "EMPLOYEE",
      department: i % 2 === 0 ? "Design" : "Planning",
      designation: "Engineer",
      empId: `EMP${100 + i}`,
      clientId: client.id,
      isRelieved: false,
    });
  }

  await prisma.user.createMany({ data: fakeUsers });

  // -------------------------
  // Create Multiple Projects
  // -------------------------
  const projects = [];

  for (let i = 1; i <= TOTAL_PROJECTS; i++) {
    projects.push({
      projectNo: `PRJ-${i.toString().padStart(3, "0")}`,
      solProjectNo: `SOL-${1000 + i}`,
      name: `Project ${i}`,
      description: `Auto-generated project ${i}`,
      clientId: client.id,
      solTLId: teamLead.id,
      status: i % 2 === 0 ? "IN_PROGRESS" : "PLANNING",
      priority: i % 3 === 0 ? "HIGH" : "MEDIUM",
      progress: i % 2 === 0 ? 30 + i * 5 : 0,
      branch: "Delhi",
      projectComplexity: "MEDIUM",
      projectType: "Infrastructure",
      projectSubType: "Industrial",
      projectDataFolder: `/projects/project-${i}`,
    });
  }

  await prisma.project.createMany({ data: projects });

  console.log("🌱 Database seeded successfully!");
  console.log(`👥 Users created: ${TOTAL_FAKE_USERS + 2}`);
  console.log(`📁 Projects created: ${TOTAL_PROJECTS}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
