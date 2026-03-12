import nodemailer from "nodemailer";

// Email config from environment variables
// For production, set these in .env:
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=587
//   SMTP_USER=vso@billerica.gov
//   SMTP_PASS=app-password-here
//   VSO_EMAIL=donnie.jarvis@billerica.gov
//   PORTAL_URL=https://veterans.billerica.gov

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

const FROM_ADDRESS = process.env.SMTP_FROM || "Billerica Veterans Portal <noreply@billerica-vso.gov>";
const VSO_EMAIL = process.env.VSO_EMAIL || "vso@billerica.gov";
const PORTAL_URL = process.env.PORTAL_URL || "http://localhost:3000";

/**
 * Check if email is configured
 */
export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

/**
 * Notify the VSO about a new form submission
 */
export async function notifyVSONewSubmission(opts: {
  veteranName: string;
  veteranEmail: string;
  formName: string;
  caseNumber: string;
  caseId: string;
  serviceType: string;
  submittedAt: Date;
  pdfBuffer?: Uint8Array;
}) {
  if (!isEmailConfigured()) {
    console.log("[Email] SMTP not configured — skipping VSO notification");
    console.log(`[Email] Would have notified: New ${opts.formName} from ${opts.veteranName} (Case: ${opts.caseNumber})`);
    return;
  }

  const attachments: nodemailer.SendMailOptions["attachments"] = [];
  if (opts.pdfBuffer) {
    attachments.push({
      filename: `${opts.caseNumber}-${slugify(opts.formName)}.pdf`,
      content: Buffer.from(opts.pdfBuffer),
      contentType: "application/pdf",
    });
  }

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to: VSO_EMAIL,
    subject: `[New Submission] ${opts.formName} — ${opts.veteranName} (${opts.caseNumber})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Billerica Veterans Service Portal</h2>
          <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.8;">New Form Submission</p>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
          <h3 style="color: #1e3a5f; margin-top: 0;">📋 ${opts.formName}</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 140px;">Veteran:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${opts.veteranName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${opts.veteranEmail}">${opts.veteranEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Case Number:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><code>${opts.caseNumber}</code></td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Service Type:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatServiceType(opts.serviceType)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Submitted:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${opts.submittedAt.toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}</td>
            </tr>
          </table>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${PORTAL_URL}/admin/cases/${opts.caseId}" 
               style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Case in Portal
            </a>
          </div>

          ${opts.pdfBuffer ? '<p style="color: #666; font-size: 13px;">📎 The completed form PDF is attached to this email.</p>' : ""}
        </div>

        <div style="background: #f5f5f5; padding: 12px 20px; text-align: center; font-size: 11px; color: #999;">
          Billerica Veterans Services — 365 Boston Rd, Billerica, MA 01821 — (978) 671-0968
        </div>
      </div>
    `,
    attachments,
  });

  console.log(`[Email] VSO notified: New ${opts.formName} from ${opts.veteranName}`);
}

/**
 * Send confirmation to the veteran who submitted the form
 */
export async function notifyVeteranSubmissionConfirmation(opts: {
  veteranName: string;
  veteranEmail: string;
  formName: string;
  caseNumber: string;
  pdfBuffer?: Uint8Array;
}) {
  if (!isEmailConfigured()) {
    console.log("[Email] SMTP not configured — skipping veteran confirmation");
    return;
  }

  const attachments: nodemailer.SendMailOptions["attachments"] = [];
  if (opts.pdfBuffer) {
    attachments.push({
      filename: `${opts.caseNumber}-${slugify(opts.formName)}.pdf`,
      content: Buffer.from(opts.pdfBuffer),
      contentType: "application/pdf",
    });
  }

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to: opts.veteranEmail,
    subject: `Submission Received: ${opts.formName} (${opts.caseNumber})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Billerica Veterans Service Portal</h2>
          <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.8;">Submission Confirmation</p>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
          <p>Dear ${opts.veteranName},</p>
          
          <p>Your <strong>${opts.formName}</strong> has been successfully submitted and received by the Billerica Veterans Service Office.</p>
          
          <div style="background: #f0f7ff; border: 1px solid #c0d8f0; border-radius: 6px; padding: 15px; margin: 15px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Case Number:</strong> <code>${opts.caseNumber}</code></p>
            <p style="margin: 8px 0 0; font-size: 13px; color: #555;">Save this number for your records. You can use it to track the status of your submission.</p>
          </div>

          <h4 style="color: #1e3a5f;">What Happens Next?</h4>
          <ol style="color: #444; line-height: 1.8;">
            <li>The Veterans Service Officer will review your submission</li>
            <li>You may be contacted for additional information or documents</li>
            <li>The VSO will prepare and file the official form(s) on your behalf</li>
            <li>You'll receive updates on your case status</li>
          </ol>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${PORTAL_URL}/status" 
               style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Track Your Case
            </a>
          </div>

          ${opts.pdfBuffer ? '<p style="color: #666; font-size: 13px;">📎 A copy of your submitted form is attached for your records.</p>' : ""}

          <p style="color: #666; font-size: 13px; margin-top: 20px;">
            If you have questions, contact the Veterans Service Office at (978) 671-0968 or 
            <a href="mailto:vso@billerica.gov">vso@billerica.gov</a>.
          </p>
        </div>

        <div style="background: #f5f5f5; padding: 12px 20px; text-align: center; font-size: 11px; color: #999;">
          Billerica Veterans Services — 365 Boston Rd, Billerica, MA 01821 — (978) 671-0968
        </div>
      </div>
    `,
    attachments,
  });

  console.log(`[Email] Confirmation sent to ${opts.veteranEmail}`);
}

function formatServiceType(type: string): string {
  const labels: Record<string, string> = {
    va_disability: "VA Disability Compensation",
    property_tax_abatement: "Property Tax Abatement",
    pension: "Chapter 115 Benefits",
    burial: "Burial Benefits",
  };
  return labels[type] || type;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
