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
- Treat Time: after each finished letter the reward shows the animal's treat (ANIMAL_TREATS in letters.js) on a plate; the child drags it to the animal (or taps it to send it). The animal munches, a friendship heart fills (save.fed[L], 3 max) and at 3 the animal becomes a best friend with a crown, shown on the reward, the zoo card and in the park.
- Points and Champions: the server works out points from events (10 per star on a traced letter, 20 hatch, 5 treat, 25 crown; at most 15 scoring events a minute) into the `scores` table with the week (Monday, Cambodia time). Players pick a name from fun words + an animal buddy + a number (`players` table; PLAYER_WORDS/PLAYER_BUDDY in letters.js must match ADJ/BUDDY in server.js). The owner asked that kids can type their first name: it is optional, first name only (letters in any language, 2-12, one word, rude words refused on the server, `player_names` table) and shows as "Dara the Lion"; without it the fun name is used. Never show surnames or ask for more. Names are unique: `player_keys` holds one key per shown name (first name + buddy, or fun word + buddy + number). A taken first-name combo returns 409 with up to 4 free buddies to tap; a taken fun name silently gets a free number. Test ids (testrunner...) use their own key space. GET /api/leaderboard?scope=week|all&v=<id> gives the top 10 and your rank; test ids (testrunner...) are left off unless &test=1. The Champions tab shows your card, a podium for the top 3, ranks 4-10 and your row; when a named player reaches a better top-3 rank in the week, a champion party pops up once. The points pill on the Trace screen shows the device's own total.
- Living zoo (My zoo tab): hatched animals wander a park (sky, hills, grass, pond; moon and stars in night mode). ANIMAL_EXTRA in letters.js sets each animal's home (land, water, sky), sound word and speed. Tapping one makes it jump, shows its sound in a bubble, floats hearts and says it out loud. Animals hatched since the last visit (save.fresh) drop in with an arrival animation. Timers stop when leaving the tab; no wandering with reduced motion.
- sw.js caches the app for offline use (network first). Bump CACHE when shipping big changes if needed.

## Look
Own kid-friendly look in style.css: sky blue background, white paper board with handwriting lines, six candy colors (berry, ocean, leaf, grape, tangerine, sun) that letters cycle through, chunky buttons with a 3D press, rounded fonts Baloo 2 and Nunito. Night zoo (dark) mode via design-theme.js.

## Decisions
- Stroke order follows ball-and-stick style (top to bottom, left to right; C/O/a start at the top right and go counterclockwise).
- Animals use emoji so the app loads fast with no images.
- Tab bar at the bottom on phones; on tablets in landscape the tabs become a side rail and the tools sit beside the board.
- Public source: https://github.com/kdaravuth/letter-zoo (branch main). Changes go on a branch and reach main only through a reviewed pull request; the Checks workflow (.github/workflows/ci.yml, `npm test` = scripts/check.js, plus a Docker build) must pass. Never push to main directly. Until KOOMPI deploys from GitHub main, copy merged main to the KOOMPI app before deploying, so the two stay identical.
- Open source under the MIT license (LICENSE), with README.md and CONTRIBUTING.md for contributors. Secrets live only in the service's environment (.env.example lists the names).

## Still placeholders
- None.
