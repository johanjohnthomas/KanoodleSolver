# Kanoodle Solver

An accessible, client-side solver for the standard 5 × 11 Kanoodle tray. Recreate the pieces already on your physical board, rotate or flip the remaining pieces, request a guaranteed-solvable hint, or reveal a complete solution.

## What works

- Complete backtracking solver across all unique rotations and reflections
- Seeded-board validation that preserves pieces already placed
- Hints selected only from a verified complete solution
- Guaranteed-solvable easy, medium, and hard starting positions
- Pointer, touch, and keyboard-friendly placement and removal
- Interactive 3D desk with a modeled case, recessed sockets, and connected bead pieces
- Whole-piece animated rotation, flipping, pickup and placement with live drop previews
- Optional sound, an overhead camera, and an equivalent keyboard-accessible 2D board
- Responsive interface with reduced-motion and non-WebGL support
- Static export and automatic GitHub Pages deployment

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify

```bash
npm test -- --runInBand
npm run build
npm run doctor
```

The static export is written to `out/`.

For real-browser 3D interaction and responsive checks, serve `out/` locally and run `node scripts/qa-tabletop.mjs` (requires Chrome). Set `PLAYWRIGHT_BASE_URL` to test another deployment. Screenshots and results are saved under `.omo/evidence/tabletop/`.

## Tabletop controls

Pick a piece from the desk or its letter in the rail, then drag it into the case or click a position. Use **A** to turn left, **D/R** to turn right, **F** to flip, and **Escape** to put it back. The labeled controls do the same on touch devices. Select a placed piece to move it or return it to the desk. The **2D board** view uses the same puzzle state and supports keyboard placement.

## GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` tests, builds, uploads, and deploys the static export whenever `master` or `main` is pushed. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

For this repository, the expected project URL is:

<https://johanjohnthomas.github.io/KanoodleSolver/>

The Next.js base path is derived from `GITHUB_REPOSITORY` during the Actions build, so forks and renamed repositories deploy under their own repository path.

## Solver model

The twelve included pieces cover exactly 55 cells. The solver deduplicates symmetric orientations, preflights board area, and uses a minimum-remaining-values search: it chooses the empty cell with the fewest legal candidate placements, tries each candidate, and backtracks until the board is complete or every possibility is exhausted.
