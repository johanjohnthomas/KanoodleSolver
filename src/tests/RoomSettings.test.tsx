import { act, fireEvent, render, screen } from '@testing-library/react';
import Home from '@/app/page';

jest.mock('@/components/tabletop/TabletopScene', () => ({ TabletopScene: () => null }));

beforeEach(() => localStorage.clear());

it('changes the room time without changing the puzzle', async () => {
  await act(async () => { render(<Home />); });
  fireEvent.click(screen.getByLabelText('Room settings'));
  fireEvent.change(screen.getByLabelText('Time of day'), { target: { value: 'night' } });
  expect(screen.getByLabelText('Interactive Kanoodle desk').getAttribute('data-time')).toBe('night');
  expect(localStorage.getItem('kanoodle-room-time')).toBe('night');
  fireEvent.click(screen.getByRole('button', { name: 'Play' }));
  expect(screen.getByLabelText('0 of 12 pieces placed')).toBeTruthy();
});

it('restores the saved atmosphere and lets outdoor motion be paused', async () => {
  localStorage.setItem('kanoodle-room-time', 'sunset');
  await act(async () => { render(<Home />); });
  fireEvent.click(screen.getByLabelText('Room settings'));
  expect(screen.getByLabelText('Time of day')).toHaveValue('sunset');
  fireEvent.click(screen.getByLabelText('Outdoor activity'));
  expect(screen.getByLabelText('Outdoor activity')).not.toBeChecked();
  expect(localStorage.getItem('kanoodle-room-activity')).toBe('off');
});

it('uses daytime when an invalid saved room preference is encountered', async () => {
  localStorage.setItem('kanoodle-room-time', 'invalid-time');
  await act(async () => { render(<Home />); });
  fireEvent.click(screen.getByLabelText('Room settings'));
  expect(screen.getByLabelText('Time of day')).toHaveValue('day');
});
