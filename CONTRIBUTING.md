# Contributing to Letter Zoo

Thank you for helping kids learn to write! Every kind of help is welcome: bug reports, ideas, code, design, better stroke paths, new animals and translations.

## Ways to help

- **Report a bug or suggest an idea:** open an issue. Say what device and browser you used, what you did, and what happened.
- **Fix or improve something:** fork the repository, make your change on a new branch, and open a pull request.

## Getting started

1. Install [Node.js](https://nodejs.org) 20 or newer.
2. Run `PORT=3000 node server.js` and open http://localhost:3000.
3. Change files in `public/` and refresh the page. Restart the server after changing `server.js`.

No build step and no packages: plain HTML, CSS and JavaScript on purpose, so anyone can open a file and change it.

Run the checks any time with `npm test`: it checks every JavaScript file, makes sure all 52 letters have strokes, animals, sounds and treats, and starts the server to test it.

## How changes reach the app

1. Make your change on a **new branch** (in your fork), named for what it does, e.g. `fix/treat-drag` or `feature/khmer-voice`.
2. Open a **pull request** into `main`. Fill in the checklist.
3. GitHub runs the **Checks** automatically. They must pass.
4. A maintainer reviews it. Nobody pushes straight to `main`, maintainers included.
5. Once merged, `main` is what runs at https://letter-zoo.public.koompi.cloud.

## Good first contributions

- **Stroke paths** (`public/letters.js`): make a letter look nicer or follow a different handwriting style. Keep the grid: top line `y=20`, middle `y=60`, base `y=100`, tail `y=130`, and draw each stroke in the direction a child writes it.
- **Animals** (`window.ANIMALS` and `window.ANIMAL_EXTRA` in `public/letters.js`): a friendlier animal, a better sound word, where it lives in the park.
- **Translations:** the app speaks English today; help us plan other languages (Khmer first!).
- **Accessibility:** screen readers, bigger touch targets, color contrast.

## Before you open a pull request

- Try it on a phone or tablet (or the browser's phone view), in light and night mode.
- Trace a few letters from start to finish, both capital and small.
- Keep it kind and simple: kids are the users. Short words, big buttons, no ads, no tracking of children.
- Never commit secrets (`.env`, tokens, codes).

## Privacy rules

Letter Zoo is used by young children. Contributions must not collect photos, exact locations, IP addresses or anything else that could identify a child, and must not add advertising or third-party trackers. The only name ever kept is the optional first name on the Champions board (letters only, no surname, shown with an animal buddy, unique); don't widen it.

## Be kind

Be friendly and patient with everyone, especially first-time contributors. Harassment of any kind is not welcome.

By contributing, you agree that your work is released under the project's [MIT license](LICENSE).
