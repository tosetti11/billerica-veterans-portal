import { PDFDocument, PDFTextField, PDFCheckBox } from "pdf-lib";
import fs from "fs";
import path from "path";

/**
 * PDF Form Filler — fills the actual official VA/MA PDF forms
 * with data submitted by veterans through the web portal.
 *
 * Supported forms:
 *   - VS-1: Chapter 115 Benefits Application (MA)
 *   - MA Form 96: Property Tax Exemption for Veterans
 *   - VA Form 21-526EZ: Disability Compensation
 *   - VA Form 21P-530EZ: Burial Benefits
 */

// Map service types to their PDF template files
const PDF_TEMPLATES: Record<string, string> = {
  pension: "VS-1-chapter-115.pdf",
  property_tax_abatement: "MA-Form-96-property-tax.pdf",
  va_disability: "VBA-21-526EZ-ARE.pdf",
  burial: "VBA-21P-530EZ-ARE.pdf",
};

function getFormsDir(): string {
  return path.join(process.cwd(), "public", "forms");
}

// ─── Helper: safely set a text field ──────────────────────────────────
function setTextField(form: ReturnType<PDFDocument["getForm"]>, fieldName: string, value: string | undefined) {
  if (!value) return;
  try {
    const field = form.getField(fieldName);
    if (field instanceof PDFTextField) {
      field.setText(value);
    }
  } catch {
    // Field not found in PDF — skip silently
  }
}

function setCheckBox(form: ReturnType<PDFDocument["getForm"]>, fieldName: string, checked: boolean) {
  try {
    const field = form.getField(fieldName);
    if (field instanceof PDFCheckBox) {
      if (checked) field.check();
      else field.uncheck();
    }
  } catch {
    // Field not found — skip
  }
}

// ─── Helper: parse date string → { month, day, year } ────────────────
function parseDate(dateStr: string | undefined): { month: string; day: string; year: string } | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return {
    month: String(d.getMonth() + 1).padStart(2, "0"),
    day: String(d.getDate()).padStart(2, "0"),
    year: String(d.getFullYear()),
  };
}

// ─── Helper: split full name → first, middle, last ────────────────────
function splitName(fullName: string): { first: string; middle: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], middle: "", last: "" };
  if (parts.length === 2) return { first: parts[0], middle: "", last: parts[1] };
  return { first: parts[0], middle: parts[1], last: parts.slice(2).join(" ") };
}

// ─── Helper: split SSN parts ──────────────────────────────────────────
function splitSSN(ssn: string | undefined): { first3: string; mid2: string; last4: string } {
  if (!ssn) return { first3: "", mid2: "", last4: "" };
  const digits = ssn.replace(/\D/g, "");
  if (digits.length === 4) return { first3: "", mid2: "", last4: digits };
  return { first3: digits.slice(0, 3), mid2: digits.slice(3, 5), last4: digits.slice(5, 9) };
}

// ─── Helper: split phone ──────────────────────────────────────────────
function splitPhone(phone: string | undefined): { area: string; mid3: string; last4: string } {
  if (!phone) return { area: "", mid3: "", last4: "" };
  const digits = phone.replace(/\D/g, "");
  const d = digits.length === 11 && digits[0] === "1" ? digits.slice(1) : digits;
  return { area: d.slice(0, 3), mid3: d.slice(3, 6), last4: d.slice(6, 10) };
}

// ─── Helper: split address ────────────────────────────────────────────
function splitAddress(addr: string | undefined): { street: string; apt: string; city: string; state: string; zip5: string; zip4: string } {
  if (!addr) return { street: "", apt: "", city: "", state: "", zip5: "", zip4: "" };
  const parts = addr.split(",").map(s => s.trim());
  if (parts.length >= 3) {
    const stateZip = parts[parts.length - 1];
    const szMatch = stateZip.match(/([A-Z]{2})\s+(\d{5})(?:-(\d{4}))?/i);
    return {
      street: parts[0],
      apt: parts.length > 3 ? parts[1] : "",
      city: parts[parts.length - 2],
      state: szMatch?.[1] || "",
      zip5: szMatch?.[2] || "",
      zip4: szMatch?.[3] || "",
    };
  }
  return { street: addr, apt: "", city: "", state: "", zip5: "", zip4: "" };
}

// ═══════════════════════════════════════════════════════════════════════
// VS-1: Chapter 115 Benefits Application
// ═══════════════════════════════════════════════════════════════════════
function fillVS1(form: ReturnType<PDFDocument["getForm"]>, data: Record<string, string>) {
  const name = splitName(data.fullName || "");
  const addr = splitAddress(data.address);
  const today = new Date();

  setTextField(form, "Application Date", `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`);
  setTextField(form, "Applicants Name", data.fullName);
  setTextField(form, "Date of Birth", data.dob);
  setTextField(form, "Street Address", addr.street);
  setTextField(form, "City or Town", addr.city || "Billerica");
  setTextField(form, "Social Security Number", data.ssn || data.ssn_last4 || "");
  setTextField(form, "Spouses Name", data.spouseName);
  setTextField(form, "Spouses Social Security Number", data.spouseSSN);

  setTextField(form, "StreetRow1", addr.street);
  setTextField(form, "Apartment NumberRow1", addr.apt);
  setTextField(form, "CityTownRow1", addr.city || "Billerica");
  setTextField(form, "StateRow1", addr.state || "MA");
  setTextField(form, "ZipRow1", addr.zip5);
  setTextField(form, "PhoneRow1", data.phone);

  setTextField(form, "Last NameRow1", name.last);
  setTextField(form, "First NameRow1", name.first);
  setTextField(form, "Middle InitialRow1", name.middle ? name.middle[0] : "");
  setTextField(form, "Date of BirthRow1", data.dob);
  setTextField(form, "Branch of ServiceRow1", data.branch);
  setTextField(form, "Service Date StartRow1", data.serviceStart);
  setTextField(form, "Discharge DateRow1", data.serviceEnd);
  setTextField(form, "GenderRow1", data.gender);
  setTextField(form, "Spoken LanguageRow1", data.spokenLanguage || "English");
  setTextField(form, "Are you a US CitizenRow1", "Yes");

  // Spouse row
  if (data.spouseName) {
    const spouseName = splitName(data.spouseName);
    setTextField(form, "Last NameRow1_2", spouseName.last);
    setTextField(form, "First NameRow1_2", spouseName.first);
    setTextField(form, "Middle InitialRow1_2", spouseName.middle ? spouseName.middle[0] : "");
    setTextField(form, "Date of BirthRow1_2", data.spouseDob);
    setTextField(form, "GenderRow1_2", data.spouseGender);
    setTextField(form, "US CitizemRow1", "Yes");
  }

  setTextField(form, "Last Employer", data.lastEmployer);
  setTextField(form, "Last Employer Community", data.employerCity);
  setTextField(form, "Occupation", data.occupation);
  setTextField(form, "Reason for Ch 115 Application", data.needDescription);
  setTextField(form, "Telephone including Cellular", data.phone);
  setTextField(form, "Does the applicant have medical insurance", data.hasMedicalInsurance);
  setTextField(form, "Company name", data.insuranceCompany);
}

// ═══════════════════════════════════════════════════════════════════════
// MA Form 96: Property Tax Exemption
// ═══════════════════════════════════════════════════════════════════════
function fillForm96(form: ReturnType<PDFDocument["getForm"]>, data: Record<string, string>) {
  const currentYear = new Date().getFullYear();
  const addr = splitAddress(data.address);

  setTextField(form, "Name of City or Town", "Billerica");
  setTextField(form, "FISCAL YEAR", String(currentYear));
  setTextField(form, "Name of Applicant", data.fullName);
  setTextField(form, "Telephone Number", data.phone);
  setTextField(form, "Marital Status", data.maritalStatus);

  setTextField(form, "Legal Residence Domicile on July 1 1", addr.street);
  setTextField(form, "Legal Residence Domicile on July 1 2", addr.apt);
  setTextField(form, "Legal Residence Domicile on July 1 3", addr.city || "Billerica");
  setTextField(form, "Legal Residence Domicile on July 1 4", addr.state || "MA");
  setTextField(form, "Legal Residence Domicile on July 1 5", addr.zip5);

  setTextField(form, "Location of Property", data.address);
  setTextField(form, "Did you own the property on July 1", data.ownedOnJuly1 || "Yes");
  setTextField(form, "Assessed Valuation", data.assessedValue);

  const exemption = data.exemptionType || "";
  setCheckBox(form, "Check Box6", exemption.includes("Clause 22") && !exemption.includes("22A") && !exemption.includes("22B") && !exemption.includes("22C") && !exemption.includes("22E"));
  setCheckBox(form, "Check Box7", exemption.includes("22A"));
  setCheckBox(form, "Check Box8", exemption.includes("22B"));
  setCheckBox(form, "Check Box9", exemption.includes("22C"));
  setCheckBox(form, "Check Box10", exemption.includes("22E"));

  setTextField(form, "Motor Vehicles  Trailers Year Make  Model 1", data.vehicleInfo);
}

// ═══════════════════════════════════════════════════════════════════════
// VA Form 21-526EZ: Disability Compensation
// ═══════════════════════════════════════════════════════════════════════
function fill526EZ(form: ReturnType<PDFDocument["getForm"]>, data: Record<string, string>) {
  const name = splitName(data.fullName || "");
  const ssn = splitSSN(data.ssn || data.ssn_last4);
  const dob = parseDate(data.dob);
  const svcStart = parseDate(data.serviceStart);
  const svcEnd = parseDate(data.serviceEnd);
  const phone = splitPhone(data.phone);
  const addr = splitAddress(data.address);

  setTextField(form, "F[0].Page_10[0].Veteran_Service_Member_First_Name[0]", name.first);
  setTextField(form, "F[0].Page_10[0].Veteran_Service_Member_Last_Name[0]", name.last);
  setTextField(form, "F[0].Page_10[0].Veteran_Service_Member_Middle_Initial[0]", name.middle ? name.middle[0] : "");

  setTextField(form, "F[0].Page_10[0].SocialSecurityNumber_FirstThreeNumbers[0]", ssn.first3);
  setTextField(form, "F[0].Page_10[0].SocialSecurityNumber_SecondTwoNumbers[0]", ssn.mid2);
  setTextField(form, "F[0].Page_10[0].SocialSecurityNumber_LastFourNumbers[0]", ssn.last4);

  if (dob) {
    setTextField(form, "F[0].Page_10[0].Date_Of_Birth_Month[0]", dob.month);
    setTextField(form, "F[0].Page_10[0].Date_Of_Birth_Day[0]", dob.day);
    setTextField(form, "F[0].Page_10[0].Date_Of_Birth_Year[0]", dob.year);
  }

  setTextField(form, "F[0].Page_10[0].CurrentMailingAddress_NumberAndStreet[0]", addr.street);
  setTextField(form, "F[0].Page_10[0].CurrentMailingAddress_ApartmentOrUnitNumber[0]", addr.apt);
  setTextField(form, "F[0].Page_10[0].CurrentMailingAddress_City[0]", addr.city);
  setTextField(form, "F[0].Page_10[0].CurrentMailingAddress_StateOrProvince[0]", addr.state || "MA");
  setTextField(form, "F[0].Page_10[0].CurrentMailingAddress_Country[0]", "USA");
  setTextField(form, "F[0].Page_10[0].CurrentMailingAddress_ZIPOrPostalCode_FirstFiveNumbers[0]", addr.zip5);
  setTextField(form, "F[0].Page_10[0].CurrentMailingAddress_ZIPOrPostalCode_LastFourNumbers[0]", addr.zip4);

  if (svcStart) {
    setTextField(form, "F[0].Page_10[0].Beginning_Date_Month[0]", svcStart.month);
    setTextField(form, "F[0].Page_10[0].Beginning_Date_Day[0]", svcStart.day);
    setTextField(form, "F[0].Page_10[0].Beginning_Date_Year[0]", svcStart.year);
  }
  if (svcEnd) {
    setTextField(form, "F[0].Page_10[0].Ending_Date_Month[0]", svcEnd.month);
    setTextField(form, "F[0].Page_10[0].Ending_Date_Day[0]", svcEnd.day);
    setTextField(form, "F[0].Page_10[0].Ending_Date_Year[0]", svcEnd.year);
  }

  setTextField(form, "F[0].Page_10[0].Daytime_Phone_Number_Area_Code[0]", phone.area);
  setTextField(form, "F[0].Page_10[0].Telephone_Middle_Three_Numbers[0]", phone.mid3);
  setTextField(form, "F[0].Page_10[0].Telephone_Last_Four_Numbers[0]", phone.last4);

  setTextField(form, "F[0].Page_10[0].Email_Address_Optional[0]", data.email);
  setTextField(form, "F[0].Page_10[0].Email_Address_Optional[1]", data.email);
  setTextField(form, "F[0].Page_10[0].VA_File_Number[0]", data.vaFileNumber);

  setCheckBox(form, "F[0].Page_10[0].Standard_Claim_Process[0]", true);

  // Fill disabilities
  const conditions = (data.conditions || "").split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
  for (let i = 0; i < Math.min(conditions.length, 15); i++) {
    setTextField(form, `F[0].#subform[10].CURRENTDISABILITY[${i}]`, conditions[i]);
  }

  // SSN on subsequent pages
  setTextField(form, "F[0].#subform[9].SocialSecurityNumber_FirstThreeNumbers[0]", ssn.first3);
  setTextField(form, "F[0].#subform[9].SocialSecurityNumber_SecondTwoNumbers[0]", ssn.mid2);
  setTextField(form, "F[0].#subform[9].SocialSecurityNumber_LastFourNumbers[0]", ssn.last4);
  setTextField(form, "F[0].#subform[10].SocialSecurityNumber_FirstThreeNumbers[1]", ssn.first3);
  setTextField(form, "F[0].#subform[10].SocialSecurityNumber_SecondTwoNumbers[1]", ssn.mid2);
  setTextField(form, "F[0].#subform[10].SocialSecurityNumber_LastFourNumbers[1]", ssn.last4);
}

// ═══════════════════════════════════════════════════════════════════════
// VA Form 21P-530EZ: Burial Benefits
// ═══════════════════════════════════════════════════════════════════════
function fill530EZ(form: ReturnType<PDFDocument["getForm"]>, data: Record<string, string>) {
  const vetName = splitName(data.veteranName || "");
  const claimantName = splitName(data.requestorName || "");
  const vetDob = parseDate(data.veteranDob);
  const vetDod = parseDate(data.veteranDod);
  const burialDate = parseDate(data.burialDate);
  const ssn = splitSSN(data.veteranSSN || data.vaClaimNumber);
  const phone = splitPhone(data.phone);
  const addr = splitAddress(data.claimantAddress);

  setTextField(form, "form1[0].#subform[107].VeteransFirstName[0]", vetName.first);
  setTextField(form, "form1[0].#subform[107].VeteransMiddleInitial1[0]", vetName.middle ? vetName.middle[0] : "");
  setTextField(form, "form1[0].#subform[107].VeteransLastName[0]", vetName.last);

  setTextField(form, "form1[0].#subform[107].VeteransSocialSecurityNumber_FirstThreeNumbers[0]", ssn.first3);
  setTextField(form, "form1[0].#subform[107].VeteransSocialSecurityNumber_SecondTwoNumbers[0]", ssn.mid2);
  setTextField(form, "form1[0].#subform[107].VeteransSocialSecurityNumber_LastFourNumbers[0]", ssn.last4);

  setTextField(form, "form1[0].#subform[107].VAFileNumber[0]", data.vaClaimNumber);

  if (vetDob) {
    setTextField(form, "form1[0].#subform[107].DateOfBirth_Month[0]", vetDob.month);
    setTextField(form, "form1[0].#subform[107].DateOfBirth_Day[0]", vetDob.day);
    setTextField(form, "form1[0].#subform[107].DateOfBirth_Year[0]", vetDob.year);
  }
  if (vetDod) {
    setTextField(form, "form1[0].#subform[107].DateOfDeath_Month[0]", vetDod.month);
    setTextField(form, "form1[0].#subform[107].DateOfDeath_Day[0]", vetDod.day);
    setTextField(form, "form1[0].#subform[107].DateOfDeath_Year[0]", vetDod.year);
  }
  if (burialDate) {
    setTextField(form, "form1[0].#subform[107].DateOfBurial_Month[0]", burialDate.month);
    setTextField(form, "form1[0].#subform[107].DateOfBurial_Day[0]", burialDate.day);
    setTextField(form, "form1[0].#subform[107].DateOfBurial_Year[0]", burialDate.year);
  }

  setTextField(form, "form1[0].#subform[108].Place_Of_Death[0]", data.placeOfDeath);

  setTextField(form, "form1[0].#subform[107].DATE_ENTERED_SERVICE[0]", data.serviceStart);
  setTextField(form, "form1[0].#subform[107].DATE_SEPARATED_SERVICE[0]", data.serviceEnd);
  setTextField(form, "form1[0].#subform[107].PLACE[0]", data.placeOfEntry);
  setTextField(form, "form1[0].#subform[107].PLACE_SEPARATED[0]", data.placeSeparated);
  setTextField(form, "form1[0].#subform[107].SERVICE_NUMBER[0]", data.serviceNumber);

  setTextField(form, "form1[0].#subform[107].ClaimantsFirstName[0]", claimantName.first);
  setTextField(form, "form1[0].#subform[107].ClaimantsMiddleInitial1[0]", claimantName.middle ? claimantName.middle[0] : "");
  setTextField(form, "form1[0].#subform[107].ClaimantsLastName[0]", claimantName.last);

  const claimantDob = parseDate(data.claimantDob);
  if (claimantDob) {
    setTextField(form, "form1[0].#subform[107].DOBmonth[0]", claimantDob.month);
    setTextField(form, "form1[0].#subform[107].DOBday[0]", claimantDob.day);
    setTextField(form, "form1[0].#subform[107].DOByear[0]", claimantDob.year);
  }

  setTextField(form, "form1[0].#subform[107].CurrentMailingAddress_NumberAndStreet[0]", addr.street);
  setTextField(form, "form1[0].#subform[107].CurrentMailingAddress_ApartmentOrUnitNumber[0]", addr.apt);
  setTextField(form, "form1[0].#subform[107].CurrentMailingAddress_City[0]", addr.city);
  setTextField(form, "form1[0].#subform[107].CurrentMailingAddress_StateOrProvince[0]", addr.state || "MA");
  setTextField(form, "form1[0].#subform[107].CurrentMailingAddress_Country[0]", "USA");
  setTextField(form, "form1[0].#subform[107].CurrentMailingAddress_ZIPOrPostalCode_FirstFiveNumbers[0]", addr.zip5);
  setTextField(form, "form1[0].#subform[107].CurrentMailingAddress_ZIPOrPostalCode_LastFourNumbers[0]", addr.zip4);

  setTextField(form, "form1[0].#subform[107].PreferredE_MailAddress[0]", data.email);
  setTextField(form, "form1[0].#subform[107].PreferredTelephoneNumber_AreaCode[0]", phone.area);
  setTextField(form, "form1[0].#subform[107].PreferredTelephoneNumber_FirstThreeNumbers[0]", phone.mid3);
  setTextField(form, "form1[0].#subform[107].PreferredTelephoneNumber_LastFourNumbers[0]", phone.last4);

  // SSN on pages 2 & 3
  setTextField(form, "form1[0].#subform[108].VeteransSocialSecurityNumber_FirstThreeNumbers[1]", ssn.first3);
  setTextField(form, "form1[0].#subform[108].VeteransSocialSecurityNumber_SecondTwoNumbers[1]", ssn.mid2);
  setTextField(form, "form1[0].#subform[108].VeteransSocialSecurityNumber_LastFourNumbers[1]", ssn.last4);
  setTextField(form, "form1[0].#subform[109].VeteransSocialSecurityNumber_FirstThreeNumbers[2]", ssn.first3);
  setTextField(form, "form1[0].#subform[109].VeteransSocialSecurityNumber_SecondTwoNumbers[2]", ssn.mid2);
  setTextField(form, "form1[0].#subform[109].VeteransSocialSecurityNumber_LastFourNumbers[2]", ssn.last4);

  const today = new Date();
  setTextField(form, "form1[0].#subform[109].DateSigned[0]",
    `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`);
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN EXPORT — Load the real official PDF and fill its fields
// ═══════════════════════════════════════════════════════════════════════
export async function generateFilledPDF(
  templateName: string,
  serviceType: string,
  _fields: { name: string; label: string; type: string; required?: boolean; options?: string[] }[],
  data: Record<string, string>,
  veteranName: string,
  caseNumber: string,
  submittedAt: Date
): Promise<Uint8Array> {
  const pdfFile = PDF_TEMPLATES[serviceType];
  if (!pdfFile) {
    return generateFallbackPDF(templateName, _fields, data, veteranName, caseNumber, submittedAt);
  }

  const pdfPath = path.join(getFormsDir(), pdfFile);
  if (!fs.existsSync(pdfPath)) {
    console.warn(`PDF template not found at ${pdfPath}, falling back to summary PDF`);
    return generateFallbackPDF(templateName, _fields, data, veteranName, caseNumber, submittedAt);
  }

  // Load the real official PDF form
  const existingPdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();

  // Fill based on service type
  switch (serviceType) {
    case "pension":       fillVS1(form, data); break;
    case "property_tax_abatement": fillForm96(form, data); break;
    case "va_disability": fill526EZ(form, data); break;
    case "burial":        fill530EZ(form, data); break;
  }

  // NOTE: Not flattening — VSO can continue editing in Acrobat if needed

  pdfDoc.setTitle(`${templateName} — ${veteranName}`);
  pdfDoc.setAuthor("Billerica Veterans Service Portal");
  pdfDoc.setSubject(`Case: ${caseNumber}`);
  pdfDoc.setCreator("Billerica VSO Portal");

  return pdfDoc.save();
}

// ═══════════════════════════════════════════════════════════════════════
// FALLBACK: For service types without an official PDF template
// ═══════════════════════════════════════════════════════════════════════
async function generateFallbackPDF(
  templateName: string,
  fields: { name: string; label: string; type: string; required?: boolean }[],
  data: Record<string, string>,
  veteranName: string,
  caseNumber: string,
  submittedAt: Date
): Promise<Uint8Array> {
  const { StandardFonts, rgb } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  page.drawText("BILLERICA VETERANS SERVICE PORTAL", { x: margin, y, size: 10, font: boldFont, color: rgb(0, 0.2, 0.5) });
  y -= 18;
  page.drawText(templateName, { x: margin, y, size: 14, font: boldFont });
  y -= 14;
  page.drawText(`Case: ${caseNumber} | Veteran: ${veteranName} | ${submittedAt.toLocaleDateString()}`, {
    x: margin, y, size: 8, font, color: rgb(0.4, 0.4, 0.4),
  });
  y -= 25;
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1, color: rgb(0, 0.2, 0.5) });
  y -= 20;

  for (const field of fields) {
    const value = data[field.name] || "—";
    if (y < margin + 60) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    page.drawText(field.label + ":", { x: margin, y, size: 8, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
    y -= 14;
    page.drawText(value.substring(0, 100), { x: margin + 10, y, size: 10, font });
    y -= 18;
  }

  pdfDoc.setTitle(`${templateName} — ${veteranName}`);
  return pdfDoc.save();
}
