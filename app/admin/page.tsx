import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminUploader } from "@/components/admin/AdminUploader";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import "./admin.css";

export const metadata: Metadata = {
  title: "Portfolio Studio — Tsegaye Teshome",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <AdminUploader />;
}
