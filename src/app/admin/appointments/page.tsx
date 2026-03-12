"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  Ban,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

type Slot = {
  id: string;
  dayOfWeek: number | null;
  specificDate: string | null;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  isBlocked: boolean;
  blockReason: string | null;
};

type AppointmentRecord = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  appointmentType: string;
  status: string;
  notes: string | null;
  veteran: { firstName: string; lastName: string; email: string };
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminAppointments() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [tab, setTab] = useState<"availability" | "appointments">("availability");
  const [loading, setLoading] = useState(true);

  // New slot form
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [slotForm, setSlotForm] = useState({
    isRecurring: true,
    dayOfWeek: 1,
    specificDate: "",
    startTime: "09:00",
    endTime: "09:30",
    isBlocked: false,
    blockReason: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [slotsRes, aptsRes] = await Promise.all([
      fetch("/api/admin/slots"),
      fetch("/api/admin/appointments"),
    ]);
    if (slotsRes.ok) setSlots(await slotsRes.json());
    if (aptsRes.ok) setAppointments(await aptsRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isRecurring: slotForm.isRecurring,
        dayOfWeek: slotForm.isRecurring ? slotForm.dayOfWeek : null,
        specificDate: !slotForm.isRecurring ? slotForm.specificDate : null,
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
        isBlocked: slotForm.isBlocked,
        blockReason: slotForm.isBlocked ? slotForm.blockReason : null,
      }),
    });
    if (res.ok) {
      setShowAddSlot(false);
      setSlotForm({
        isRecurring: true,
        dayOfWeek: 1,
        specificDate: "",
        startTime: "09:00",
        endTime: "09:30",
        isBlocked: false,
        blockReason: "",
      });
      fetchData();
    }
  };

  const deleteSlot = async (id: string) => {
    if (!confirm("Delete this time slot?")) return;
    await fetch(`/api/admin/slots?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    await fetch("/api/admin/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  };

  const recurringSlots = slots.filter((s) => s.isRecurring && !s.isBlocked);
  const blockedSlots = slots.filter((s) => s.isBlocked);
  const oneOffSlots = slots.filter((s) => !s.isRecurring && !s.isBlocked);

  const statusActions: Record<string, { label: string; icon: React.ElementType; color: string; next: string }[]> = {
    scheduled: [
      { label: "Confirm", icon: CheckCircle, color: "text-green-600 hover:bg-green-50", next: "confirmed" },
      { label: "Cancel", icon: XCircle, color: "text-red-600 hover:bg-red-50", next: "cancelled" },
    ],
    confirmed: [
      { label: "Complete", icon: CheckCircle, color: "text-blue-600 hover:bg-blue-50", next: "completed" },
      { label: "No Show", icon: Ban, color: "text-orange-600 hover:bg-orange-50", next: "no_show" },
      { label: "Cancel", icon: XCircle, color: "text-red-600 hover:bg-red-50", next: "cancelled" },
    ],
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointment Management</h1>
          <p className="text-muted mt-1">Set availability, block times, and manage appointments</p>
        </div>
        <button onClick={fetchData} className="p-2 text-muted hover:text-foreground transition" title="Refresh">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm border border-border mb-6 w-fit">
        <button
          onClick={() => setTab("availability")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            tab === "availability" ? "bg-primary text-white" : "text-muted hover:text-foreground"
          }`}
        >
          <Clock className="w-4 h-4 inline mr-1.5" />
          Availability & Blocked Times
        </button>
        <button
          onClick={() => setTab("appointments")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            tab === "appointments" ? "bg-primary text-white" : "text-muted hover:text-foreground"
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-1.5" />
          Booked Appointments ({appointments.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted">Loading...</div>
      ) : tab === "availability" ? (
        <div className="space-y-6">
          {/* Add slot button */}
          <button
            onClick={() => setShowAddSlot(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-light transition"
          >
            <Plus className="w-4 h-4" /> Add Time Slot
          </button>

          {/* Add slot modal */}
          {showAddSlot && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-border">
                  <h3 className="text-lg font-semibold">Add Time Slot</h3>
                </div>
                <form onSubmit={addSlot} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSlotForm((f) => ({ ...f, isRecurring: true, isBlocked: false }))}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition ${
                          slotForm.isRecurring && !slotForm.isBlocked
                            ? "bg-primary text-white border-primary"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        Recurring
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlotForm((f) => ({ ...f, isRecurring: false, isBlocked: false }))}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition ${
                          !slotForm.isRecurring && !slotForm.isBlocked
                            ? "bg-primary text-white border-primary"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        One-Off
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlotForm((f) => ({ ...f, isBlocked: true }))}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition ${
                          slotForm.isBlocked
                            ? "bg-red-600 text-white border-red-600"
                            : "border-border hover:border-red-400"
                        }`}
                      >
                        Block Time
                      </button>
                    </div>
                  </div>

                  {slotForm.isRecurring && !slotForm.isBlocked ? (
                    <div>
                      <label className="block text-sm font-medium mb-1">Day of Week</label>
                      <select
                        value={slotForm.dayOfWeek}
                        onChange={(e) => setSlotForm((f) => ({ ...f, dayOfWeek: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2.5 rounded-lg border border-border"
                      >
                        {DAYS.map((day, i) => (
                          <option key={i} value={i}>{day}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <input
                        type="date"
                        value={slotForm.specificDate}
                        onChange={(e) => setSlotForm((f) => ({ ...f, specificDate: e.target.value }))}
                        required
                        className="w-full px-3 py-2.5 rounded-lg border border-border"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Time</label>
                      <input
                        type="time"
                        value={slotForm.startTime}
                        onChange={(e) => setSlotForm((f) => ({ ...f, startTime: e.target.value }))}
                        required
                        className="w-full px-3 py-2.5 rounded-lg border border-border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">End Time</label>
                      <input
                        type="time"
                        value={slotForm.endTime}
                        onChange={(e) => setSlotForm((f) => ({ ...f, endTime: e.target.value }))}
                        required
                        className="w-full px-3 py-2.5 rounded-lg border border-border"
                      />
                    </div>
                  </div>

                  {slotForm.isBlocked && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Reason (optional)</label>
                      <input
                        type="text"
                        value={slotForm.blockReason}
                        onChange={(e) => setSlotForm((f) => ({ ...f, blockReason: e.target.value }))}
                        placeholder="e.g., Holiday, Training, etc."
                        className="w-full px-3 py-2.5 rounded-lg border border-border"
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddSlot(false)}
                      className="flex-1 py-2.5 border border-border rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-light transition"
                    >
                      {slotForm.isBlocked ? "Block Time" : "Add Slot"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Recurring Availability */}
          <div className="bg-white rounded-xl shadow-sm border border-border">
            <div className="p-5 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" />
                Weekly Recurring Availability ({recurringSlots.length} slots)
              </h2>
            </div>
            <div className="divide-y divide-border">
              {recurringSlots.length === 0 ? (
                <div className="p-8 text-center text-muted">
                  No recurring slots set. Add your weekly availability above.
                </div>
              ) : (
                DAYS.map((day, dayIndex) => {
                  const daySlots = recurringSlots.filter((s) => s.dayOfWeek === dayIndex);
                  if (daySlots.length === 0) return null;
                  return (
                    <div key={dayIndex} className="p-4">
                      <div className="font-medium text-sm text-foreground mb-2">{day}</div>
                      <div className="flex flex-wrap gap-2">
                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-sm"
                          >
                            <Clock className="w-3 h-3 text-green-600" />
                            {slot.startTime} – {slot.endTime}
                            <button
                              onClick={() => deleteSlot(slot.id)}
                              className="text-red-400 hover:text-red-600 ml-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* One-Off Availability */}
          {oneOffSlots.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-border">
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  One-Off Available Slots
                </h2>
              </div>
              <div className="divide-y divide-border">
                {oneOffSlots.map((slot) => (
                  <div key={slot.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-sm">
                        {slot.specificDate}
                      </div>
                      <span className="text-sm text-muted">
                        {slot.startTime} – {slot.endTime}
                      </span>
                    </div>
                    <button onClick={() => deleteSlot(slot.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blocked Times */}
          <div className="bg-white rounded-xl shadow-sm border border-border">
            <div className="p-5 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-500" />
                Blocked Times ({blockedSlots.length})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {blockedSlots.length === 0 ? (
                <div className="p-8 text-center text-muted">No blocked times</div>
              ) : (
                blockedSlots.map((slot) => (
                  <div key={slot.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-sm text-red-700">
                        {slot.isRecurring ? DAYS[slot.dayOfWeek!] : slot.specificDate}
                      </div>
                      <span className="text-sm text-muted">
                        {slot.startTime} – {slot.endTime}
                      </span>
                      {slot.blockReason && (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">
                          {slot.blockReason}
                        </span>
                      )}
                    </div>
                    <button onClick={() => deleteSlot(slot.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Appointments Tab */
        <div className="bg-white rounded-xl shadow-sm border border-border">
          <div className="divide-y divide-border">
            {appointments.length === 0 ? (
              <div className="p-12 text-center text-muted">No appointments booked yet</div>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id} className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {apt.veteran.firstName} {apt.veteran.lastName}
                      </p>
                      <p className="text-sm text-muted mt-0.5">
                        {apt.appointmentType.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-muted">
                        {apt.date} — {apt.startTime} to {apt.endTime}
                      </p>
                      {apt.notes && (
                        <p className="text-sm text-muted mt-1 italic">&ldquo;{apt.notes}&rdquo;</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          apt.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : apt.status === "scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : apt.status === "completed"
                            ? "bg-gray-100 text-gray-700"
                            : apt.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {apt.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                  {statusActions[apt.status] && (
                    <div className="flex gap-2 mt-3">
                      {statusActions[apt.status].map((action) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={action.next}
                            onClick={() => updateAppointmentStatus(apt.id, action.next)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-border ${action.color} transition`}
                          >
                            <Icon className="w-3 h-3" /> {action.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
