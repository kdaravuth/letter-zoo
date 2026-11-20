# Letter Zoo

[![Checks](https://github.com/kdaravuth/letter-zoo/actions/workflows/ci.yml/badge.svg)](https://github.com/kdaravuth/letter-zoo/actions/workflows/ci.yml)

A touch-screen app that teaches kids (about 3 to 7) to **write the English alphabet**.
Every letter is a mystery egg: trace it with your finger in the right stroke order, and the egg hatches an animal friend that moves into your zoo.

**Try it:** https://letter-zoo.public.koompi.cloud

## Features

- **Finger tracing with real stroke order:** a green start dot, numbered lines and arrows for all 52 letters (A–Z and a–z) on handwriting lines.
- **Ladybug demo:** a ladybug walks each stroke first to show how the letter is written.
- **Forgiving and encouraging:** lift your finger and carry on; 1 to 3 stars for neatness, never zero.
- **Hatching surprise:** the egg cracks as you trace, then hatches *"A is for Alligator!"* with confetti.
- **Treat Time:** after each letter, drag a treat into the animal's mouth. Three treats make best friends, and the animal earns a crown.
- **Points and Champions:** earn points for stars, new friends, treats and crowns. A weekly board ranks players, and the top 3 are crowned champions. Players show only a first name with their animal buddy ("Dara the Lion"), or a fun name.
- **Living zoo:** hatched animals walk, swim and fly around a park and say their sound when tapped.
- **Voices:** a real child's recordings shared with every device (Voice studio), with the device's own voice as a fallback.
- **Our world:** live, anonymous stats: kids writing right now, letters traced, places (balloons), a 14-day chart and the most-loved letters.
- **For grown-ups:** sounds, voice, tracing help (Easy/Tricky), night mode and a reset.
- Works on phones and tablets, installs to the home screen and keeps working on weak Wi-Fi.

## Run it on your computer

You only need [Node.js](https://nodejs.org) 20 or newer. There are no packages to install.

```bash
PORT=3000 node server.js
```

Then open http://localhost:3000. Run the checks with `npm test`. Tracing, the zoo and voice recording on your own device all work without a database. The **Our world** stats and the **shared** kid voice need a [Turso](https://turso.tech) database (see below).

On Windows PowerShell:

```powershell
$env:PORT=3000; node server.js
```

## Settings (environment variables)

| Name | What it is for |
|---|---|
| `PORT` | Port to listen on (default 80). |
| `TURSO_DATABASE_URL` | Turso database for stats and the shared voice (`libsql://...`). |
| `TURSO_AUTH_TOKEN` | Token for that database. |
| `VOICE_ADMIN_CODE` | The grown-up code that allows uploading the shared kid voice. |

Copy `.env.example` to `.env`, fill it in, and start with `node --env-file=.env server.js`. Never commit real values.

## How it is built

```text
server.js            Node server (no packages): serves public/, stats API, shared voice API
public/index.html    Screens: Trace, Letters, My zoo, Our world, For grown-ups, Voice studio
public/app.js        Tracing engine, demo, rewards, zoo park, voices, stats screen
public/letters.js    Every letter as stroke paths in order, and the animal for each letter
public/style.css     The kid-friendly look (light and night mode)
public/sw.js         Offline cache
Dockerfile           Runs it anywhere with Docker
AGENTS.md            Detailed notes on how everything works
```

- **Letters** are drawn on a 100-wide grid: top line `y=20`, middle `y=60`, base line `y=100`, tail line `y=130`. Each stroke is an SVG path written in the direction a child should draw it.
- **Tracing** samples each stroke into checkpoints; the finger moves the progress forward when it stays close to the path.
- **Stats** are anonymous: a random id made in the browser, the time-zone city and the country. No names, IP addresses, photos or voices are stored with them.

## Contributing

Ideas, fixes, new animals, translations and better stroke paths are all welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE). Fonts (Baloo 2, Nunito) come from Google Fonts under the SIL Open Font License; animals are your device's emoji.
