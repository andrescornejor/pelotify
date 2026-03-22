export const AVAILABLE_TIMES = Array.from({ length: 35 }).map((_, i) => {
  // Start from 7:00 (i=0 -> 7:00, i=1 -> 7:30)
  const totalMinutes = 7 * 60 + i * 30;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60 === 0 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
});
// 35 steps of 30 mins from 07:00:
// 0: 07:00
// ...
// 34: 07:00 + (34 * 30) = 07:00 + 17:00 = 24:00 (00:00)
