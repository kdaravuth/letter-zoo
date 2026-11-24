"use server";

import { LessonDocumentV1Schema } from "@/lib/curriculum/schema";
import { stripZwsp } from "@/lib/khmer/numerals";
import { auditLessonObjectZwsp } from "@/lib/khmer/zwspAudit";
import { getDb } from "@/db";
import { lessons } from "@/db/schema";
import { sql } from "drizzle-orm";

function getAllowedPasscodes(): string[] {
  const configured = process.env.ADMIN_STUDIO_PASSCODE?.trim();
  if (configured) {
    return [configured];
  }
  return ["soun-admin", "konleuh-admin"];
}

export async function verifyAdminPasscode(
  passcode: string
): Promise<{ ok: boolean }> {
  const clean = stripZwsp(passcode).trim();
  return { ok: clean.length > 0 && getAllowedPasscodes().includes(clean) };
}

export interface PublishLessonResult {
  ok: boolean;
  mode?: "postgres" | "local-only";
  lessonId?: string;
  status?: "draft" | "published";
  messageKm: string;
  errors?: string[];
}

export async function publishLessonAction(input: {
  passcode: string;
  status: "draft" | "published";
  rawJson: string;
}): Promise<PublishLessonResult> {
  const auth = await verifyAdminPasscode(input.passcode);
  if (!auth.ok) {
    return {
      ok: false,
      messageKm: "លេខកូដសម្ងាត់អ្នកគ្រប់គ្រងមិនត្រឹមត្រូវទេ។",
      errors: ["Unauthorized"],
    };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(input.rawJson);
  } catch {
    return {
      ok: false,
      messageKm: "ទម្រង់ JSON មិនត្រឹមត្រូវទេ សូមពិនិត្យសញ្ញាវង់ក្រចក និងក្បៀស!",
      errors: ["Invalid JSON syntax"],
    };
  }

  const zwspAudit = auditLessonObjectZwsp(parsedJson);
  if (zwspAudit.blockingCount > 0) {
    return {
      ok: false,
      messageKm:
        "រកឃើញតួអក្សរ U+200B (ZWSP) ក្នុងលេខសម្គាល់ (ID)។ សូមចុច «សម្អាត U+200B» ជាមុនសិន!",
      errors: zwspAudit.findings
        .filter((f) => f.isIdentifier)
        .map((f) => `${f.path}: contains ${f.count} U+200B character(s)`),
    };
  }

  const validated = LessonDocumentV1Schema.safeParse(parsedJson);
  if (!validated.success) {
    return {
      ok: false,
      messageKm: "មេរៀនមិនទាន់ឆ្លងកាត់ការផ្ទៀងផ្ទាត់ Schema ទេ។",
      errors: validated.error.issues.map(
        (i) => `${i.path.join(".") || "root"}: ${i.message}`
      ),
    };
  }

  const lesson = validated.data;
  const db = getDb();

  if (!db) {
    return {
      ok: true,
      mode: "local-only",
      lessonId: lesson.id,
      status: input.status,
      messageKm:
        input.status === "published"
          ? `បានផ្ទៀងផ្ទាត់មេរៀន «${lesson.titleKm}» រួចរាល់ (របៀបមូលដ្ឋាន — គ្មាន DATABASE_URL)! អ្នកអាចទាញយក JSON ទុកក្នុង content/paths/${lesson.pathId}/ បាន។`
          : `បានផ្ទៀងផ្ទាត់ព្រាងមេរៀន «${lesson.titleKm}» រួចរាល់ (របៀបមូលដ្ឋាន)!`,
    };
  }

  try {
    await db
      .insert(lessons)
      .values({
        id: lesson.id,
        pathId: lesson.pathId,
        sortOrder: lesson.order,
        moeysGradeRef: lesson.moeysGradeRef,
        topicSlug: lesson.topicSlug,
        titleKm: lesson.titleKm,
        contentVersion: 1,
        status: input.status,
        payload: lesson,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: lessons.id,
        set: {
          pathId: lesson.pathId,
          sortOrder: lesson.order,
          moeysGradeRef: lesson.moeysGradeRef,
          topicSlug: lesson.topicSlug,
          titleKm: lesson.titleKm,
          contentVersion: sql`${lessons.contentVersion} + 1`,
          status: input.status,
          payload: lesson,
          updatedAt: new Date(),
        },
      });

    return {
      ok: true,
      mode: "postgres",
      lessonId: lesson.id,
      status: input.status,
      messageKm:
        input.status === "published"
          ? `បានផ្សាយមេរៀន «${lesson.titleKm}» ទៅ PostgreSQL ដោយជោគជ័យ!`
          : `បានរក្សាទុកព្រាង «${lesson.titleKm}» ក្នុង PostgreSQL ដោយជោគជ័យ!`,
    };
  } catch {
    return {
      ok: false,
      messageKm: "មិនអាចតភ្ជាប់ទៅ PostgreSQL បានទេ សូមពិនិត្យ DATABASE_URL!",
      errors: ["Database upsert failed"],
    };
  }
}
