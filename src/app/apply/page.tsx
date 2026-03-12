'use client';

import { useState } from 'react';
import { ClipboardList, User, Shield, Upload, CheckCircle, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

const services = [
  { id: 'ch115', name: 'Chapter 115 Financial Assistance', desc: 'Monthly financial aid for eligible veterans' },
  { id: 'tax', name: 'Property Tax Abatement', desc: 'Property tax exemption for qualifying veterans' },
  { id: 'disability', name: 'VA Disability Claims', desc: 'Assistance filing VA disability compensation' },
  { id: 'bonus', name: 'Welcome Home Bonus', desc: 'Massachusetts bonus for returning service members' },
  { id: 'burial', name: 'Burial Benefits', desc: 'Assistance with veteran burial and memorial services' },
  { id: 'plates', name: 'Veteran License Plates', desc: 'Special veteran designation license plates' },
  { id: 'annuity', name: 'Annuity Programs', desc: 'State annuity programs for disabled veterans' },
  { id: 'records', name: 'Service Records Request', desc: 'Help obtaining DD-214 and military records' },
];

const steps = [
  { num: 1, label: 'Service', icon: ClipboardList },
  { num: 2, label: 'Personal', icon: User },
  { num: 3, label: 'Military', icon: Shield },
  { num: 4, label: 'Documents', icon: Upload },
  { num: 5, label: 'Review', icon: CheckCircle },
];

export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [confirmId, setConfirmId] = useState('');
  const [form, setForm] = useState({
    service: '', firstName: '', lastName: '', email: '', phone: '',
    address: '', city: 'Billerica', state: 'MA', zip: '',
    dob: '', ssn4: '',
    branch: '', rank: '', serviceStart: '', serviceEnd: '',
    dischargeType: '', vaRating: '',
    agreeTerms: false, agreeAccurate: false,
  });

  const update = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const s1 = Array.from({length:6}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
    const s2 = Array.from({length:4}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
    setConfirmId('BVS-' + s1 + '-' + s2);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl font-bold">Application Submitted</h1>
          </div>
        </section>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">Your application has been submitted successfully.</p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Confirmation Number</p>
              <p className="text-2xl font-bold font-mono text-[var(--primary)]">{confirmId}</p>
            </div>
            <p className="text-sm text-gray-500 mb-6">Save this number to track your application status. You will also receive a confirmation email.</p>
            <div className="flex gap-4 justify-center">
              <a href="/status" className="bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg hover:bg-[var(--primary-light)] transition font-medium">Track Status</a>
              <a href="/" className="border border-gray-300 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium">Return Home</a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Apply for Benefits</h1>
          <p className="text-blue-100">Complete the application form below. All fields marked * are required.</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={'flex flex-col items-center ' + (step >= s.num ? 'text-[var(--primary)]' : 'text-gray-400')}>
                <div className={'w-10 h-10 rounded-full flex items-center justify-center mb-1 ' + (step > s.num ? 'bg-green-100 text-green-600' : step === s.num ? 'bg-[var(--primary)] text-white' : 'bg-gray-200')}>
                  {step > s.num ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={'flex-1 h-0.5 mx-2 ' + (step > s.num ? 'bg-green-300' : 'bg-gray-200')} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Service</h2>
              <p className="text-gray-600 mb-6">Choose the benefit or service you are applying for.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map(svc => (
                  <button key={svc.id} onClick={() => update('service', svc.id)}
                    className={'p-4 rounded-lg border-2 text-left transition ' + (form.service === svc.id ? 'border-[var(--primary)] bg-blue-50' : 'border-gray-200 hover:border-gray-300')}>
                    <p className="font-medium text-gray-900">{svc.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{svc.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" value={form.firstName} onChange={e => update('firstName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input type="text" value={form.lastName} onChange={e => update('lastName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input type="text" value={form.address} onChange={e => update('address', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" value={form.city} onChange={e => update('city', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input type="text" value={form.state} onChange={e => update('state', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                    <input type="text" value={form.zip} onChange={e => update('zip', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input type="date" value={form.dob} onChange={e => update('dob', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last 4 SSN</label>
                  <input type="text" maxLength={4} value={form.ssn4} onChange={e => update('ssn4', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" placeholder="XXXX" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Military Service */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Military Service Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch of Service *</label>
                  <select value={form.branch} onChange={e => update('branch', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent">
                    <option value="">Select branch...</option>
                    <option value="army">U.S. Army</option>
                    <option value="navy">U.S. Navy</option>
                    <option value="airforce">U.S. Air Force</option>
                    <option value="marines">U.S. Marine Corps</option>
                    <option value="coastguard">U.S. Coast Guard</option>
                    <option value="spaceforce">U.S. Space Force</option>
                    <option value="guard">National Guard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rank at Discharge</label>
                  <input type="text" value={form.rank} onChange={e => update('rank', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Start Date *</label>
                  <input type="date" value={form.serviceStart} onChange={e => update('serviceStart', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service End Date *</label>
                  <input type="date" value={form.serviceEnd} onChange={e => update('serviceEnd', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Type *</label>
                  <select value={form.dischargeType} onChange={e => update('dischargeType', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent">
                    <option value="">Select type...</option>
                    <option value="honorable">Honorable</option>
                    <option value="general">General (Under Honorable)</option>
                    <option value="other-honorable">Other Than Honorable</option>
                    <option value="medical">Medical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VA Disability Rating (%)</label>
                  <input type="text" value={form.vaRating} onChange={e => update('vaRating', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" placeholder="e.g., 30" />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Documents</h2>
              <p className="text-gray-600 mb-6">Upload supporting documents for your application. You can also upload documents later from the Document Center.</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-2">Drag and drop files here, or{' '}
                  <label className="text-[var(--primary)] font-medium cursor-pointer hover:underline">browse
                    <input type="file" multiple className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                  </label>
                </p>
                <p className="text-sm text-gray-400">PDF, JPG, PNG (Max 10MB each)</p>
              </div>
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium">Recommended Documents</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>DD-214 (Certificate of Release or Discharge)</li>
                    <li>VA Disability Rating Letter (if applicable)</li>
                    <li>Massachusetts Driver License or ID</li>
                    <li>Proof of Billerica residency</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Your Application</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-[var(--primary)] mb-2">Service Selected</h3>
                  <p className="text-gray-900">{services.find(s => s.id === form.service)?.name || 'Not selected'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-[var(--primary)] mb-2">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> {form.firstName} {form.lastName}</p>
                    <p><span className="text-gray-500">Email:</span> {form.email}</p>
                    <p><span className="text-gray-500">Phone:</span> {form.phone}</p>
                    <p><span className="text-gray-500">Address:</span> {form.address}, {form.city}, {form.state} {form.zip}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-[var(--primary)] mb-2">Military Service</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="text-gray-500">Branch:</span> {form.branch}</p>
                    <p><span className="text-gray-500">Rank:</span> {form.rank}</p>
                    <p><span className="text-gray-500">Service:</span> {form.serviceStart} to {form.serviceEnd}</p>
                    <p><span className="text-gray-500">Discharge:</span> {form.dischargeType}</p>
                    {form.vaRating && <p><span className="text-gray-500">VA Rating:</span> {form.vaRating}%</p>}
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.agreeAccurate} onChange={e => update('agreeAccurate', e.target.checked)}
                      className="mt-1 rounded border-gray-300" />
                    <span className="text-sm text-gray-700">I certify that all information provided is true and accurate to the best of my knowledge.</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.agreeTerms} onChange={e => update('agreeTerms', e.target.checked)}
                      className="mt-1 rounded border-gray-300" />
                    <span className="text-sm text-gray-700">I agree to the terms of service and understand that providing false information may result in denial of benefits.</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
            ) : <div />}
            {step < 5 ? (
              <button onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && !form.service}
                className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg hover:bg-[var(--primary-light)] transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit}
                disabled={!form.agreeTerms || !form.agreeAccurate}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                <CheckCircle className="w-4 h-4" /> Submit Application
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}