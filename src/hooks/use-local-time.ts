'use client';

import { useEffect, useState } from 'react';

/**
 * Live wall-clock time for a fixed UTC offset parsed from a label such as
 * "EAT · UTC+3" (the config's `timezone`). Returns null until mounted so the
 * server and first client render agree.
 */
// The clock is shifted to the offset by hand, then read as UTC: the config gives an
// offset label, not an IANA zone. 24-hour, to match the "UTC+3" it sits beside.
const CLOCK = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
});

export function useLocalTime(timezoneLabel: string) {
  const match = timezoneLabel.match(/UTC\s*([+-−])\s*(\d{1,2})(?::?(\d{2}))?/);
  const sign = match && (match[1] === '-' || match[1] === '−') ? -1 : 1;
  const offsetMinutes = match
    ? sign * (Number(match[2]) * 60 + Number(match[3] ?? 0))
    : 0;

  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const local = new Date(now.getTime() + offsetMinutes * 60_000);
  const hours = local.getUTCHours();
  const minutes = local.getUTCMinutes();
  return {
    hours,
    minutes,
    label: CLOCK.format(local),
    // Roughly a working day, so a visitor can tell when to expect a reply.
    isWorkingHours: hours >= 9 && hours < 20,
  };
}
