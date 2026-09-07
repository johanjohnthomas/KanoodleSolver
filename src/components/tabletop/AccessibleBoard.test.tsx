import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen, within } from '@testing-library/react';

import Home from '@/app/page';

jest.mock('@/components/tabletop/TabletopScene', () => ({ TabletopScene: () => null }));
Element.prototype.scrollIntoView = jest.fn();

const openFlatBoard = (): void => {
  render(<Home />);
  fireEvent.click(screen.getByRole('button', { name: '2D board' }));
};

describe('AccessibleBoard', () => {
  it('keeps the local orientation controls disabled until a piece is held', () => {
    // Given / When
    openFlatBoard();

    // Then
    expect(screen.getByRole('button', { name: 'Turn piece left' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Turn piece right' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Turn piece over' }).hasAttribute('disabled')).toBe(true);
  });

  it.each([
    ['Turn piece left', 'Piece C · 270° · face up'],
    ['Turn piece right', 'Piece C · 90° · face up'],
    ['Turn piece over', 'Piece C · 0° · turned over'],
  ])('%s updates the nearby orientation summary', (action, expectedSummary) => {
    // Given
    openFlatBoard();
    fireEvent.click(screen.getByRole('button', { name: 'Select piece C' }));

    // When
    fireEvent.click(screen.getByRole('button', { name: action }));

    // Then
    expect(screen.getByText(expectedSummary)).toBeTruthy();
  });

  it('offers all twelve canonical pieces in the dedicated palette', () => {
    // Given / When
    openFlatBoard();

    // Then
    const palette = screen.getByRole('group', { name: '2D piece palette' });
    expect(within(palette).getAllByRole('button')).toHaveLength(12);
  });

  it('shows the exact valid footprint when a cell is previewed', () => {
    // Given
    openFlatBoard();
    fireEvent.click(screen.getByRole('button', { name: 'Select piece A' }));

    // When
    fireEvent.mouseEnter(screen.getByRole('gridcell', { name: 'Row 1, column 1, empty' }));

    // Then
    expect(document.querySelectorAll('[data-preview="valid"]')).toHaveLength(5);
    expect(screen.getByText('Piece A fits here. Choose this cell to place it.')).toBeTruthy();
  });

  it('shows the same footprint when a keyboard user focuses a cell', () => {
    // Given
    openFlatBoard();
    fireEvent.click(screen.getByRole('button', { name: 'Select piece A' }));

    // When
    fireEvent.focus(screen.getByRole('gridcell', { name: 'Row 1, column 1, empty' }));

    // Then
    expect(document.querySelectorAll('[data-preview="valid"]')).toHaveLength(5);
  });

  it('rejects an invalid placement without changing the board', () => {
    // Given
    openFlatBoard();
    fireEvent.click(screen.getByRole('button', { name: 'Select piece A' }));
    const invalidOrigin = screen.getByRole('gridcell', { name: 'Row 5, column 11, empty' });
    fireEvent.mouseEnter(invalidOrigin);
    expect(document.querySelectorAll('[data-preview="invalid"]')).toHaveLength(1);

    // When
    fireEvent.click(invalidOrigin);

    // Then
    expect(screen.getAllByRole('gridcell').every(cell => cell.getAttribute('data-piece') === null)).toBe(true);
    expect(screen.getByRole('button', { name: 'Select piece A' }).getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelectorAll('[data-preview="invalid"]')).toHaveLength(1);
    expect(screen.getByText('Piece A does not fit here. Try another cell or orientation.')).toBeTruthy();
  });

  it('places the selected piece with one board-cell click', () => {
    // Given
    openFlatBoard();
    fireEvent.click(screen.getByRole('button', { name: 'Select piece A' }));

    // When
    fireEvent.click(screen.getByRole('gridcell', { name: 'Row 1, column 1, empty' }));

    // Then
    expect(screen.getByRole('gridcell', { name: 'Row 1, column 1, piece A' })).toBeTruthy();
    expect(screen.getAllByRole('gridcell').filter(cell => cell.getAttribute('data-piece') === 'A')).toHaveLength(5);
  });

  it('places a palette piece when it is dragged onto a valid cell', () => {
    // Given
    openFlatBoard();
    const piece = screen.getByRole('button', { name: 'Select piece A' });
    const origin = screen.getByRole('gridcell', { name: 'Row 1, column 1, empty' });
    const dataTransfer = { effectAllowed: 'none', setData: jest.fn() };

    // When
    fireEvent.dragStart(piece, { dataTransfer });
    fireEvent.dragEnter(origin, { dataTransfer });
    fireEvent.drop(origin, { dataTransfer });

    // Then
    expect(screen.getByRole('gridcell', { name: 'Row 1, column 1, piece A' })).toBeTruthy();
  });

  it.each([
    ['C', ['1:0', '0:1', '1:1']],
    ['J', ['0:0', '1:0', '2:0', '2:1', '3:1']],
    ['L', ['0:0', '1:0', '0:1', '1:1']],
  ])('renders the canonical connected shape for piece %s', (name, expectedCells) => {
    // Given / When
    openFlatBoard();
    const piece = screen.getByRole('button', { name: `Select piece ${name}` });

    // Then
    const cells = within(piece).getAllByTestId('flat-piece-bead');
    expect(cells.map(cell => `${cell.getAttribute('data-x')}:${cell.getAttribute('data-y')}`)).toEqual(expectedCells);
  });

  it('updates the selected silhouette from the keyboard rotation shortcut', () => {
    // Given
    openFlatBoard();
    const piece = screen.getByRole('button', { name: 'Select piece C' });
    fireEvent.click(piece);

    // When
    fireEvent.keyDown(window, { key: 'd' });

    // Then
    const cells = within(piece).getAllByTestId('flat-piece-bead');
    expect(cells.map(cell => `${cell.getAttribute('data-x')}:${cell.getAttribute('data-y')}`)).toEqual(['0:0', '0:1', '1:1']);
    const orientation = piece.querySelector('[data-piece-orientation="1:face"]');
    expect(orientation?.getAttribute('style')).toContain('rotate(-90deg)');
  });

  it('turns an odd-rotation piece over on its visual vertical axis', () => {
    // Given
    openFlatBoard();
    const piece = screen.getByRole('button', { name: 'Select piece C' });
    fireEvent.click(piece);
    fireEvent.click(screen.getByRole('button', { name: 'Turn piece right' }));

    // When
    fireEvent.click(screen.getByRole('button', { name: 'Turn piece over' }));

    // Then
    const orientation = piece.querySelector('[data-piece-orientation="1:flipped"]');
    expect(orientation?.getAttribute('style')).toContain('scaleY(-1)');
  });
});
