# Change Proposal: 010-clock-charts-scratchpad-and-certificate

## Why
To close the remaining MoEYS Grades 1–5 curriculum pillars (telling time, elapsed time, measurement, and bar charts), empower early readers with spoken audio on hints/explanations plus an on-screen scratchpad, and give parents/teachers a joyful offline printable Khmer achievement certificate.

## What Changes
1. **10th Reusable SVG Primitive — `clock-time`** (`src/components/activities/ClockTime.tsx`) + **Frog's Daily Clock** 6th game in `/play`.
2. **11th Reusable SVG Primitive — `data-chart`** (`src/components/activities/DataChart.tsx`) supporting interactive bar-building (`build-bars`) and bar-reading (`read-bar`).
3. **5th Unrestricted Learning Path — `time-measurement-data`** ("ពេលវេលា រង្វាស់ និងទិន្នន័យ", Grades 2–5) with 4 new interactive lessons (`t01`–`t04`, 16 new steps + 16 native Khmer MP3s — bringing the library to 32 lessons, 115 steps, 11 primitives).
4. **Spoken Khmer Audio for Hints & Explanations + Toggleable On-Screen Doodle Scratchpad** (`src/components/lesson/LessonScratchpad.tsx`) in `LessonPlayer.tsx`.
5. **Printable Offline Khmer Achievement Certificate** (`src/components/ui/AchievementCertificate.tsx`) with `@media print` styling embedded in `/parent` and `/garden`.
