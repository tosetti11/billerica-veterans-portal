const fs = require('fs');
const path = require('path');

function writeFile(filePath, content) {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Wrote:', filePath);
}

// ===== SERVICES PAGE =====
writeFile('src/app/services/page.tsx', `"use client";

import Link from "next/link";
import {
  DollarSign,
  Home,
  Car,
  Heart,
  FileText,
  Shield,
  Award,
  Users,
  Briefcase,
  GraduationCap,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Scale,
} from "lucide-react";

const services = [
  {
    id: "chapter-115",
    title: "Chapter 115 Financial Assistance",
    description:
      "Financial assistance for eligible veterans, dependents, and widows under Massachusetts General Law Chapter 115. Covers needs-based benefits including housing, food, medical, and other essential expenses.",
    icon: DollarSign,
    color: "bg-emerald-500",
    eligibility: ["Billerica resident", "Honorable discharge", "Financial need demonstrated"],
    documents: ["DD-214", "Proof of residency", "Income documentation", "Bank statements"],
    externalLink: "https://cdn5-hosted.civiclive.com/UserFiles/Servers/Server_15207780/File/VS%201.pdf",
    applyOnline: true,
  },
  {
    id: "property-tax",
    title: "Property Tax Abatements",
    description:
      "Property tax exemptions for qualifying veterans. Various clauses provide different levels of tax reduction based on disability rating, service period, and other factors.",
    icon: Home,
    color: "bg-blue-500",
    eligibility: ["Property owner in Billerica", "Qualifying veteran status", "Meets specific clause requirements"],
    documents: ["DD-214", "VA disability letter", "Property tax bill", "Proof of ownership"],
    externalLink: "https://www.sec.state.ma.us/cis/cisvet/vetprptax.htm",
    applyOnline: true,
  },
  {
    id: "va-disability",
    title: "VA Disability Claims",
    description:
      "Guidance and assistance with filing VA disability compensation claims. Our Veterans Service Officers help you navigate the claims process from start to finish.",
    icon: Shield,
    color: "bg-purple-500",
    eligibility: ["Active duty service", "Service-connected disability or illness"],
    documents: ["DD-214", "Medical records", "Service treatment records", "Buddy statements"],
    externalLink: "https://www.va.gov/disability/",
    applyOnline: true,
  },
  {
    id: "welcome-home",
    title: "Welcome Home Bonus",
    description:
      "Massachusetts Welcome Home Bonus for veterans returning from qualifying deployments. One-time cash bonus for eligible service members.",
    icon: Award,
    color: "bg-amber-500",
    eligibility: ["Massachusetts resident", "Served in qualifying conflict", "Honorable discharge"],
    documents: ["DD-214", "Proof of MA residency", "Deployment orders"],
    externalLink: "https://www.mass.gov/orgs/veterans-bonus-division",
    applyOnline: true,
  },
  {
    id: "burial",
    title: "Burial Benefits",
    description:
      "Assistance with veteran burial benefits including headstones, markers, burial flags, and burial allowances. We help families navigate this process during difficult times.",
    icon: Heart,
    color: "bg-rose-500",
    eligibility: ["Veteran or eligible dependent", "Honorable or general discharge"],
    documents: ["DD-214", "Death certificate", "Burial expenses"],
    externalLink: "https://www.sec.state.ma.us/cis/cisvet/vetburia.htm",
    applyOnline: true,
  },
  {
    id: "license-plates",
    title: "Veterans License Plates",
    description:
      "Assistance obtaining special veteran license plates from the Massachusetts RMV. Multiple plate types available based on service and disability status.",
    icon: Car,
    color: "bg-cyan-500",
    eligibility: ["Massachusetts licensed driver", "Qualifying veteran status"],
    documents: ["DD-214", "MA driver license", "Current registration"],
    externalLink: "https://www.mass.gov/service-details/veteran-and-military-license-plates",
    applyOnline: false,
  },
  {
    id: "annuities",
    title: "Veteran Annuities",
    description:
      "Annual annuity payments for 100% service-connected disabled veterans, Gold Star Spouses, and Gold Star Parents. Ongoing financial support from the Commonwealth.",
    icon: DollarSign,
    color: "bg-indigo-500",
    eligibility: ["100% service-connected disability", "Gold Star Spouse/Parent"],
    documents: ["DD-214", "VA 100% disability letter", "Gold Star documentation"],
    externalLink: "https://www.mass.gov/service-details/veteran-annuity-payment",
    applyOnline: true,
  },
  {
    id: "service-records",
    title: "Service Record Corrections",
    description:
      "Help with obtaining, correcting, or replacing military service records. Assistance with DD-214 requests and corrections through the National Archives.",
    icon: FileText,
    color: "bg-teal-500",
    eligibility: ["Current/former service member", "Authorized next of kin"],
    documents: ["Identification", "Authorization form (SF-180)", "Supporting evidence"],
    externalLink: "https://www.archives.gov/veterans/military-service-records",
    applyOnline: false,
  },
  {
    id: "counseling",
    title: "Counseling & Referrals",
    description:
      "Confidential counseling and referrals to professional services. We connect veterans with mental health resources, substance abuse programs, and support groups.",
    icon: Users,
    color: "bg-pink-500",
    eligibility: ["Any veteran or family member"],
    documents: ["No documents required for initial consultation"],
    externalLink: null,
    applyOnline: false,
  },
  {
    id: "employment",
    title: "Employment Assistance",
    description:
      "Help with job placement, resume assistance, and career counseling. Connect with employers who value veteran skills and experience.",
    icon: Briefcase,
    color: "bg-orange-500",
    eligibility: ["Any veteran seeking employment"],
    documents: ["DD-214", "Resume (if available)"],
    externalLink: null,
    applyOnline: false,
  },
  {
    id: "education",
    title: "Education Benefits",
    description:
      "Guidance on GI Bill benefits, state education programs, and scholarship opportunities. We help you maximize your education benefits.",
    icon: GraduationCap,
    color: "bg-violet-500",
    eligibility: ["Qualifying service period", "Eligible dependent"],
    documents: ["DD-214", "Certificate of eligibility"],
    externalLink: null,
    applyOnline: false,
  },
  {
    id: "legal",
    title: "Legal Resource Referrals",
    description:
      "Connections to legal assistance for veterans including disability appeals, landlord/tenant issues, family law, and other legal matters.",
    icon: Scale,
    color: "bg-slate-500",
    eligibility: ["Any veteran or family member"],
    documents: ["Varies by legal issue"],
    externalLink: null,
    applyOnline: false,
  },
];

export default function ServicesPage() {
  return (
    <div className="fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-6 h-6 text-accent" />
            <span className="text-accent font-medium">Service Catalog</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Veterans Services
          </h1>
          <p className="text-blue-100 max-w-2xl">
            Comprehensive services for Billerica veterans and their families.
            The Town funds 25% of Veterans benefits, with 75% reimbursed by the state.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={\`\${service.color} w-12 h-12 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform\`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary">
                      {service.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-muted mb-4 leading-relaxed">
                  {service.description}
                </p>

                {/* Eligibility */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold uppercase text-muted mb-2">
                    Eligibility
                  </h4>
                  <ul className="space-y-1">
                    {service.eligibility.map((req, i) => (
                      <li
                        key={i}
                        className="text-xs text-muted flex items-start gap-1.5"
                      >
                        <span className="text-success mt-0.5">&#10003;</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-4 border-t border-border">
                  {service.applyOnline && (
                    <Link
                      href={\`/apply?service=\${service.id}\`}
                      className="flex-1 text-center bg-primary text-white text-sm py-2 rounded-lg hover:bg-primary-light transition font-medium"
                    >
                      Apply Online
                    </Link>
                  )}
                  {service.externalLink && (
                    <a
                      href={service.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 px-3 py-2 border border-border rounded-lg text-sm text-muted hover:text-primary hover:border-primary/30 transition"
                    >
                      Info <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {!service.applyOnline && (
                    <Link
                      href="/appointments"
                      className="flex-1 text-center border border-primary text-primary text-sm py-2 rounded-lg hover:bg-primary hover:text-white transition font-medium"
                    >
                      Schedule Consultation
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-primary/5 border border-primary/10 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold text-primary mb-3">
            Not sure which service you need?
          </h3>
          <p className="text-muted mb-6 max-w-xl mx-auto">
            Our Veterans Service Officers are here to help. Schedule a
            consultation and we will guide you through all available benefits.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/appointments"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-light transition font-medium"
            >
              Schedule Consultation <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="tel:978-671-0968"
              className="inline-flex items-center gap-2 border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary hover:text-white transition font-medium"
            >
              Call (978) 671-0968
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
`);

console.log('Services page done');
