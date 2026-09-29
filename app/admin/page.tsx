import type { Metadata } from "next";
import { AdminUploader } from "@/components/admin/AdminUploader";

export const metadata: Metadata = {
  title: "Portfolio Upload — Tsegaye Teshome",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminUploader />;
}
