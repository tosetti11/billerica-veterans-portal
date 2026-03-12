import { prisma } from "@/lib/db";
import { Users, Mail, Phone, Calendar, Briefcase } from "lucide-react";

export default async function AdminVeterans() {
  const veterans = await prisma.user.findMany({
    where: { role: "veteran" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { cases: true, appointments: true } },
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Registered Veterans</h1>
        <p className="text-muted mt-1">{veterans.length} veteran{veterans.length !== 1 ? "s" : ""} registered</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border">
        <div className="divide-y divide-border">
          {veterans.length === 0 ? (
            <div className="p-12 text-center text-muted">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No veterans registered yet</p>
            </div>
          ) : (
            veterans.map((v) => (
              <div key={v.id} className="p-5 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {v.firstName} {v.lastName}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {v.email}</span>
                      {v.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {v.phone}</span>}
                      {v.branch && <span>{v.branch}</span>}
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {new Date(v.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" /> {v._count.cases} cases
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> {v._count.appointments} appts
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
