import { Flag, Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-accent rounded-full p-1.5">
                <Flag className="w-5 h-5 text-primary-dark" />
              </div>
              <span className="font-bold text-lg">Billerica Veterans</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Serving those who served. The Billerica Department of Veterans
              Services is your one-stop shop for all veteran benefits and
              assistance.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-accent mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm text-blue-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>365 Boston Road, Office #201<br />Billerica, MA 01821</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:978-671-0968" className="hover:text-white transition">(978) 671-0968</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:vso@billerica.gov" className="hover:text-white transition">vso@billerica.gov</a>
              </div>
            </div>
          </div>

          {/* Office Hours */}
          <div>
            <h3 className="font-bold text-accent mb-4">Office Hours</h3>
            <div className="space-y-2 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                <div>
                  <div>Monday: 8:00 AM - 6:30 PM</div>
                  <div>Tue-Thu: 8:30 AM - 4:00 PM</div>
                  <div>Friday: 8:00 AM - 12:30 PM</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-accent mb-4">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link href="/services" className="block text-blue-200 hover:text-white transition">Our Services</Link>
              <Link href="/apply" className="block text-blue-200 hover:text-white transition">Apply for Benefits</Link>
              <Link href="/appointments" className="block text-blue-200 hover:text-white transition">Schedule Appointment</Link>
              <a href="https://www.va.gov/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-200 hover:text-white transition">
                U.S. Dept. of Veterans Affairs <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://www.mass.gov/orgs/department-of-veterans-services" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-200 hover:text-white transition">
                MA Veterans Services <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm text-blue-300">
          <p>&copy; {new Date().getFullYear()} Town of Billerica, MA — Veterans Services Portal</p>
          <p className="mt-1 text-xs text-blue-400">
            Director: Donnie Jarvis | Head Clerk: Christina Byron
          </p>
        </div>
      </div>
    </footer>
  );
}
