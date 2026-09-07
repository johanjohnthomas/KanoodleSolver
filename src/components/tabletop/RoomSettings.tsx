'use client';

import { GearSixIcon } from '@phosphor-icons/react';
import { parseTimeOfDay } from '@/lib/room';
import type { useRoomPreferences } from '@/hooks/useRoomPreferences';

export function RoomSettings({ preferences, reducedMotion }: Readonly<{
  preferences: ReturnType<typeof useRoomPreferences>; reducedMotion: boolean;
}>) {
  return <details className="room-settings">
    <summary aria-label="Room settings"><GearSixIcon aria-hidden="true" /><span>Room settings</span></summary>
    <div className="room-settings-panel">
      <label className="room-time-label"><span>Time of day</span>
        <select aria-label="Time of day" value={preferences.timeOfDay} onChange={event => preferences.setTimeOfDay(parseTimeOfDay(event.target.value))}>
          <option value="day">Day</option><option value="sunset">Sunset</option><option value="night">Night</option>
        </select>
      </label>
      <label className="room-activity-label"><input type="checkbox" checked={preferences.activity && !reducedMotion}
        disabled={reducedMotion} onChange={event => preferences.setActivity(event.target.checked)} />Outdoor activity</label>
      <p>{reducedMotion ? 'Paused to respect reduced motion.' : 'An occasional bird, plane, or passing car. Quiet in between.'}</p>
    </div>
  </details>;
}
