import fs from "node:fs";
import path from "node:path";
import { LessonDocumentV1Schema, type LessonDocumentV1 } from "./schema";

const CONTENT_ROOT = path.join(process.cwd(), "content", "paths");

export interface LearningPathMeta {
  id: string;
  titleKm: string;
  shortTitleKm: string;
  subtitleKm: string;
  gradeRangeKm: string;
  lessons: LessonDocumentV1[];
}

export function loadLessonsForPath(pathId: string): LessonDocumentV1[] {
  const dir = path.join(CONTENT_ROOT, pathId);
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort();

  const lessons: LessonDocumentV1[] = [];

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const parsedJson: unknown = JSON.parse(raw);
    const result = LessonDocumentV1Schema.safeParse(parsedJson);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      throw new Error(`Invalid lesson JSON in ${file}: ${issues}`);
    }
    lessons.push(result.data);
  }

  return lessons.sort((a, b) => a.order - b.order);
}

export function loadAllLessons(): LessonDocumentV1[] {
  if (!fs.existsSync(CONTENT_ROOT)) {
    return [];
  }

  const pathDirs = fs
    .readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const all: LessonDocumentV1[] = [];
  for (const pathId of pathDirs) {
    all.push(...loadLessonsForPath(pathId));
  }
  return all;
}

export function loadLessonById(lessonId: string): LessonDocumentV1 | null {
  const all = loadAllLessons();
  return all.find((lesson) => lesson.id === lessonId) ?? null;
}

export function getEarlyFoundationsPath(): LearningPathMeta {
  return {
    id: "early-foundations",
    titleKm: "គ្រឹះគណិតវិទ្យាថ្នាក់ដំបូង",
    shortTitleKm: "គ្រឹះថ្នាក់ដំបូង",
    subtitleKm:
      "រៀនរាប់ បន្ទាត់ចំនួន វិធីបូក វិធីដក លំនាំក្រមា និងប្រាក់រៀលតាមរយៈរូបភាពរស់រវើក",
    gradeRangeKm: "ថ្នាក់ ១–២",
    lessons: loadLessonsForPath("early-foundations"),
  };
}

export function getAllLearningPaths(): LearningPathMeta[] {
  return [
    getEarlyFoundationsPath(),
    {
      id: "geometry-foundations",
      titleKm: "ធរណីមាត្រ និងផ្ទៃក្រឡា",
      shortTitleKm: "ធរណីមាត្រ",
      subtitleKm:
        "ស្គាល់លក្ខណៈរូបធរណីមាត្រ ២D ផ្ទៃក្រឡាលើក្រឡាចត្រង្គ និងបរិមាត្រចតុកោណ",
      gradeRangeKm: "ថ្នាក់ ៣–៥",
      lessons: loadLessonsForPath("geometry-foundations"),
    },
    {
      id: "fractions-and-decimals",
      titleKm: "ប្រភាគ និងចំនួនទសភាគ",
      shortTitleKm: "ប្រភាគ និងទសភាគ",
      subtitleKm:
        "មើលឃើញប្រភាគស្មើគ្នា បូកប្រភាគ ភាគដប់លើបន្ទាត់ចំនួន ០–១ និងការប្រៀបធៀបចំនួនទសភាគ",
      gradeRangeKm: "ថ្នាក់ ៣–៥",
      lessons: loadLessonsForPath("fractions-and-decimals"),
    },
    {
      id: "multiplication-and-algebra",
      titleKm: "វិធីគុណ ចែក និងពិជគណិតដំបូង",
      shortTitleKm: "គុណ ចែក និងពិជគណិត",
      subtitleKm:
        "រៀនវិធីគុណ ចែកស្មើៗគ្នា ជញ្ជីងសមីការអាថ៌កំបាំង និងភាគរយក្នុងការទិញឥវ៉ាន់",
      gradeRangeKm: "ថ្នាក់ ២–៦",
      lessons: loadLessonsForPath("multiplication-and-algebra"),
    },
    {
      id: "time-measurement-data",
      titleKm: "ពេលវេលា រង្វាស់ និងដ្យាក្រាមទិន្នន័យ",
      shortTitleKm: "ពេលវេលា និងទិន្នន័យ",
      subtitleKm:
        "មើលនាឡិកាខ្មែរ គណនារយៈពេល វាស់ប្រវែង និងសង់ដ្យាក្រាមសសរអន្តរកម្ម",
      gradeRangeKm: "ថ្នាក់ ២–៥",
      lessons: loadLessonsForPath("time-measurement-data"),
    },
  ];
}
