import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminUploader } from "@/components/admin/AdminUploader";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const metadata: Metadata = {
  title: "Portfolio Upload — Tsegaye Teshome",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return <AdminUploader />;
}
