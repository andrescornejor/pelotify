import { inferSportFromType, type Sport } from './sports';

type TimePricingRange = {
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  price: number;
};

export type FieldLike = {
  id: string;
  type: string;
  price_per_match?: number | null;
  time_pricing?: TimePricingRange[] | null;
};

export type BookingLike = {
  field_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM[:SS]
  end_time: string; // HH:MM[:SS]
  status?: string | null;
};

export function getFieldSport(fieldType: string | null | undefined): Sport {
  return inferSportFromType(fieldType || undefined);
}

export function normalizeTimeHHMM(time: string) {
  // Accept HH:MM or HH:MM:SS
  return (time || '').slice(0, 5);
}

export function timeToMinutes(time: string) {
  const t = normalizeTimeHHMM(time);
  const [h, m] = t.split(':').map((n) => parseInt(n, 10));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

export function minutesToTime(minutes: number) {
  const safe = ((minutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function addMinutesToTime(time: string, minutesToAdd: number) {
  return minutesToTime(timeToMinutes(time) + minutesToAdd);
}

export function isOverlap(startA: string, endA: string, startB: string, endB: string) {
  const a0 = timeToMinutes(startA);
  const a1 = timeToMinutes(endA);
  const b0 = timeToMinutes(startB);
  const b1 = timeToMinutes(endB);
  // Half-open intervals: [start, end)
  return a0 < b1 && b0 < a1;
}

export function isBookingActive(booking: BookingLike) {
  const status = (booking.status || '').toLowerCase();
  return status !== 'cancelled';
}

export function isSlotAvailable(args: {
  bookings: BookingLike[];
  fieldId: string;
  date: string;
  startTime: string; // HH:MM
  durationMinutes: number;
}) {
  const endTime = addMinutesToTime(args.startTime, args.durationMinutes);
  return !args.bookings.some((b) => {
    if (!isBookingActive(b)) return false;
    if (b.field_id !== args.fieldId) return false;
    if (b.date !== args.date) return false;
    return isOverlap(args.startTime, endTime, b.start_time, b.end_time);
  });
}

export function getFieldPriceForTime(field: FieldLike | null | undefined, time: string | null | undefined) {
  if (!field) return 0;
  const base = Math.round(Number(field.price_per_match || 0));
  const ranges = (field.time_pricing || []) as TimePricingRange[];
  if (!time || ranges.length === 0) return base;

  const t = timeToMinutes(time);
  const match = ranges.find((r) => {
    const start = timeToMinutes(r.startTime);
    const end = timeToMinutes(r.endTime);
    // Treat ranges as inclusive end in UI, but compute as [start, end+1min) for safety.
    return t >= start && t <= end;
  });

  const price = match ? Number(match.price) : base;
  return Math.round(price);
}

