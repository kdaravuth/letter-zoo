# Proposal: 005-admin-content-studio

**Authenticated Khmer Admin Lesson Studio**

- **From**: Lesson JSON authoring requires editing repository files manually and running CLI commands, with no interactive authoring preview or PostgreSQL draft/publish UI.
- **To**: An authenticated Khmer Admin Lesson Studio (`/admin`) providing real-time `LessonDocumentV1Schema` validation, automated `U+200B` (ZWSP) auditing and sanitization, live interactive manipulative preview via `<ActivityRenderer />`, and server-validated draft/publish persistence to PostgreSQL (with graceful local-only mode fallback).
- **Reason**: Empowers Cambodian curriculum authors and MoEYS primary math educators to craft, inspect, sanitize, preview, and publish Khmer interactive lessons without writing React code.
- **Impact**: Completes the 5-milestone Konleuh Kanit roadmap by adding the `admin-content-studio` capability while keeping all decoupled content guardrails intact.
