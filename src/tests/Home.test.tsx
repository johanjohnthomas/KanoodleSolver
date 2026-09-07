import { describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import Home from "../app/page";

// WebGL is exercised in the real-browser scene checks; jsdom covers semantic controls.
jest.mock('@/components/tabletop/TabletopScene', () => ({ TabletopScene: () => null }));

describe("Kanoodle Solver page", () => {
  it("renders the complete standard tray and piece set", () => {
    // Given / When
    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: '2D board' }));

    // Then
    expect(screen.getByRole("heading", { name: "Kanoodle Solver" })).toBeTruthy();
    expect(screen.getAllByRole("gridcell")).toHaveLength(55);
    expect(screen.getByRole("button", { name: "Piece A" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Piece L" })).toBeTruthy();
  });

  it("places the selected piece from a board-cell click", () => {
    // Given
    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: '2D board' }));
    fireEvent.click(screen.getByRole('button', { name: 'Piece A' }));

    // When
    fireEvent.click(screen.getByRole("gridcell", { name: /Row 1, column 1, empty/ }));

    // Then
    expect(screen.getByRole("gridcell", { name: /Row 1, column 1, piece A/ })).toBeTruthy();
    expect(screen.getByLabelText('1 of 12 pieces placed')).toBeTruthy();
  });

  it("solves an empty standard board", async () => {
    // Given
    render(<Home />);

    // When
    fireEvent.click(screen.getByRole("button", { name: "Solve board" }));

    // Then
    await waitFor(() => expect(screen.getByText("Board solved. Every cell is covered.")).toBeTruthy(), {
      timeout: 9000,
    });
    expect(screen.getByLabelText('12 of 12 pieces placed')).toBeTruthy();
  }, 10000);
});
