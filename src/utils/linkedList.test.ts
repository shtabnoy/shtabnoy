import { describe, expect, it } from 'vitest';
import { LinkedList } from './linkedList';

describe('LinkedList', () => {
  it('appends elements', () => {
    const ll = new LinkedList<number>();

    expect(ll.toArray()).toEqual([]);

    ll.append(1);
    ll.append(2);
    ll.append(3);

    expect(ll.toArray()).toEqual([1, 2, 3]);
  });

  it('prepends elements', () => {
    const ll = new LinkedList<number>();

    ll.prepend(1);
    ll.prepend(2);
    ll.prepend(3);

    expect(ll.toArray()).toEqual([3, 2, 1]);
  });

  it('deletes by value', () => {
    const list = new LinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    list.append(4);

    list.deleteByValue(3);
    expect(list.toArray()).toEqual([1, 2, 4]);

    list.deleteByValue(1);
    expect(list.toArray()).toEqual([2, 4]);

    list.deleteByValue(2);
    list.deleteByValue(4);
    expect(list.toArray()).toEqual([]);

    list.deleteByValue(4);
    expect(list.toArray()).toEqual([]);
  });

  it('inserts an element at', () => {
    const list = new LinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    list.append(4);

    list.insertAt(1, 99);
    expect(list.toArray()).toEqual([1, 99, 2, 3, 4]);

    list.insertAt(0, 100);
    expect(list.toArray()).toEqual([100, 1, 99, 2, 3, 4]);

    list.insertAt(6, 120);
    expect(list.toArray()).toEqual([100, 1, 99, 2, 3, 4]);
  });

  it('has head', () => {
    const ll = new LinkedList<string>();

    expect(ll.head).toBeNull();

    ll.append('hello');

    expect(ll.head?.value).toEqual('hello');
  });

  it('has size', () => {
    const ll = new LinkedList<string>();

    expect(ll.size).toEqual(0);

    ll.append('a');
    ll.append('b');
    ll.prepend('c');

    expect(ll.size).toEqual(3);
  });

  it('reverses the list', () => {
    const ll = new LinkedList<number>();

    ll.append(1);
    ll.append(2);
    ll.append(3);

    ll.reverse();

    expect(ll.toArray()).toEqual([3, 2, 1]);
  });
});
