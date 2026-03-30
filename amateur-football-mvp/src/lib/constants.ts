export const AVAILABLE_TIMES = Array.from({ length: 18 }).map((_, i) => {
  // Start from 7:00 (i=0 -> 7:00, i=1 -> 8:00)
  const totalMinutes = 7 * 60 + i * 60;
  const hours = Math.floor(totalMinutes / 60) % 24;
  return `${hours.toString().padStart(2, '0')}:00`;
});
// 18 steps of 60 mins from 07:00:
// 0: 07:00
// ...
// 17: 07:00 + 17:00 = 24:00 (00:00)
