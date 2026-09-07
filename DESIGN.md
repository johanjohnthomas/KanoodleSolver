# Kanoodle Solver Design System

## Source of truth
Active, 2026-09-07. The user's current brief replaces the previous specimen-workbench world with a physical 3D tabletop. Historical generated comps are no longer visual targets.
Product truth: PRODUCT.md, canonical 5 × 11 board, twelve piece matrices, exact solver, existing interaction tests.
Direction is pinned by the user: warm desk, realistic Kanoodle case, scattered bead pieces, visible rotation/flip animation. Impeccable's direction seed was consulted; the pinned physical scene takes precedence over its unrelated challengers.
The room extension preserves this world: a finite oak desk with legs, a framed window onto a quiet green countryside, and a sliding drawer containing the exact dedication “Made for Rach with love <3”.
Current extension: bring the 2D board up to the same tactile standard; start 3D at seated eye level; improve the outdoor view and add optional occasional birds, a plane and a car; expose Day, Sunset and Night scene settings. These user-requested ambient events are the exception to the no-idle-motion rule, with pause, reduced-motion and hidden-tab safeguards.

## Current view and atmosphere contract
- Drawer: a discoverable 3D-only Easter egg. No labeled drawer button, external note panel, announcement before discovery, or automatic page scrolling. Clicking/tapping the physical drawer reveals the textured card inside the scene; switching to 2D closes it. The puzzle remains fully keyboard-accessible, while the optional Easter egg is a spatial pointer/touch interaction.
- Camera: overhead keeps the player's orientation, with world +X screen-right and the far side of the board screen-up; no pole crossing, reverse view or 180° roll.
- Recovery: on a blocked Solve or Hint, find a completion retaining the maximum number of existing placements exactly. Highlight one minimum-cardinality set to lift in amber (shared recovery token), on 3D beads, 2D cells and piece selectors. Keep piece colors and letters. Explain that this is one closest completion, not a claim these pieces are intrinsically wrong. Offer an explicit undoable “Lift highlighted pieces” action; never remove automatically. Clear suggestions after any board change. No arbitrary capped search presented as a closest solution.
- 2D: a rounded dark Kanoodle case, connected glossy bead silhouettes for both placed and available pieces, exact green/red placement footprints, visible orientation changes and a brief seating animation. Preserve canonical gridcell labels and shared game state; hover/focus previews and touch placement must use the same collision checks. Show all twelve actual piece shapes, not just swatches. No screenshot substitutes or new dependencies.
- 2D layout: fit the whole 11-column board on narrow phones with at least 24px dense-grid cells and 44px general controls; offer a larger board when precision is needed. Piece palette wraps below the tray. Keyboard and touch must not require dragging, and invalid placement must preserve the prior board.
- 3D: initial camera sits on the player's side of the desk, looking slightly downward across the puzzle toward the window. Retain a close overhead view for precise placement. Keep the entire puzzle and drawer reachable on mobile.
- Atmosphere: Day is the default; Sunset and Night intentionally change sky, landscape and room lighting without hiding puzzle colors or reducing DOM readability. Day has pale blue sky and green hills; Sunset has warm apricot sky and amber key light; Night has navy sky, muted blue-green hills, moon/stars and warm interior light.
- Occasional life outside: one short event at a time (birds, plane, car), separated by quiet gaps. Motion can be paused explicitly; pause while the page or scene is hidden and disable ambient travel for reduced motion. Do not add sound or impact puzzle state. Settings remain semantic native controls, no modal or extra UI library.

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
Puzzle and DOM colors live in src/lib/tabletop.ts (DESK_COLORS, BEAD_COLORS); DESK_THEME supplies the corresponding CSS custom properties on the shell. Room-only materials and the dedication live in src/lib/room.ts. Light colors are named in DESK_COLORS.
The 2D tray/socket/feedback colors and flat shadows consume DESK_THEME directly. ROOM_DETAILS supplies all outdoor actor, celestial, bark and lamp material colors; ROOM_THEME exposes night/sunset DOM colors on the stage. These tokens preserve the reviewed appearance while keeping both views synchronized.
Component geometry: header 88px desktop/72px mobile; 44px control minimum; 38px selected bead; 16px rail bead; selected-piece text region 210px minimum; 1250px dock maximum; 1640px page maximum. The overhead camera fits 21.5 × 16 world units; room framing is specified under Motion & interaction. Tablet controls reserve 145px above the interactive canvas.
### Depth
Desk receives real shadows. Case has bevels, inset round sockets, hinges and a subtle embossed title.
Spheres use roughness .25, clearcoat .45; plastic case roughness .5. One broad upper-left key light, warm fill.
UI paper has a soft warm offset shadow, never ornamental bevels.

## 5. Components
- TabletopScene: responsive perspective 3D scene; seated, overhead, dragging, solved, WebGL-unavailable states. SceneCamera owns fitted framing and interruptible view transitions.
- RoomSettings: native time selector and ambient-motion checkbox; persisted Day, Sunset, Night and pause preferences. ROOM_ATMOSPHERES is the shared sky, landscape and lighting palette.
- OutdoorScene and OutdoorActivity: layered live countryside geometry and one passing actor at a time; DeskLamp supplies warm interior light after sunset.
- RoomWindow: framed glazing, sill, sky, layered hills and trees; hidden in overhead mode to keep the puzzle unobstructed.
- DeskFurniture: finite oak top, apron, legs, brass handle, lined sliding drawer and textured paper dedication; open/closed and reduced-motion states.
- Drawer Easter egg: only the physical mesh reveals the in-scene card; its accessible scene description changes after discovery. No visible DOM disclosure or external note.
- BeadPiece: shared connected sphere/cylinder geometry; scattered, selected/lifted, dragging, transforming, seated.
- KanoodleCase: rounded modeled body, 55 circular recesses, rim, hinges, latch.
- Drop footprint: exact transformed grid cells, green for valid and red for blocked; a visible textual result accompanies color.
- TabletopDock: selected letter, orientation, rotate left/right, flip, undo, hint, solve; disabled and working states.
- PieceRail: 12 semantic letter buttons with color swatch, selected and placed indication.
- PaperButton: shared semantic icon/label button, moss primary and quiet secondary, 44px target.
- SolverFeedback: integrated visible error card with Undo/Reset; role alert.
- AccessibleBoard: tactile semantic tray with 24–44px fitted cells and optional scrolling 44px precision cells; FlatPiece and FlatPiecePalette share canonical connected geometry. FlatTransformControls keeps three 44px turn/flip actions beside the tray on phones. Exact same state and operations as 3D.
- SoundToggle: explicit persisted opt-in, no autoplay.

## Motion & interaction
Room discovery: tapping the drawer's wooden front slides it forward 4 world units, revealing a textured paper card inside 3D. Closing reverses the same interruptible motion. No DOM note, labeled discovery button, page scrolling or unsolicited sound; reduced motion sets the final drawer position immediately.
Room materials extend the existing oak/ivory/moss palette with plaster #e8dfcf, floor #c6b69d, window trim #faf3e5, sky #b6d9df, distant hills #a6bfa5, near hills #708e6d and drawer lining #68715c. The geometry, frame, handle, and note are live meshes, not a flattened scene image.
The seated perspective camera is at (0, 8.5, 24), looking at (0, -0.5, -1.5), fitting 28 world units wide / 28 tall. Overhead is at (0, 32, 4), looking at (0, 0, 0), fitting 21.5 × 16 with a small player-side tilt to avoid a camera pole crossing. View changes damp position, target and field of view at rate 8; reduced motion switches immediately. Initial rendering starts seated without an entrance sweep. Desktop stage height is clamp(620px, 75vh, 840px); phone controls reserve 145px above the room canvas (220px below 375px).
Pickup raises one piece .8 world units, deepening its contact shadow.
Rotation is a continuous quarter-turn around the group's vertical axis; flip turns the entire group 180 degrees over its local depth axis.
Animation uses frame-rate-independent exponential damping (rate 14 position / 12 rotation) and shortest continuous angular targets, including 270→0.
Pointer tracking uses a horizontal raycast plane; drop origin is derived from the transformed bounding box.
Release over a valid board origin snaps the whole group into its sockets. Invalid release returns to its previous location and leaves board state unchanged.
Dragging a placed piece fully clear of the case onto the finite tabletop previews a return in the existing status line. Release reuses the undoable Return to desk action and the existing damped motion to its scattered home. The whole transformed footprint must fit on the desk and clear the case; rim, blocked-cell and off-desk drops preserve the board. Reduced motion settles immediately. No new motion library or idle effect is needed for this geometry-backed interaction.
Keyboard A left, D/R right, F flip, Escape cancel. Labeled buttons expose the same orientation operation.
No idle puzzle motion or momentum. Outdoor passes are user-requested ambience: birds travel for 10 seconds, then 15 seconds quiet; plane 11 seconds, then 18 seconds quiet; car 9 seconds, then 24 seconds quiet. The first event waits 6 seconds. Pause cancels timers and removes actors; hidden scenes and reduced motion use the same boundary. Render only while movement/lighting updates require it.
Reduced motion skips entrance and interpolation, retains exact orientation, footprint and text feedback.
Motion for React animates dock/status/press; Three frame loop animates physical objects.
FlatPiece turns the whole connected silhouette into its canonical orientation with a 420-stiffness / 32-damping spring; reflection follows the visual axis at the current rotation. Placed beads seat from scale .72 to 1 with a 500 / 28 spring. MotionConfig respects the user's reduced-motion preference. Flat tray radii are 26px outer / 18px inner, reduced to 20px / 14px on phones; socket, lip, bead, valid and invalid colors match the physical board palette.

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
Blocked arrangement: RecoveryGuide and amber #e7b858 outlines identify one minimal set to lift, with an explicit undoable action. Recovery scrolls the play surface into view, unlike the hidden drawer. Canonical piece colors remain intact; matching letters and guide text make color optional. Search tests establish cardinality minimality and an actual full-board witness.
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
