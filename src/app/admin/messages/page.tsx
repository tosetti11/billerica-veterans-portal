import { prisma } from "@/lib/db";
import Link from "next/link";
import { MessageSquare, Mail, Phone, Clock, Eye, Archive } from "lucide-react";

const statusColors: Record<string, string> = {
  unread: "bg-blue-100 text-blue-700",
  read: "bg-gray-100 text-gray-600",
  replied: "bg-green-100 text-green-700",
  archived: "bg-gray-50 text-gray-400",
};

export default async function AdminMessages() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { firstName: true, lastName: true } } },
  });

  async function markRead(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const status = formData.get("status") as string;
    await prisma.contactMessage.update({ where: { id }, data: { status } });
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-muted mt-1">{messages.filter((m) => m.status === "unread").length} unread</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border">
        <div className="divide-y divide-border">
          {messages.length === 0 ? (
            <div className="p-12 text-center text-muted">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No messages yet</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`p-5 ${msg.status === "unread" ? "bg-blue-50/30" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-foreground">{msg.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[msg.status]}`}>
                        {msg.status}
                      </span>
                      <span className="text-xs text-muted">{msg.subject}</span>
                    </div>
                    <p className="text-sm text-muted mt-1">{msg.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {msg.email}</span>
                      {msg.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {msg.phone}</span>}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {msg.status === "unread" && (
                      <form action={markRead}>
                        <input type="hidden" name="id" value={msg.id} />
                        <input type="hidden" name="status" value="read" />
                        <button type="submit" className="p-2 text-muted hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Mark read">
                          <Eye className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                    {msg.status !== "archived" && (
                      <form action={markRead}>
                        <input type="hidden" name="id" value={msg.id} />
                        <input type="hidden" name="status" value="archived" />
                        <button type="submit" className="p-2 text-muted hover:text-gray-600 hover:bg-gray-50 rounded-lg transition" title="Archive">
                          <Archive className="w-4 h-4" />
                        </button>
                      </form>
                    )}
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
