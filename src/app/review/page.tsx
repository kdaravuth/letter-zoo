import React from "react";
import { loadAllLessons } from "@/lib/curriculum/loader";
import { ReviewQueueClient } from "@/components/review/ReviewQueueClient";

export default function ReviewPage() {
  const lessons = loadAllLessons();
  return <ReviewQueueClient lessons={lessons} />;
}
