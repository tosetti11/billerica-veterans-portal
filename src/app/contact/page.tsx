'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, ExternalLink, CheckCircle, User, Globe, Building2, Heart, Scale, BookOpen, Briefcase } from 'lucide-react';

const resources = [
  { name: 'U.S. Department of Veterans Affairs', url: 'https://www.va.gov', icon: 'Globe', desc: 'Federal VA benefits, healthcare, and services' },
  { name: 'VA Boston Healthcare System', url: 'https://www.va.gov/boston-health-care', icon: 'Heart', desc: 'Local VA medical center and clinics' },
  { name: 'MA Dept of Veterans Services', url: 'https://www.mass.gov/orgs/department-of-veterans-services', icon: 'Building2', desc: 'State-level veteran programs and benefits' },
  { name: 'Veterans Legal Services', url: 'https://www.veteranslegalservices.org', icon: 'Scale', desc: 'Free legal aid for veterans in Massachusetts' },
  { name: 'New England Center for Homeless Veterans', url: 'https://www.nechv.org', icon: 'Heart', desc: 'Housing and support for homeless veterans' },
  { name: 'Veterans Crisis Line', url: 'https://www.veteranscrisisline.net', icon: 'Phone', desc: 'Call 988, Press 1 - 24/7 crisis support' },
  { name: 'GI Bill Education Benefits', url: 'https://www.va.gov/education', icon: 'BookOpen', desc: 'Education and training benefit information' },
  { name: 'Veteran Employment Services', url: 'https://www.careeronestop.org/Veterans', icon: 'Briefcase', desc: 'Job search and career resources for veterans' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setSubmitted(true);
    } catch {
      alert('Failed to send message. Please try again.');
    }
    setSubmitting(false);
  };

  const update = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact & Resources</h1>
          <p className="text-xl text-blue-100 max-w-3xl">Get in touch with the Billerica Veterans Services office or explore helpful resources.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Office Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-[var(--primary)] mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Donnie Jarvis</p>
                    <p className="text-sm text-gray-500">Veterans Service Officer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[var(--primary)] mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">365 Boston Road</p>
                    <p className="text-sm text-gray-500">Office #201</p>
                    <p className="text-sm text-gray-500">Billerica, MA 01821</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[var(--primary)] mt-0.5" />
                  <div>
                    <a href="tel:978-671-0968" className="font-medium text-[var(--primary)] hover:underline">(978) 671-0968</a>
                    <p className="text-sm text-gray-500">Main Office Line</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[var(--primary)] mt-0.5" />
                  <div>
                    <a href="mailto:veterans@town.billerica.ma.us" className="font-medium text-[var(--primary)] hover:underline">veterans@town.billerica.ma.us</a>
                    <p className="text-sm text-gray-500">Email Us</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--primary)]" /> Office Hours
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Monday</span><span className="font-medium">8:30 AM - 4:30 PM</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Tuesday</span><span className="font-medium">8:30 AM - 4:30 PM</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Wednesday</span><span className="font-medium">8:30 AM - 4:30 PM</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Thursday</span><span className="font-medium">8:30 AM - 4:30 PM</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Friday</span><span className="font-medium">8:30 AM - 12:30 PM</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Sat - Sun</span><span className="font-medium text-red-500">Closed</span></div>
              </div>
              <p className="text-xs text-gray-400 mt-4">Walk-ins welcome. Appointments recommended for complex matters.</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-semibold text-red-800 mb-2">Veterans Crisis Line</h3>
              <p className="text-sm text-red-700 mb-2">If you or someone you know is in crisis:</p>
              <a href="tel:988" className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition">
                <Phone className="w-4 h-4" /> Call 988, Press 1
              </a>
              <p className="text-xs text-red-600 mt-2">Available 24/7 | Text 838255</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-[var(--primary)]" /> Send Us a Message
              </h2>
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600 mb-6">We typically respond within 1-2 business days.</p>
                  <button onClick={() => { setSubmitted(false); setFormData({ name:'', email:'', phone:'', subject:'', message:'' }); }}
                    className="text-[var(--primary)] font-medium hover:underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input type="text" required value={formData.name} onChange={e => update('name', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input type="email" required value={formData.email} onChange={e => update('email', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input type="tel" value={formData.phone} onChange={e => update('phone', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                      <select required value={formData.subject} onChange={e => update('subject', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent">
                        <option value="">Select a topic...</option>
                        <option value="benefits">Benefits Question</option>
                        <option value="application">Application Status</option>
                        <option value="appointment">Schedule Appointment</option>
                        <option value="documents">Document Request</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                    <textarea required rows={5} value={formData.message} onChange={e => update('message', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      placeholder="How can we help you?" />
                  </div>
                  <button type="submit" disabled={submitting} className="bg-[var(--primary)] text-white px-6 py-3 rounded-lg hover:bg-[var(--primary-light)] transition font-medium flex items-center gap-2 disabled:opacity-50">
                    <Send className="w-4 h-4" /> {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Resources */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[var(--primary)]" /> Veteran Resources
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map(r => (
                  <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-[var(--primary)] hover:bg-blue-50 transition group">
                    <ExternalLink className="w-5 h-5 text-[var(--accent)] mt-0.5 group-hover:text-[var(--primary)]" />
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-[var(--primary)]">{r.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{r.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}