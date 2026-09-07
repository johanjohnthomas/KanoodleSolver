# Kanoodle Solver Design System

## Source of truth
Active, 2026-09-07. The user's current brief replaces the previous specimen-workbench world with a physical 3D tabletop. Historical generated comps are no longer visual targets.
Product truth: PRODUCT.md, canonical 5 × 11 board, twelve piece matrices, exact solver, existing interaction tests.
Direction is pinned by the user: warm desk, realistic Kanoodle case, scattered bead pieces, visible rotation/flip animation. Impeccable's direction seed was consulted; the pinned physical scene takes precedence over its unrelated challengers.

## 0. Research Log
- Existing UI review: large framed panels and square cells obscure the physical puzzle. Keep warmth; replace the framing and specimen drawer.
- Product reference: classic Kanoodle black portable case and colorful connected spherical pieces. No official logo or licensed assets are copied.
- Three.js and React Three Fiber v9: mesh events, ray/plane intersections, orthographic camera, demand rendering, soft shadow maps, React 19 compatibility. Sources: r3f.docs.pmnd.rs/api/events, /api/canvas, /tutorials/v9-migration-guide.
- Motion/beui button and action-swap mechanisms retained from prior research: interruptible press response, reduced-motion path. 3D rotations are a novel geometry-backed mechanism, using frame-delta damping with continuous angles.
- No bitmap mock is authoritative: the actual lit interactive scene is the design artifact. Procedural geometry and wood material avoid static-image substitutes.

## Brand
Warm, curious, tactile, unhurried. A real puzzle on a quiet desk.
Avoid chunky dashboard panels, faux screws, ruler ornaments, decorative badges, glossy UI chrome, instructions that hide the board.

## Product goals
Recreate a physical board, explore solvable challenges, receive a guaranteed hint, reveal a complete solution.
Pieces lift, rotate, turn over, and settle as complete connected objects.
No account or server. Existing undo, reset, clear, hint, solve, and sound remain.

## Personas and jobs
- Physical-puzzle owner: match real pieces to the board and get unstuck.
- Casual player: pick up scattered pieces and discover their orientation.
- Keyboard/touch user: select a piece, transform with labeled controls, place without dragging.
- Low-motion or non-WebGL device: use an equivalent semantic 2D board.

## Information architecture
One primary route. Small header contains brand, challenge selection, help, sound and view toggle.
The first viewport is the desk with case and scattered pieces. A brief invitation lives above the scene.
A compact dock below holds current piece, rotate/flip, undo and solve/hint.
A small piece-letter rail provides keyboard access and precise selection without cluttering the desk.
Status and failure recovery remain adjacent to the play surface.
The existing /showcase route remains a working component harness.

## Design principles
- Actual modeled depth, coherent lighting, and connected spherical geometry carry realism.
- UI is peripheral to the play surface.
- Every animation communicates pickup, orientation, placement, or feedback.
- The solver's canonical grid is the only placement authority.
- Color plus a persistent piece letter identifies each object.

## Visual language
### Color
DOM tokens: warm ivory #f5f0e7, paper #fffaf2, ink #343b32, muted ink #69705f, moss #405743, faint line #d8d4c8.
World tokens: desk #dfc8a8, grain #b49169, tray #222824, lip #343d36, sockets #101713, brass #b3a481.
Bead palette A–L: coral #e56d45, violet #8655be, ice #8bc9d2, tangerine #ef9a36, blue #467bd0, cream #ede0c4, cyan #3cb4bf, pink #e67fa4, ruby #cf4554, green #58a26d, lemon #d7c649, plum #ad729d.
Success #42704f; error #a34237. Same palette drives DOM swatches and Three materials.
### Typography
Bricolage Grotesque for brand; DM Sans for controls; editorial display uses the self-hosted Lora family.
Type scale: 10px rail annotation, 11px mobile helper, 12px small, 13px compact controls, 14px UI, 15px selected letter, 16px body, 20px feedback heading, 22px count, 25px wordmark, 32px mobile invitation, clamp(32px, 3.1vw, 48px) desktop invitation.
Spacing: 4/8/12/16/20/24/32/40/48/64px. Rounded buttons 10px, paper dock 18px.
World and DOM colors have one source in src/lib/tabletop.ts (DESK_COLORS, BEAD_COLORS); DESK_THEME supplies the corresponding CSS custom properties on the shell. Light colors are named in DESK_COLORS.
Component geometry: header 88px desktop/72px mobile; 44px control minimum; 38px selected bead; 16px rail bead; selected-piece text region 210px minimum; 1250px dock maximum; 1640px page maximum. Camera fits 21.5 world units in width and 13.8 in height (16 overhead). Tablet controls reserve 145px above the interactive canvas.
### Depth
Desk receives real shadows. Case has bevels, inset round sockets, hinges and a subtle embossed title.
Spheres use roughness .25, clearcoat .45; plastic case roughness .5. One broad upper-left key light, warm fill.
UI paper has a soft warm offset shadow, never ornamental bevels.

## 5. Components
- TabletopScene: responsive orthographic 3D scene; default, overhead, dragging, solved, WebGL-unavailable states.
- BeadPiece: shared connected sphere/cylinder geometry; scattered, selected/lifted, dragging, transforming, seated.
- KanoodleCase: rounded modeled body, 55 circular recesses, rim, hinges, latch.
- Drop footprint: exact transformed grid cells, green for valid and red for blocked; a visible textual result accompanies color.
- TabletopDock: selected letter, orientation, rotate left/right, flip, undo, hint, solve; disabled and working states.
- PieceRail: 12 semantic letter buttons with color swatch, selected and placed indication.
- PaperButton: shared semantic icon/label button, moss primary and quiet secondary, 44px target.
- SolverFeedback: integrated visible error card with Undo/Reset; role alert.
- AccessibleBoard: alternate semantic board with 44px cells, exact same state and operations.
- SoundToggle: explicit persisted opt-in, no autoplay.

## Motion & interaction
Scene entry: camera settles from a slightly wider/higher view, once, <=900ms.
Pickup raises one piece .8 world units, deepening its contact shadow.
Rotation is a continuous quarter-turn around the group's vertical axis; flip turns the entire group 180 degrees over its local depth axis.
Animation uses frame-rate-independent exponential damping (rate 14 position / 12 rotation) and shortest continuous angular targets, including 270→0.
Pointer tracking uses a horizontal raycast plane; drop origin is derived from the transformed bounding box.
Release over a valid board origin snaps the whole group into its sockets. Invalid release returns to its previous location and leaves board state unchanged.
Keyboard A left, D/R right, F flip, Escape cancel. Labeled buttons expose the same orientation operation.
No idle looping motion or momentum. Render only while movement/lighting updates require it.
Reduced motion skips entrance and interpolation, retains exact orientation, footprint and text feedback.
Motion for React animates dock/status/press; Three frame loop animates physical objects.

## Responsive behavior
1280+: full desk composition with board centered and scattered pieces around the perimeter/foreground; controls below.
768: scene scales to the available width; controls wrap.
375: same complete 3D board, selected-piece rail and controls remain 44px. A top-view option improves precise targeting. 2D view provides larger scrolling cells.
No body horizontal overflow. Controls never overlap scene hit targets.

## Accessibility
Semantic DOM controls and live announcements supplement canvas. Piece rail is the keyboard equivalent of selecting a mesh.
2D board supports all operations without WebGL or pointer dragging. Visible focus and native buttons.
Reduced motion and optional audio. Real text identifies current piece and transform, preview validity and failure.
A help disclosure explains placement, movement and shortcuts without blocking play.

## Interaction states
Loading: visible desk placeholder with concise loading status.
Empty: board open, all twelve pieces on desk.
Working: solve/hint controls disabled, clear status.
Invalid: no board mutation, visible drop reason and return motion.
Unsolvable: prominent in-flow feedback and recovery.
Solved: all 55 cells filled; primary action becomes New puzzle.
Offline: fully local after initial static assets load.
WebGL unavailable: semantic 2D mode offered automatically.

## Content voice
Short, warm, literal. “A little room to think.” is the invitation. Buttons describe real actions. No fabricated claims.

## Implementation constraints
Next 15 / React 19 static export, existing npm toolchain. Three.js + R3F v9 implement the requested 3D feature. No physics engine or external model download.
Reuse canonical solver, piece matrices, gameBoard and audio. Keep new modules focused and <=250 source lines.
Split the WebGL bundle from the initial DOM shell. Clamp device pixel ratio and use bounded shadows/segments.
Verify 3D mesh selection, dragging, turn/flip motion, occupied movement, failure recovery, keyboard/2D equivalent, reduced motion and desktop/mobile rendering before Pages deployment.

## Accepted debt
No intentional functional or accessibility debt. The model is a stylized classic case, not an official product CAD asset.

## Open questions
None blocking; classic 12-piece rectangular Kanoodle is the repository's supported edition.
