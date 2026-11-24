import React from "react";
import { getAllLearningPaths } from "@/lib/curriculum/loader";
import { ParentDashboardClient } from "@/components/parent/ParentDashboardClient";

export default function ParentPage() {
  const paths = getAllLearningPaths();
  return <ParentDashboardClient paths={paths} />;
}
