"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Calendar, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const appointmentTypes = [
  { id: "initial_consultation", label: "Initial Consultation", duration: "30 min" },
  { id: "claims_assistance", label: "VA Disability Claims", duration: "60 min" },
  { id: "document_review", label: "Document Review", duration: "30 min" },
  { id: "follow_up", label: "Follow-up Appointment", duration: "30 min" },
  { id: "general", label: "General Inquiry", duration: "30 min" },
];

type Slot = { startTime: string; endTime: string };

function formatTime(time24: string) {
  const [h, m] = time24.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

export default function AppointmentsPage() {
  const { data: session, status: authStatus } = useSession();
  const [step, setStep] = useState(1);
  const [booked, setBooked] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [form, setForm] = useState({
    type: "",
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Fetch available slots when date changes
  useEffect(() => {
    if (!form.date) return;
    setLoadingSlots(true);
    setAvailableSlots([]);
    setForm((prev) => ({ ...prev, startTime: "", endTime: "" }));
    fetch(`/api/appointments/slots?date=${form.date}`)
      .then((r) => r.json())
      .then((data) => {
        setAvailableSlots(data.slots || []);
        setLoadingSlots(false);
      })
      .catch(() => setLoadingSlots(false));
  }, [form.date]);

  const handleBook = async () => {
    setBooking(true);
    setError("");
    try {
      const res = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          appointmentType: form.type,
          notes: form.notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to book appointment");
      }
      setBooked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  if (authStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="fade-in max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-amber-800 mb-2">Login Required</h2>
          <p className="text-amber-700 mb-6">You must be logged in to schedule an appointment.</p>
          <a href="/login" className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-light transition font-medium text-sm">
            Log In / Register
          </a>
        </div>
      </div>
    );
  }

  if (booked) {
    return (
      <div className="fade-in max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Appointment Booked!</h2>
          <p className="text-green-700 mb-6">Your appointment has been scheduled.</p>
          <div className="bg-white rounded-lg p-4 mb-6 space-y-2">
            <p className="text-sm"><strong>Type:</strong> {appointmentTypes.find((t) => t.id === form.type)?.label}</p>
            <p className="text-sm"><strong>Date:</strong> {new Date(form.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            <p className="text-sm"><strong>Time:</strong> {formatTime(form.startTime)} - {formatTime(form.endTime)}</p>
            <p className="text-sm"><strong>Location:</strong> 365 Boston Road, Office #201, Billerica, MA 01821</p>
          </div>
          <p className="text-sm text-green-700 mb-6">You will receive confirmation from the Veterans Service Officer.</p>
          <div className="flex justify-center gap-4">
            <a href="/" className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-light transition font-medium text-sm">Return Home</a>
            <a href="/status" className="border border-border px-6 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium text-sm">View My Cases</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="bg-gradient-to-r from-primary to-primary-light text-white py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-6 h-6 text-accent" />
            <span className="text-accent font-medium">Appointment Scheduling</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Schedule an Appointment</h1>
          <p className="text-blue-100">Book a meeting with our Veterans Service Officer.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}>{s}</div>
              {s < 3 && <div className={`w-16 h-0.5 mx-2 ${step > s ? "bg-primary" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-border p-6 md:p-8">
          {step === 1 && (
            <div className="slide-in">
              <h2 className="text-xl font-bold text-primary mb-4">Select Appointment Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {appointmentTypes.map((t) => (
                  <button key={t.id} onClick={() => update("type", t.id)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${form.type === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                    <div className="font-medium">{t.label}</div>
                    <div className="text-sm text-muted flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> {t.duration}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="slide-in">
              <h2 className="text-xl font-bold text-primary mb-4">Select Date & Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Date *</label>
                  <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    min={new Date().toISOString().split("T")[0]} />
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2 text-xs text-blue-700">
                      <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Office Hours</p>
                        <p>Mon-Thu: 9:00 AM - 4:00 PM</p>
                        <p>Fri: 9:00 AM - 12:30 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Available Time Slots *</label>
                  {!form.date ? (
                    <p className="text-sm text-muted py-4">Select a date to see available times.</p>
                  ) : loadingSlots ? (
                    <div className="flex items-center gap-2 py-4 text-sm text-muted">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading available slots...
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                      No available slots for this date. Please try another day.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <button key={slot.startTime} onClick={() => setForm((prev) => ({ ...prev, startTime: slot.startTime, endTime: slot.endTime }))}
                          className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${form.startTime === slot.startTime ? "border-primary bg-primary text-white" : "border-border hover:border-primary/30"}`}>
                          {formatTime(slot.startTime)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="slide-in">
              <h2 className="text-xl font-bold text-primary mb-4">Review & Notes</h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-primary mb-2">Appointment Summary</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted">Name:</span> {session.user?.name}</p>
                  <p><span className="text-muted">Type:</span> {appointmentTypes.find((t) => t.id === form.type)?.label}</p>
                  <p><span className="text-muted">Date:</span> {new Date(form.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  <p><span className="text-muted">Time:</span> {formatTime(form.startTime)} - {formatTime(form.endTime)}</p>
                  <p><span className="text-muted">Location:</span> 365 Boston Road, Office #201, Billerica, MA</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes / Reason for Visit</label>
                <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Brief description of what you need help with..." />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            {step > 1 ? (
              <button onClick={() => setStep((s) => s - 1)} className="px-5 py-2.5 border border-border rounded-lg hover:bg-gray-50 transition text-sm font-medium">Previous</button>
            ) : <div />}
            {step < 3 ? (
              <button onClick={() => setStep((s) => s + 1)} disabled={(step === 1 && !form.type) || (step === 2 && (!form.date || !form.startTime))}
                className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-light transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                Next Step
              </button>
            ) : (
              <button onClick={handleBook} disabled={booking}
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {booking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {booking ? "Booking..." : "Book Appointment"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-700">
              <p className="font-medium">Prefer to call?</p>
              <p>You can also schedule by calling <a href="tel:978-671-0968" className="underline font-medium">(978) 671-0968</a> during office hours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
