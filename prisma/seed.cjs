const { PrismaClient } = require("../src/generated/prisma");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user (VSO)
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@billerica-vso.gov" },
    update: {},
    create: {
      email: "admin@billerica-vso.gov",
      passwordHash: adminPassword,
      role: "admin",
      firstName: "Donnie",
      lastName: "Jarvis",
      phone: "(978) 671-0968",
    },
  });
  console.log(`  Admin user: ${admin.email} (password: admin123)`);

  // Create demo veteran user
  const vetPassword = await bcrypt.hash("veteran123", 12);
  const veteran = await prisma.user.upsert({
    where: { email: "john.veteran@example.com" },
    update: {},
    create: {
      email: "john.veteran@example.com",
      passwordHash: vetPassword,
      role: "veteran",
      firstName: "John",
      lastName: "Martinez",
      phone: "(978) 555-1234",
      address: "123 Main Street",
      city: "Billerica",
      state: "MA",
      zip: "01821",
      branch: "US Army",
      serviceStart: "2005-06-15",
      serviceEnd: "2013-08-20",
      dischargeStatus: "Honorable",
    },
  });
  console.log(`  Veteran user: ${veteran.email} (password: veteran123)`);

  // Create recurring appointment slots (Mon-Fri, every 30 min from 9am-4pm)
  const slotCount = await prisma.appointmentSlot.count();
  if (slotCount === 0) {
    const slots = [];
    for (let day = 1; day <= 5; day++) {
      // Monday through Friday
      for (let hour = 9; hour < 16; hour++) {
        slots.push({
          dayOfWeek: day,
          startTime: `${hour.toString().padStart(2, "0")}:00`,
          endTime: `${hour.toString().padStart(2, "0")}:30`,
          isRecurring: true,
          isBlocked: false,
        });
        if (hour < 15 || day < 5) {
          // Not the last slot on Friday
          slots.push({
            dayOfWeek: day,
            startTime: `${hour.toString().padStart(2, "0")}:30`,
            endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
            isRecurring: true,
            isBlocked: false,
          });
        }
      }
    }

    // Friday afternoon blocked (office closes at 12:30)
    for (let hour = 13; hour < 16; hour++) {
      slots.push({
        dayOfWeek: 5,
        startTime: `${hour.toString().padStart(2, "0")}:00`,
        endTime: `${hour.toString().padStart(2, "0")}:30`,
        isRecurring: true,
        isBlocked: true,
        blockReason: "Office closed Friday afternoons",
      });
    }

    await prisma.appointmentSlot.createMany({ data: slots });
    console.log(`  Created ${slots.length} appointment slots`);
  }

  // Create a sample case
  const caseCount = await prisma.case.count();
  if (caseCount === 0) {
    const sampleCase = await prisma.case.create({
      data: {
        caseNumber: "BVS-2026-A1B2C3",
        veteranId: veteran.id,
        assignedToId: admin.id,
        caseType: "va_disability",
        title: "VA Disability Claim - John Martinez",
        description:
          "Veteran is seeking assistance filing a VA disability compensation claim for service-connected injuries sustained during deployment. Needs help gathering medical records and completing VA Form 21-526EZ.",
        status: "in_progress",
        priority: "high",
      },
    });

    await prisma.caseNote.create({
      data: {
        caseId: sampleCase.id,
        authorId: admin.id,
        content:
          "Initial consultation completed. Veteran has service-connected knee injury and hearing loss. Need to obtain C&P exam records from VA Boston.",
        isInternal: false,
      },
    });

    await prisma.caseNote.create({
      data: {
        caseId: sampleCase.id,
        authorId: admin.id,
        content:
          "Called VA Boston to request records. Expected 2-3 week turnaround. Follow up by end of month.",
        isInternal: true,
      },
    });

    console.log(`  Created sample case: ${sampleCase.caseNumber}`);

    // Create a second case
    await prisma.case.create({
      data: {
        caseNumber: "BVS-2026-D4E5F6",
        veteranId: veteran.id,
        assignedToId: admin.id,
        caseType: "property_tax_abatement",
        title: "Property Tax Abatement - John Martinez",
        description:
          "Veteran is requesting property tax abatement under MGL Chapter 59, Section 5. Currently rated at 30% disability by the VA. Needs to submit VA rating letter and property assessment.",
        status: "pending_documents",
        priority: "normal",
      },
    });

    console.log("  Created property tax abatement case");
  }

  console.log("\nSeeding complete!");
  console.log("\n--- LOGIN CREDENTIALS ---");
  console.log("Admin:   admin@billerica-vso.gov / admin123");
  console.log("Veteran: john.veteran@example.com / veteran123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
