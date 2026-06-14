import { describe, it, expect } from 'vitest';
import { HashMap } from './hashMap';

describe('hashMap', () => {
  it('sets and gets a value by a key', () => {
    const hmap = new HashMap();
    hmap.set('alice', 12);
    hmap.set('bob', 10);

    expect(hmap.get('alice')).toEqual(12);
    expect(hmap.get('bob')).toEqual(10);

    hmap.set('alice', 13);
    expect(hmap.get('alice')).toEqual(13);
  });

  it('returns the correct size of the map (including collisions)', () => {
    const hmap = new HashMap();
    hmap.set('alice', 12);
    hmap.set('bob', 10);
    hmap.set('eve', 13); // hashed to 0
    hmap.set('peter', 16); // hashed to 0

    expect(hmap.size()).toEqual(4);
  });

  it('deletes a key-value pair and returns true', () => {
    const hmap = new HashMap();
    hmap.set('alice', 12);
    hmap.set('bob', 10);
    hmap.set('eve', 13);

    expect(hmap.size()).toEqual(3);
    expect(hmap.delete('alice')).toEqual(true);
    expect(hmap.size()).toEqual(2);
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

    expect(hmap.keys()).toEqual(['eve', 'bob', 'alice']);
  });

  it('returns values', () => {
    const hmap = new HashMap();
    hmap.set('alice', 12);
    hmap.set('bob', 10);
    hmap.set('eve', 13);

    expect(hmap.values()).toEqual([13, 10, 12]);
  });

  it('return true if an element exists and false otherwise', () => {
    const hmap = new HashMap();
    hmap.set('alice', 12);
    hmap.set('bob', 10);
    hmap.set('eve', 13);

    expect(hmap.has('alice')).toEqual(true);
    expect(hmap.has('peter')).toEqual(false);
  });
});
