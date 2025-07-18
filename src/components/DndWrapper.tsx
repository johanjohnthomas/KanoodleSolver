"use client";

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DragLayer from './DragLayer';

export function DndWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
      <DragLayer />
    </DndProvider>
  );
}
