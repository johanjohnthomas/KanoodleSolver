# Kanoodle Solver

A quiet desk, twelve colorful pieces, and a puzzle worth sitting down for.

Kanoodle Solver is an interactive puzzle app for the standard **5 × 11 Kanoodle board**. Play on a fully modeled 3D desk or switch to a keyboard-accessible 2D tray. Recreate a physical puzzle, check whether it can be completed without spoilers, or ask for a hint when you need one. All solving happens in your browser, with no account or backend required.

**[Play Kanoodle Solver](https://johanjohnthomas.github.io/KanoodleSolver/)**

## Features

- **A desk to settle into.** A raised start view leads into an animated overhead game. A countryside window, day/sunset/night lighting, occasional outdoor activity, and optional interaction sounds bring the room to life.
- **Pieces that feel physical.** Connected bead pieces rotate, flip, and move as a whole. Drag them onto the board, preview valid or blocked placements, reposition them, or return them to the desk. Undo restores your previous arrangement.
- **As much help as you want.** Check solvability without revealing anything, request one verified hint, or fill the board with a complete solution.
- **A way out of dead ends.** If your arrangement cannot be completed, Hint and Solve highlight a smallest set of pieces to lift while preserving every other placement. Nothing is removed until you choose to lift them.
- **Ready-made challenges.** Easy, medium, and hard starting positions are generated from valid solutions.
- **Two views, one puzzle.** The 3D desk and tactile 2D tray share the same board state. Desktop, tablet, and phone layouts support pointer, touch, and keyboard controls, reduced motion, and an automatic 2D fallback when WebGL is unavailable.

## How to play

1. Press **Play** to move from the desk into the overhead game, or choose **2D board** to begin in the accessible tray.
2. Pick a piece from the desk or its letter in the rail. Drag it into the case, or select a board position. Rotate or flip it to fit; the placement preview shows whether the move is valid.
3. Build your own arrangement or choose a difficulty under **Start a challenge**.
4. Keep playing independently, or use one of the solver actions below.

| Action | What it reveals |
| --- | --- |
| **Check solvability** | Only whether the current layout can be completed. No hints, solution, or removal highlights; your board and Undo history stay unchanged. |
| **Hint** | One move from a verified complete solution. If the layout is blocked, it highlights a smallest set of pieces to lift instead. |
| **Solve board** | A complete solution that preserves your placed pieces. If none exists, it offers the same minimal-removal guidance. |

Select a placed piece to move it, or drag it fully clear of the case onto the tabletop to return it to the desk. **Undo** restores its previous placement. **Desk view** returns to the start screen without resetting your puzzle; press Play to resume.

### Controls

| Input | Action |
| --- | --- |
| Drag, click, or tap | Pick up and place a piece |
| **A** | Rotate left |
| **D** or **R** | Rotate right |
| **F** | Flip |
| **Escape** | Cancel the current selection |

Rotation and flipping also work while dragging. The on-screen controls provide the same actions on touch devices. In 2D, hover or focus a cell to preview a placement; **Use larger cells** opens a scrollable precision board on narrow screens.

Open **Room settings** to choose Day, Sunset, or Night and pause outdoor activity. Room preferences are saved locally. Ambient activity pauses offscreen and respects reduced motion; sound is opt-in.

## How the solver works

The twelve pieces cover exactly 55 cells. The solver searches unique rotations and reflections, validates existing placements, and uses a minimum-remaining-values strategy: it chooses the empty cell with the fewest legal placements, tries a candidate, and backtracks when needed.

Hints come from complete solutions rather than locally plausible moves. When a board has no solution, the recovery search finds a completion requiring the fewest placed pieces to be removed. Retained pieces keep their exact positions and orientations.

The supported puzzle is the standard flat 5 × 11 tray. The 3D view is a presentation of that board, not a solver for pyramid or other Kanoodle variants.

## Built with

Next.js, React, and TypeScript power the app; Three.js and React Three Fiber render the desk and pieces. Motion handles interface feedback, and Phosphor supplies the icons. The app is statically exported and hosted on GitHub Pages.

## Local development

Install Node.js and npm, then run:

```bash
git clone https://github.com/johanjohnthomas/KanoodleSolver.git
cd KanoodleSolver
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). No environment variables, API keys, or backend services are needed for local development.

### Tests and production build

```bash
npm test -- --runInBand
npx tsc --noEmit
npm run lint
npm run build
```

The production static site is written to `out/`. Unit and integration tests cover the solver, recovery, board state, interactions, room settings, and start/resume flow.

Real-browser checks use Playwright with an installed Google Chrome. With the development server running, for example:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 node scripts/qa-start-game.mjs
PLAYWRIGHT_BASE_URL=http://localhost:3000 node scripts/qa-tabletop.mjs
```

Additional scripts in [`scripts/`](scripts/) cover mobile layout, touch and keyboard access, drawer interactions, both board views, outdoor animation, recovery, and returning pieces to the desk. They save screenshots and results under `.omo/evidence/`. Set `PLAYWRIGHT_BASE_URL` to a served static export or another deployment to test that build instead.

### Deployment

The [GitHub Actions workflow](.github/workflows/deploy-pages.yml) tests, builds, and deploys the app to [GitHub Pages](https://johanjohnthomas.github.io/KanoodleSolver/) on pushes to `master` or `main`.

For a fork, enable Pages with **GitHub Actions** as the deployment source. The build derives its base path from `GITHUB_REPOSITORY`, so project pages use the repository's own path.

## Feedback

Found a bug or have an idea? [Open an issue](https://github.com/johanjohnthomas/KanoodleSolver/issues) with the steps to reproduce it, your browser/device, and a screenshot when useful.

This is an independent fan-made project, not an official Kanoodle product.
