# Kanoodle Solver Design System

## 0. Research Log

- Embedded refs: shortlisted Figma, Miro, and PlayStation; selected the existing-project redesign discipline plus Figma’s monochrome-tool/chromatic-content separation because the puzzle pieces, not the chrome, should carry color.
- Lazyweb: 2 searches, 6 screens viewed (LA Times Sudoku, Boston Globe Sudoku, CNN Sudoblock, Slite canvas, GitBook canvas, Figma canvas). Harvested one dominant play surface, peripheral tool controls, immediate entry actions, and restrained status chrome.
- Imagen drafts: `.impeccable/mocks/decision/kanoodle-bench-a.png`, `.impeccable/mocks/decision/kanoodle-bench-selected.png`, `.impeccable/mocks/decision/kanoodle-bench-mobile.png`. Selected `kanoodle-bench-selected.png` as the desktop composition contract and `kanoodle-bench-mobile.png` as responsive intent.
- Interaction reference: beui.dev `action-swap`; adapted its blur-and-scale state replacement and live reduced-motion branch for solver status and action feedback.
- Direction: Impeccable’s concept roll selected the fifth grounded direction, a jeweler’s sorting bench. The assigned system beat the surreal garden, iridescent cloud, CRT arcade, oscilloscope, pop sleeve, and ruling-engine challengers on product clarity; it keeps the oscilloscope’s precise state legibility and the ruling engine’s disciplined hairlines as raises.

## Source of truth

Status: Active
Date: 2026-09-07
Product surfaces: the single-page responsive Kanoodle board, its piece tray, action controls, instructions, and status feedback.
Evidence reviewed: `PRODUCT.md`, incumbent page/components/styles, solver and piece data, six Lazyweb screens, Figma design reference, and the three generated comps above.

## 1. Atmosphere & Identity

The interface is a calm puzzle workbench: warm, tactile, and exact. The signature is the **specimen tray**: a graphite recessed board and piece drawer set on bone paper, with hairline measurement marks and small copper instrument details. The chrome stays nearly achromatic so the twelve enamel-like pieces remain the subject.

### Brand

- Personality: tactile, ingenious, patient, quietly playful.
- Trust signals: real board geometry, plain-language solver state, local-compute note, deterministic hint behavior.
- Avoid: childish toy styling, neon gaming chrome, generic SaaS cards, glass panels, unearned statistics, and official-product claims.

### Product goals

- Reproduce a physical starting position quickly.
- Keep every manual placement legal and reversible.
- Make hints and full solutions visibly trustworthy.
- Fit the full workflow into one page without navigation or account friction.
- Non-goals: leaderboards, social play, analytics, multiple unsupported board geometries.

### Personas and jobs

- Physical-puzzle owner: transcribes placed pieces, then asks for a hint or solve.
- Casual explorer: starts a guaranteed-solvable challenge and learns piece transformations.
- Keyboard or low-motion user: completes the same flow without drag gestures or spatial animation.

## 2. Color

### Palette

| Role | Token | Value | Usage |
| --- | --- | --- | --- |
| Canvas | `--surface-canvas` | `#F3E8D2` | Page ground |
| Canvas shade | `--surface-canvas-deep` | `#E5D3B5` | Instrument wells, quiet bands |
| Tray | `--surface-tray` | `#24231F` | Board and action rail |
| Tray raised | `--surface-tray-raised` | `#34312B` | Controls, selected wells |
| Tray recess | `--surface-tray-recess` | `#191815` | Board cells |
| Ink | `--text-primary` | `#26231E` | Primary copy on canvas |
| Ink muted | `--text-secondary` | `#716659` | Supporting copy |
| Chalk | `--text-on-dark` | `#FFF7E8` | Copy on tray |
| Copper | `--accent-copper` | `#A7582F` | Focus, selected state, primary action |
| Copper bright | `--accent-copper-bright` | `#D18453` | Hover and active instrument details |
| Success | `--status-success` | `#39705B` | Valid placement, solved state |
| Error | `--status-error` | `#A43F35` | Invalid placement and unsatisfiable state |
| Piece A-L | `--piece-a` … `--piece-l` | tangerine, plum, slate, orange, cobalt, stone, cyan, coral, red, forest, citron, cream | Piece fill only |

### Rules

- Chrome uses canvas, graphite, ink, and copper. Piece colors never become page accents.
- Each piece has a letter; color never carries identity alone.
- Focus uses a 2px dashed copper outline with 3px offset, echoing selection handles without copying Figma’s chrome.

## 3. Typography

### Font stack

- Display: `Bricolage Grotesque`, sans-serif; weight 650–750.
- UI/body: `DM Sans`, sans-serif; weight 400–650.
- Numeric measurements: UI font with `font-variant-numeric: tabular-nums`.

### Scale

| Level | Size | Weight | Line height | Tracking | Usage |
| --- | --- | --- | --- | --- | --- |
| Display | `clamp(2.25rem, 5vw, 4.75rem)` | 700 | 0.96 | -0.035em | Product title |
| H1 | `clamp(1.75rem, 3vw, 2.5rem)` | 700 | 1.05 | -0.025em | Major section heading |
| H2 | `1.375rem` | 650 | 1.2 | -0.015em | Workbench groups |
| Body large | `1.125rem` | 450 | 1.55 | -0.01em | Intro and state |
| Body | `1rem` | 450 | 1.55 | -0.005em | Controls and instructions |
| Small | `0.875rem` | 550 | 1.4 | 0 | Metadata |
| Label | `0.75rem` | 650 | 1.2 | 0.06em | Measurements and compact status |

## 4. Spacing & Layout

- Base unit: 4px.
- Tokens: `--space-1: 4px`, `--space-2: 8px`, `--space-3: 12px`, `--space-4: 16px`, `--space-5: 20px`, `--space-6: 24px`, `--space-8: 32px`, `--space-10: 40px`, `--space-12: 48px`, `--space-16: 64px`.
- Content max: 1440px; page gutters use `clamp(16px, 3vw, 48px)`.
- Desktop: title/status header; board plus selected-piece inspector; action rail and piece drawer below.
- Tablet: board first; inspector and actions become a two-column band; tray wraps below.
- Mobile: one column, the board keeps 44px cell targets and scrolls horizontally inside a clearly bounded tray; inspector follows, action dock wraps to two rows and remains in document flow. Touch accessibility outranks fitting all 11 columns into a 375px viewport.
- The board is always 11 columns by 5 rows. Cell size uses `min()`/container width rather than hardcoded drag geometry.

### Information architecture

1. Product title, one-sentence task, local status.
2. Dominant board with selected-piece preview and placement feedback.
3. Instrument controls for orientation and solver actions.
4. Available-piece specimen drawer.
5. Short “How it works” disclosure and source link.

## 5. Components

### Instrument button

- Structure: semantic `<button>` with Phosphor icon, visible label, optional working state.
- Variants: primary copper, dark tray, quiet canvas.
- States: default, hover, active press, dashed focus, disabled, working, success/error label swap.
- Accessibility: 44px minimum target, `aria-pressed` for toggles, status text never icon-only.
- Motion: Motion spring press (`stiffness: 420`, `damping: 30`); reduced motion removes scale.

### Puzzle board and cell

- Structure: labelled `role="grid"`; each active cell is a button with row/column and occupancy name.
- Variants: empty, occupied, valid preview, invalid preview, selected piece.
- States: hover/focus previews, click/tap placement, occupied click removal, disabled during solving.
- Accessibility: roving-free native tab order, clear cell labels, status announced after placement.
- Motion: piece cells fade/scale in as one placement event; no per-cell cascade.

### Piece specimen

- Structure: selectable button containing a compact shape diagram and letter.
- Variants: available, selected, placed.
- States: selected well, hover lift, active press, focus, placed/disabled.
- Accessibility: letter plus descriptive name; selected state via `aria-pressed`.
- Motion: shared selected-outline transition; reduced motion uses instant outline change.

### Inspector

- Structure: selected piece preview, rotate-left, rotate-right, flip, and remove when placed.
- Empty state: “Choose a piece from the tray.”
- Error state: explains why a placement failed and leaves orientation intact.
- Motion: blur/opacity state swap adapted from beui.dev `action-swap`, 180ms ease-out.

### Status strip

- Structure: live region with piece count, solver state, and “solves locally” note.
- States: ready, placing, solving, solved, unsatisfiable.
- Motion: restrained blur/opacity swap; never loops.

## 6. Motion & Interaction

| Token | Value | Usage |
| --- | --- | --- |
| `--motion-micro` | 120ms ease-out | Color and opacity feedback |
| `--motion-standard` | 220ms ease-in-out | Inspector/state swap |
| placement spring | stiffness 360, damping 28, mass 0.8 | Whole-piece placement |
| press spring | stiffness 420, damping 30, mass 0.6 | Button press |

- Motion communicates selection, placement, removal, solver progress, or completion.
- Spatial motion uses Motion for React; simple color transitions remain CSS.
- `MotionConfig reducedMotion="user"` is mandatory. Reduced motion replaces transforms with opacity/color feedback.
- Solver work is synchronous but staged through React transition/state messaging so the pressed control visibly enters a working state first.

## 7. Depth & Surface

Strategy: mixed material depth, with a single top-left light source.

- Canvas is flat with a faint paper-fiber texture built from low-contrast CSS noise-like radial marks, not a repeating grid.
- Tray shadow: offset down/right, broad warm umber blur.
- Tray recess: inset shadow only; cell seams use hairline copper-tinted borders.
- Raised controls: one outer shadow and one subtle inner highlight; no border plus shadow duplication.
- Piece material: restrained multi-stop highlight and bottom inset shade driven by each piece token.

## 8. Accessibility Constraints & Accepted Debt

### Constraints

- WCAG 2.2 AA: 4.5:1 body contrast, 3:1 large text and non-text UI boundaries.
- Full keyboard operation, visible focus, 44px touch targets, live status announcements, semantic buttons/grid labels.
- The full task survives 200% zoom, 320px CSS width, coarse pointer, and `prefers-reduced-motion: reduce`.
- Instructions never depend on drag-and-drop; click/tap placement is primary.

### Accepted debt

None.

## Interaction states

- Loading/working: action label becomes “Solving…” or “Finding a hint…” and competing solver actions disable.
- Empty: empty board plus “Choose a piece or start a challenge.”
- Error: retain the board and selected piece, announce that the current arrangement has no complete solution, offer Undo or Reset.
- Success: complete board, solved status, primary action becomes “New puzzle.”
- Offline/slow network: no functional impact after the static page loads; solving is local.

## Content voice

Warm, concise, and literal. Controls name actions (“Rotate left,” “Solve board”). Errors identify the problem and recovery. Avoid gamey hype, unexplained jargon, and fabricated performance claims.

## Implementation constraints

- Next.js 15 App Router, React 19, Tailwind CSS 4 plus project CSS tokens.
- Motion from `motion/react`; Phosphor icons; no Bklit charts because the product has no data-visualization need; no KokonutUI component unless a single compatible source pattern reduces code without adding shadcn infrastructure.
- Static export for GitHub Pages; no server features or runtime API.
- The solver and UI remain strictly typed and test-covered; source files stay within the 250 pure-LOC ceiling.
- Fresh screenshots at 375px, 768px, and 1280px plus keyboard and reduced-motion checks are required before release.

## Open questions

- [ ] Repository owner/name determine the final public Pages URL; deployment config derives the base path from GitHub Actions automatically.
