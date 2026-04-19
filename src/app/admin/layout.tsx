import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: {
    default: "Admin Panel | Gizami",
    template: "%s | Admin – Gizami",
  },
  description: "Gizami LMS Admin Panel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
