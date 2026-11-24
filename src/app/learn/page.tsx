import React from "react";
import { getAllLearningPaths } from "@/lib/curriculum/loader";
import { LearningPathClient } from "@/components/learn/LearningPathClient";

export default function LearnDashboardPage() {
  const paths = getAllLearningPaths();
  return <LearningPathClient paths={paths} />;
}
