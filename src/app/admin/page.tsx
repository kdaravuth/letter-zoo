import React from "react";
import { loadAllLessons } from "@/lib/curriculum/loader";
import { AdminStudioClient } from "@/components/admin/AdminStudioClient";

export default function AdminStudioPage() {
  const lessons = loadAllLessons();
  return <AdminStudioClient initialLessons={lessons} />;
}
