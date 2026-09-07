import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Home from '@/app/page';

jest.mock('@/components/tabletop/TabletopScene', () => ({ TabletopScene: () => null }));
const scrollIntoView = jest.fn();
Element.prototype.scrollIntoView = scrollIntoView;
beforeEach(() => scrollIntoView.mockClear());

it.each(['Solve board', 'Hint'])('%s highlights a minimal repair instead of a dead-end dialog', async action => {
  render(<Home />);
  fireEvent.click(screen.getByRole('button', { name: '2D board' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select piece A' }));
  fireEvent.click(screen.getByRole('gridcell', { name: 'Row 1, column 10, empty' }));
  fireEvent.click(screen.getByRole('button', { name: action }));
  await screen.findByRole('button', { name: 'Lift highlighted pieces' });
  expect(document.querySelectorAll('[role="gridcell"][data-recovery]')).toHaveLength(5);
  expect(screen.getByRole('button', { name: 'Select highlighted piece A' })).toBeTruthy();
  expect(screen.queryByRole('heading', { name: 'No solution from this layout' })).toBeNull();
  expect(screen.getByLabelText('1 of 12 pieces placed')).toBeTruthy();
  expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center', behavior: 'smooth' });
});

it('removes the highlighted piece only after the user chooses to lift it', async () => {
  render(<Home />);
  fireEvent.click(screen.getByRole('button', { name: '2D board' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select piece A' }));
  fireEvent.click(screen.getByRole('gridcell', { name: 'Row 1, column 10, empty' }));
  fireEvent.click(screen.getByRole('button', { name: 'Solve board' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Lift highlighted pieces' }));
  await waitFor(() => expect(screen.getByLabelText('0 of 12 pieces placed')).toBeTruthy());
  expect(document.querySelectorAll('[role="gridcell"][data-recovery]')).toHaveLength(0);
});
