# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Inferred: Kanoodle owners who are stuck on a physical puzzle and want to reproduce their board, request one useful hint, or reveal a complete solution.
- Inferred: Casual puzzle players exploring how the twelve pieces tile the standard 5 × 11 tray on desktop, tablet, or phone.

## Product Purpose

Kanoodle Solver turns a partially filled standard Kanoodle tray into an interactive, solvable puzzle. Success means a visitor can place the pieces they already have, verify that the position is legal, get a hint that still leads to a solution, or complete the board automatically without an account or server.

## Positioning

The product solves from the visitor’s exact board state in the browser. Its hints are not locally convenient guesses: every hint is taken from a verified complete solution that preserves the pieces already placed.

## Operating Context

The primary use scene is beside a physical Kanoodle tray. The interface must work one-handed on touch screens as well as with mouse and keyboard, make piece orientation obvious, and return useful feedback quickly without network requests.

## Capabilities and Constraints

- The canonical supported puzzle is the twelve-piece, 55-cell, 5 × 11 rectangular tray represented by the repository’s piece data.
- Users can select, rotate, flip, place, move, and remove pieces; start from a guaranteed-solvable challenge; reset; request a hint; or reveal a complete solution.
- Solving runs entirely client-side and the application must support a static GitHub Pages export.
- Inferred: decorative partial-area layouts are excluded until each has a defined piece subset and verified puzzle catalog.
- No account, persistence, analytics, server API, pricing, or commercial claim is required.

## Brand Commitments

- Keep the product name “Kanoodle Solver.”
- The experience should feel playful, tactile, precise, and calm rather than toy-like or technical.
- Motion is reserved for board-state changes and interaction feedback, with a complete reduced-motion path.

## Evidence on Hand

- `src/data/pieces.json` contains the twelve piece geometries.
- `src/lib/solver.ts` and its tests provide the local solver behavior.
- No logo, licensed imagery, testimonials, benchmarks, or official Kanoodle brand assets are supplied; the interface must not fabricate them.

## Product Principles

1. Never offer a hint that cannot be completed.
2. Make the physical-to-digital board transfer faster than trial and error.
3. Keep every core action usable by pointer, touch, and keyboard.
4. Explain the current state and the next useful action in plain language.
5. Preserve privacy and portability by solving locally.

## Accessibility & Inclusion

- Inferred target: WCAG 2.2 AA.
- Color cannot be the only piece identifier; each piece also carries a visible letter and accessible name.
- Focus, touch targets, status announcements, and reduced motion are first-class requirements.
