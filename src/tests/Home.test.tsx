import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../app/page';

describe('Home page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    const heading = screen.getByText(/Kanoodle Solver/i);
    expect(heading).toBeInTheDocument();
  });

  it('opens and closes the settings panel', () => {
    render(<Home />);
    const settingsButton = screen.getByText(/Settings/i);
    fireEvent.click(settingsButton);
    expect(screen.getByText(/Settings panel content will go here./i)).toBeInTheDocument();

    const closeButton = screen.getByText(/Close/i);
    fireEvent.click(closeButton);
    expect(screen.queryByText(/Settings panel content will go here./i)).not.toBeInTheDocument();
  });

  it('handles the play and reset buttons', () => {
    render(<Home />);
    const playButton = screen.getByText(/Play/i);
    fireEvent.click(playButton);
    // This is a basic test. A more comprehensive test would check the board state.
    expect(screen.getByText(/Reset/i)).toBeInTheDocument();

    const resetButton = screen.getByText(/Reset/i);
    fireEvent.click(resetButton);
    // Again, a more comprehensive test would check the board state.
    expect(screen.getByText(/Play/i)).toBeInTheDocument();
  });
});
