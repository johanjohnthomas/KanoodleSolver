'use client';

import { useEffect, useState } from 'react';
import { parseTimeOfDay } from '@/lib/room';
import type { TimeOfDay } from '@/lib/room';

export function useRoomPreferences() {
  const [timeOfDay, setTime] = useState<TimeOfDay>('day');
  const [activity, setActivityState] = useState(true);
  useEffect(() => {
    try {
      setTime(parseTimeOfDay(localStorage.getItem('kanoodle-room-time')));
      setActivityState(localStorage.getItem('kanoodle-room-activity') !== 'off');
    } catch (error) {
      if (!(error instanceof DOMException)) throw error;
    }
  }, []);
  const setTimeOfDay = (value: TimeOfDay): void => {
    setTime(value);
    try { localStorage.setItem('kanoodle-room-time', value); }
    catch (error) { if (!(error instanceof DOMException)) throw error; }
  };
  const setActivity = (value: boolean): void => {
    setActivityState(value);
    try { localStorage.setItem('kanoodle-room-activity', value ? 'on' : 'off'); }
    catch (error) { if (!(error instanceof DOMException)) throw error; }
  };
  return { timeOfDay, activity, setTimeOfDay, setActivity };
}
