# letter-zoo

Notes on this app for whoever changes it next. Short and true; never passwords or keys.

## In progress
Nothing in progress.

## What it is
Letter Zoo: a touch-screen app that teaches kids (about 3 to 7) to write the English alphabet. Each letter is an egg; the child traces the letter with a finger in real stroke order, and when it is finished the egg hatches an animal (A is for Alligator...) that joins their zoo.

## How it works
- server.js (Node 22, no packages) serves public/ with Cache-Control no-cache and two APIs: POST /api/event (visit, ping, trace, hatch) and GET /api/stats. Counts go to the Turso database letter-zoo-stats (table events) through its HTTP API, using TURSO_DATABASE_URL and TURSO_AUTH_TOKEN. Anonymous: a random id made in the browser (`letterzoo:vid`), the time-zone city as the place, the country from the time zone. No names or IPs. "Right now" is kept in memory (pings every 45 s).
- The Our world tab shows the live count, totals, balloons per place, letters traced per day (14 days) and the top 3 letters; it refreshes every 15 s while open.
- Each child's own progress stays in localStorage (`letterzoo:v1`) on the device.
- public/letters.js: every letter as stroke paths in order (grid x 0-100; top line y=20, middle y=60, base y=100, tail y=130), plus the animal for each letter.
- public/app.js: tracing engine. Each stroke is sampled into checkpoints every 1.5 units; the finger must start at the green dot and moves the progress forward when it stays within the tolerance (Easy 12, Tricky 8 units). Lifting the finger keeps progress. Off-path movement lowers stars (1 to 3, never 0).
- Pointer events with touch-action: none, one finger at a time, coalesced events for smooth ink; canvas for the crayon ink, SVG for the letter road, fill, guide lines and markers.
- Sounds are made with Web Audio (no files).
- Voice: a grown-up's own recordings come first (Voice studio in For grown-ups: 104 clips, keys cap:L, small:L, word:L, sound:L, kept in IndexedDB `letterzoo-voice` on the device). Without a recording, the browser's speech synthesis is used with the most natural voice ranked first (kid voices Ana/Maisie in Microsoft Edge, then natural/neural/enhanced, robotic Windows/Apple novelty voices last). Grown-ups can pick a voice or choose "only my recorded voice".
- Shared kid voice: recordings made in the Voice studio can be uploaded with the grown-up code (env VOICE_ADMIN_CODE, never in code) to the `clips` table (base64 audio). Every device then plays them first: own recording, then shared clip, then the computer voice. 104 phrases: cap:L ("Capital A"), small:L ("Small a"), word:L ("A is for Alligator!"), sound:L (animal sound). API: GET /api/voice/index, GET/PUT/DELETE /api/voice/clip?k=, POST /api/voice/check.
- Letter names are said "Capital A" and "Small a" (not big/little).
- Living zoo (My zoo tab): hatched animals wander a park (sky, hills, grass, pond; moon and stars in night mode). ANIMAL_EXTRA in letters.js sets each animal's home (land, water, sky), sound word and speed. Tapping one makes it jump, shows its sound in a bubble, floats hearts and says it out loud. Animals hatched since the last visit (save.fresh) drop in with an arrival animation. Timers stop when leaving the tab; no wandering with reduced motion.
- sw.js caches the app for offline use (network first). Bump CACHE when shipping big changes if needed.

## Look
Own kid-friendly look in style.css: sky blue background, white paper board with handwriting lines, six candy colors (berry, ocean, leaf, grape, tangerine, sun) that letters cycle through, chunky buttons with a 3D press, rounded fonts Baloo 2 and Nunito. Night zoo (dark) mode via design-theme.js.

## Decisions
- Stroke order follows ball-and-stick style (top to bottom, left to right; C/O/a start at the top right and go counterclockwise).
- Animals use emoji so the app loads fast with no images.
- Tab bar at the bottom on phones; on tablets in landscape the tabs become a side rail and the tools sit beside the board.
- Public source: https://github.com/kdaravuth/letter-zoo (branch main). Keep KOOMPI and GitHub in step: push changes made here to GitHub, and pull merged contributions back before changing the app.
- Open source under the MIT license (LICENSE), with README.md and CONTRIBUTING.md for contributors. Secrets live only in the service's environment (.env.example lists the names).

## Still placeholders
- None.
