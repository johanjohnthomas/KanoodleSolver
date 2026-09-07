import { act, fireEvent, render, screen } from '@testing-library/react';
import Home from '@/app/page';

jest.mock('@/components/tabletop/TabletopScene', () => ({ TabletopScene: () => null }));

it('starts at Play without active puzzle controls', async () => {
  await act(async () => { render(<Home />); });
  expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Solve board' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Piece A' })).toBeNull();
});

it('enters the overhead game from Play', () => {
  render(<Home />);
  fireEvent.click(screen.getByRole('button', { name: 'Play' }));
  expect(screen.getByRole('button', { name: 'Desk view' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Solve board' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Play' })).toBeNull();
});

it('preserves a puzzle across the desk start screen', () => {
  render(<Home />);
  fireEvent.click(screen.getByRole('button', { name: '2D board' }));
  fireEvent.click(screen.getByRole('button', { name: 'Piece A' }));
  fireEvent.click(screen.getByRole('gridcell', { name: 'Row 1, column 1, empty' }));
  fireEvent.click(screen.getByRole('button', { name: '3D desk' }));
  fireEvent.click(screen.getByRole('button', { name: 'Desk view' }));
  expect(screen.queryByRole('button', { name: 'Piece A' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Play' }));
  fireEvent.click(screen.getByRole('button', { name: '2D board' }));
  expect(screen.getByLabelText('1 of 12 pieces placed')).toBeTruthy();
  expect(screen.getByRole('gridcell', { name: 'Row 1, column 1, piece A' })).toBeTruthy();
});
