import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { loadAllLessons, loadLessonById } from "@/lib/curriculum/loader";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";

export function generateStaticParams() {
  return loadAllLessons().map((lesson) => ({
    lessonId: lesson.id,
  }));
}

function LessonLoadingShell() {
  return (
    <div
      data-testid="lesson-loading-shell"
      className="min-h-dvh bg-canvas flex flex-col items-center justify-center px-4 py-8"
    >
      <div className="w-full max-w-md rounded-3xl border-2 border-[#c9c2b2] bg-surface p-6 text-center shadow-[0_6px_0_#c9c2b2] space-y-2">
        <p className="text-base font-bold text-ink">កំពុងបើកមេរៀនគណិត...</p>
        <p className="text-xs text-ink-muted">សូមរង់ចាំបន្តិច</p>
      </div>
    </div>
  );
}

async function LessonContent({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = loadLessonById(lessonId);

  if (!lesson) {
    notFound();
  }

  return <LessonPlayer lesson={lesson} />;
}

export default function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  return (
    <Suspense fallback={<LessonLoadingShell />}>
      <LessonContent params={params} />
    </Suspense>
  );
}
