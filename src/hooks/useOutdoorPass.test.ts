import { act, renderHook } from '@testing-library/react';
import { useOutdoorPass } from './useOutdoorPass';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('spaces birds, a plane, and a car with quiet gaps', () => {
  const { result } = renderHook(() => useOutdoorPass(true));
  expect(result.current).toBeNull();
  act(() => jest.advanceTimersByTime(6000));
  expect(result.current?.kind).toBe('birds');
  act(() => jest.advanceTimersByTime(10000));
  expect(result.current).toBeNull();
  act(() => jest.advanceTimersByTime(15000));
  expect(result.current?.kind).toBe('plane');
  act(() => jest.advanceTimersByTime(11000));
  expect(result.current).toBeNull();
  act(() => jest.advanceTimersByTime(18000));
  expect(result.current?.kind).toBe('car');
});

it('cancels all scheduled activity while paused or hidden and starts quietly on resume', () => {
  const { result, rerender, unmount } = renderHook(({ running }) => useOutdoorPass(running), { initialProps: { running: true } });
  act(() => jest.advanceTimersByTime(7000));
  rerender({ running: false });
  expect(result.current).toBeNull();
  expect(jest.getTimerCount()).toBe(0);
  act(() => jest.advanceTimersByTime(100000));
  expect(result.current).toBeNull();
  rerender({ running: true });
  expect(result.current).toBeNull();
  act(() => jest.advanceTimersByTime(6000));
  expect(result.current?.kind).toBe('birds');
  unmount();
  expect(jest.getTimerCount()).toBe(0);
});
