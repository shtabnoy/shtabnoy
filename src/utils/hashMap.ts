export class HashMap<K extends string | number | boolean, V> {
  private _buckets: [key: K, value: V][][];
  private _initialSize: number = 16;
  private _size: number = 0;

  constructor() {
    this._buckets = Array.from({ length: this._initialSize }, () => []);
  }

  private hash(key: K) {
    let index = 0;
    for (let c of key.toString()) {
      index += c.charCodeAt(0);
    }
    return index % this._buckets.length;
  }

  set(key: K, value: V) {
    const bucketIndex = this.hash(key);
    const bucket = this._buckets[bucketIndex];
    const elementIndex = bucket.findIndex((el) => el[0] === key);
    if (elementIndex >= 0) {
      this._buckets[bucketIndex][elementIndex] = [key, value];
    } else {
      this._buckets[bucketIndex].push([key, value]);
      this._size++;
    }
  }

  get(key: K) {
    const bucketIndex = this.hash(key);
    const bucket = this._buckets[bucketIndex];
    if (bucket.length === 0) {
      return undefined;
    } else {
      const value = bucket.find((el) => el[0] === key)?.[1];
      return value;
    }
  }

  size(): number {
    return this._size;
  }

  delete(key: K) {
    const bucketIndex = this.hash(key);
    const bucket = this._buckets[bucketIndex];

    if (bucket.length === 0) {
      return false;
    } else {
      const index = bucket.findIndex((el) => el[0] === key);
      if (index === -1) return false;
      this._buckets[bucketIndex].splice(index, 1);
      this._size--;
      return true;
    }
  }

  has(key: K) {
    const bucketIndex = this.hash(key);
    const bucket = this._buckets[bucketIndex];
    const index = bucket.findIndex((el) => el[0] === key);

    if (index >= 0) {
      return true;
    }

    return false;
  }

  keys() {
    const keysArr: K[] = [];

    const nonEmptyBuckets = this._buckets.filter((bucket) => bucket.length > 0);
    nonEmptyBuckets.forEach((b) => {
      b.forEach((el) => {
        keysArr.push(el[0]);
      });
    });
    return keysArr;
  }

  values() {
    const valuesArr: V[] = [];

    const nonEmptyBuckets = this._buckets.filter((bucket) => bucket.length > 0);
    nonEmptyBuckets.forEach((b) => {
      b.forEach((el) => {
        valuesArr.push(el[1]);
      });
    });
    return valuesArr;
  }
}
