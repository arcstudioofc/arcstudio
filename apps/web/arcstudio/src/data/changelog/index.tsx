// import { changelog as v3_1_0 } from './3.1.0';
import { changelog as v3_0_0 } from './3.0.0';
import { changelog as test } from './test';

export const changelogs = [
  // v3_1_0,
  v3_0_0,
  test,
];

export const sortedChangelogs = [...changelogs].sort((a, b) => {
  // a.date e b.date já são Date
  return b.date.getTime() - a.date.getTime();
});
