import { changelog as v3_0_0 } from './3.0.0';
import { changelog as v3_1_0_beta_1 } from './3.1.0-beta.1';
import { changelog as v3_1_1_beta_1 } from './3.1.1-beta.1';
import { changelog as v3_1_3_beta_1 } from './3.1.3-beta.1';
import { changelog as test } from './test';

export const changelogs = [
  v3_1_3_beta_1,
  v3_1_1_beta_1,
  v3_1_0_beta_1,
  v3_0_0,
  test,
];

export const sortedChangelogs = [...changelogs].sort((a, b) => {
  return b.date.getTime() - a.date.getTime();
});
