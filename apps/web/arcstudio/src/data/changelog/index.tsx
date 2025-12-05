// import { changelog as v3_1_0 } from './3.1.0';
import { changelog as v3_0_0 } from './3.0.0';
import { changelog as test } from './test';

export const changelogs = [
  // v3_1_0,
  v3_0_0,
  test,
];

export const sortedChangelogs = [...changelogs].sort((a, b) => {
  const [dayA, monthA, yearA] = a.date.split("/").map(Number);
  const [dayB, monthB, yearB] = b.date.split("/").map(Number);
  return new Date(yearB, monthB - 1, dayB).getTime() - new Date(yearA, monthA - 1, dayA).getTime();
});
