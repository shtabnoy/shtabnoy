import { describe, it, expect } from 'vitest';
import { HashMap } from './hashMap';

describe('hashMap', () => {
  it('sets and gets a value by a key', () => {
    const hmap = new HashMap();
    hmap.set('alice', 12);
    hmap.set('bob', 10);

    expect(hmap.get('alice')).toEqual(12);
    expect(hmap.get('bob')).toEqual(10);
  });

  it('returns the correct size of the map', () => {
    const hmap = new HashMap();
    hmap.set('alice', 12);
    hmap.set('bob', 10);
    hmap.set('eve', 13);

    expect(hmap.size()).toEqual(3);
  });

  it('deletes a key-value pair and returns true', () => {
    const hmap = new HashMap();
    hmap.set('alice', 12);
    hmap.set('bob', 10);
    hmap.set('eve', 13);

    expect(hmap.delete('alice')).toEqual(true);
  });

  it("doesn't delete a key-value pair and returns false", () => {
    const hmap = new HashMap();
    hmap.set('alice', 12);
    hmap.set('bob', 10);

    expect(hmap.delete('eve')).toEqual(false);
  });

  it('returns keys', () => {
    const hmap = new HashMap();
    hmap.set('alice', 12);
    hmap.set('bob', 10);
    hmap.set('eve', 13);

    expect(hmap.keys()).toEqual(['alice', 'bob', 'eve']);
  });

  it('returns values', () => {
    const hmap = new HashMap();
    hmap.set('alice', 12);
    hmap.set('bob', 10);
    hmap.set('eve', 13);

    expect(hmap.values()).toEqual([12, 10, 13]);
  });
});
