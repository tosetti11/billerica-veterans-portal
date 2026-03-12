import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hash } from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "..", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create admin user (VSO)  
  const adminPassword = await hash("admin123", 12);
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
  const vetPassword = await hash("veteran123", 12);
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

  // Create recurring appointment slots (Mon-Thu every 30 min from 9am-4pm, Fri 9am-12:30pm)
  const slotCount = await prisma.appointmentSlot.count();
  if (slotCount === 0) {
    const slots: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isRecurring: boolean;
      isBlocked: boolean;
      blockReason?: string;
    }[] = [];

    for (let day = 1; day <= 4; day++) {
      for (let hour = 9; hour < 16; hour++) {
        slots.push({
          dayOfWeek: day,
          startTime: `${hour.toString().padStart(2, "0")}:00`,
          endTime: `${hour.toString().padStart(2, "0")}:30`,
          isRecurring: true,
          isBlocked: false,
        });
        slots.push({
          dayOfWeek: day,
          startTime: `${hour.toString().padStart(2, "0")}:30`,
          endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
          isRecurring: true,
          isBlocked: false,
        });
      }
    }

    // Friday 9am-12:30pm only
    for (let hour = 9; hour < 12; hour++) {
      slots.push({
        dayOfWeek: 5,
        startTime: `${hour.toString().padStart(2, "0")}:00`,
        endTime: `${hour.toString().padStart(2, "0")}:30`,
        isRecurring: true,
        isBlocked: false,
      });
      slots.push({
        dayOfWeek: 5,
        startTime: `${hour.toString().padStart(2, "0")}:30`,
        endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
        isRecurring: true,
        isBlocked: false,
      });
    }
    slots.push({
      dayOfWeek: 5,
      startTime: "12:00",
      endTime: "12:30",
      isRecurring: true,
      isBlocked: false,
    });

    await prisma.appointmentSlot.createMany({ data: slots });
    console.log(`  Created ${slots.length} appointment slots`);
  }

  // Create sample cases
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

    await prisma.case.create({
      data: {
        caseNumber: "BVS-2026-D4E5F6",
        veteranId: veteran.id,
        assignedToId: admin.id,
        caseType: "property_tax_abatement",
        title: "Property Tax Abatement - John Martinez",
        description:
          "Veteran requesting property tax abatement under MGL Chapter 59, Section 5. Currently rated at 30% disability by the VA. Needs to submit VA rating letter and property assessment.",
        status: "pending_documents",
        priority: "normal",
      },
    });

    console.log("  Created property tax abatement case");
  }

  // Create form templates
  const formCount = await prisma.formTemplate.count();
  if (formCount === 0) {
    await prisma.formTemplate.create({
      data: {
        name: "VA Disability Claim Intake",
        slug: "va-disability-intake",
        description: "Initial intake form for VA disability compensation claims. Complete this form to begin the process.",
        serviceType: "va_disability",
        fields: JSON.stringify([
          { name: "fullName", label: "Full Legal Name", type: "text", required: true },
          { name: "ssn_last4", label: "Last 4 of SSN", type: "text", required: true, maxLength: 4 },
          { name: "dob", label: "Date of Birth", type: "date", required: true },
          { name: "branch", label: "Branch of Service", type: "select", required: true, options: ["US Army", "US Navy", "US Air Force", "US Marine Corps", "US Coast Guard", "US Space Force"] },
          { name: "serviceStart", label: "Service Start Date", type: "date", required: true },
          { name: "serviceEnd", label: "Service End Date", type: "date", required: true },
          { name: "dischargeType", label: "Type of Discharge", type: "select", required: true, options: ["Honorable", "General (Under Honorable Conditions)", "Other Than Honorable", "Bad Conduct", "Dishonorable"] },
          { name: "currentVaRating", label: "Current VA Disability Rating (%)", type: "number", required: false },
          { name: "conditions", label: "Service-Connected Conditions (describe each)", type: "textarea", required: true },
          { name: "treatmentHistory", label: "Treatment History (VA and civilian)", type: "textarea", required: false },
          { name: "hasDd214", label: "Do you have a copy of your DD-214?", type: "select", required: true, options: ["Yes", "No - Need assistance obtaining"] },
          { name: "hasVaRecords", label: "Do you have VA medical records?", type: "select", required: true, options: ["Yes", "No", "Some"] },
          { name: "additionalInfo", label: "Additional Information", type: "textarea", required: false },
        ]),
        isActive: true,
      },
    });

    await prisma.formTemplate.create({
      data: {
        name: "Property Tax Abatement Application",
        slug: "property-tax-abatement",
        description: "Application for property tax abatement under Massachusetts General Laws Chapter 59, Section 5.",
        serviceType: "property_tax_abatement",
        fields: JSON.stringify([
          { name: "fullName", label: "Full Legal Name", type: "text", required: true },
          { name: "address", label: "Property Address", type: "text", required: true },
          { name: "parcelId", label: "Parcel ID / Map-Lot", type: "text", required: false },
          { name: "ownershipDate", label: "Date of Ownership", type: "date", required: true },
          { name: "vaRating", label: "VA Disability Rating (%)", type: "number", required: true },
          { name: "ratingDate", label: "Date of VA Rating Decision", type: "date", required: true },
          { name: "currentTaxBill", label: "Current Annual Tax Amount ($)", type: "number", required: true },
          { name: "exemptionType", label: "Exemption Clause Requested", type: "select", required: true, options: ["Clause 22 (10% or more disabled)", "Clause 22A (Specially adapted housing)", "Clause 22B (Surviving spouse)", "Clause 22C (Paraplegic veteran)", "Clause 22E (100% disabled or unemployable)"] },
          { name: "previouslyApplied", label: "Have you previously applied for this exemption?", type: "select", required: true, options: ["Yes", "No"] },
          { name: "spouseName", label: "Spouse Name (if applicable)", type: "text", required: false },
          { name: "additionalInfo", label: "Additional Information", type: "textarea", required: false },
        ]),
        isActive: true,
      },
    });

    await prisma.formTemplate.create({
      data: {
        name: "Chapter 115 Benefits Application",
        slug: "chapter-115-benefits",
        description: "Application for Massachusetts Chapter 115 veterans benefits (financial assistance for eligible veterans).",
        serviceType: "pension",
        fields: JSON.stringify([
          { name: "fullName", label: "Full Legal Name", type: "text", required: true },
          { name: "dob", label: "Date of Birth", type: "date", required: true },
          { name: "address", label: "Current Address", type: "text", required: true },
          { name: "phone", label: "Phone Number", type: "text", required: true },
          { name: "branch", label: "Branch of Service", type: "select", required: true, options: ["US Army", "US Navy", "US Air Force", "US Marine Corps", "US Coast Guard", "US Space Force"] },
          { name: "serviceStart", label: "Service Start Date", type: "date", required: true },
          { name: "serviceEnd", label: "Service End Date", type: "date", required: true },
          { name: "warPeriod", label: "War/Conflict Period", type: "select", required: true, options: ["WWII", "Korea", "Vietnam", "Gulf War", "OEF/OIF/OND (Afghanistan/Iraq)", "Other"] },
          { name: "maritalStatus", label: "Marital Status", type: "select", required: true, options: ["Single", "Married", "Divorced", "Widowed", "Separated"] },
          { name: "dependents", label: "Number of Dependents", type: "number", required: true },
          { name: "monthlyIncome", label: "Total Monthly Household Income ($)", type: "number", required: true },
          { name: "monthlyExpenses", label: "Total Monthly Expenses ($)", type: "number", required: true },
          { name: "currentBenefits", label: "Current Benefits Received (VA, Social Security, etc.)", type: "textarea", required: false },
          { name: "needDescription", label: "Describe Financial Need", type: "textarea", required: true },
          { name: "additionalInfo", label: "Additional Information", type: "textarea", required: false },
        ]),
        isActive: true,
      },
    });

    await prisma.formTemplate.create({
      data: {
        name: "Burial Benefits Request",
        slug: "burial-benefits",
        description: "Request for burial allowance and headstone/marker for deceased veterans.",
        serviceType: "burial",
        fields: JSON.stringify([
          { name: "requestorName", label: "Your Name (Person Filing)", type: "text", required: true },
          { name: "relationship", label: "Relationship to Veteran", type: "select", required: true, options: ["Spouse", "Child", "Parent", "Sibling", "Funeral Director", "Other"] },
          { name: "veteranName", label: "Veteran's Full Legal Name", type: "text", required: true },
          { name: "veteranDob", label: "Veteran's Date of Birth", type: "date", required: true },
          { name: "veteranDod", label: "Veteran's Date of Death", type: "date", required: true },
          { name: "branch", label: "Veteran's Branch of Service", type: "select", required: true, options: ["US Army", "US Navy", "US Air Force", "US Marine Corps", "US Coast Guard", "US Space Force"] },
          { name: "vaClaimNumber", label: "VA Claim/File Number (if known)", type: "text", required: false },
          { name: "burialLocation", label: "Burial Location / Cemetery", type: "text", required: true },
          { name: "headstoneRequest", label: "Requesting Government Headstone/Marker?", type: "select", required: true, options: ["Yes", "No"] },
          { name: "flagFolding", label: "Requesting Flag for Casket?", type: "select", required: true, options: ["Yes", "No"] },
          { name: "additionalInfo", label: "Additional Information", type: "textarea", required: false },
        ]),
        isActive: true,
      },
    });

    console.log("  Created 4 form templates");
  }

  console.log("\nSeeding complete!");
  console.log("\n--- LOGIN CREDENTIALS ---");
  console.log("Admin:   admin@billerica-vso.gov / admin123");
  console.log("Veteran: john.veteran@example.com / veteran123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
