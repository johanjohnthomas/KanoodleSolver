'use client';

import { Component } from 'react';
import type { ReactNode } from 'react';

type Props = Readonly<{ children: ReactNode; onUnavailable: () => void }>;

export class SceneBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } { return { failed: true }; }
  componentDidCatch(error: Error): void {
    if (/webgl|context/i.test(error.message)) this.props.onUnavailable();
    else throw error;
  }
  render() {
    return this.state.failed ? <p className="scene-loading">Opening the 2D board…</p> : this.props.children;
  }
}
