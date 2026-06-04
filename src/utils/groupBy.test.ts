import { describe, it, expect } from 'vitest';
import { groupBy } from './groupBy';

const users = [
  { id: 1, role: 'admin', name: 'Alice' },
  { id: 2, role: 'user', name: 'Bob' },
  { id: 3, role: 'admin', name: 'Carol' },
];

describe('groupBy', () => {
  it('groups items by a string key', () => {
    const result = groupBy(users, (u) => u.role);
    expect(result).toEqual({
      admin: [
        { id: 1, role: 'admin', name: 'Alice' },
        { id: 3, role: 'admin', name: 'Carol' },
      ],
      user: [{ id: 2, role: 'user', name: 'Bob' }],
    });
  });

  it('returns an empty object for an empty array', () => {
    expect(groupBy([], (x: { role: string }) => x.role)).toEqual({});
  });

  it('places all items in one group when all keys are equal', () => {
    const items = [{ v: 1 }, { v: 2 }];
    expect(groupBy(items, () => 'same')).toEqual({
      same: [{ v: 1 }, { v: 2 }],
    });
  });

  it('groups by numeric key', () => {
    const items = [{ n: 1 }, { n: 2 }, { n: 1 }];
    expect(groupBy(items, (x) => x.n)).toEqual({
      1: [{ n: 1 }, { n: 1 }],
      2: [{ n: 2 }],
    });
  });
});
