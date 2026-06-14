export class HashMap<K extends string | number | boolean, V> {
  private _buckets: [key: K, value: V][][];
  private _bucketCount: number;
  private _size: number = 0;

  constructor(bucketCount: number = 16) {
    this._bucketCount = bucketCount;
    this._buckets = Array.from({ length: bucketCount }, () => []);
  }

  hash(key: K): number {
    let hash = 0;
    const str = key.toString();
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % this._bucketCount;
    }
    return hash;
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

  get(key: K): V | undefined {
    const bucketIndex = this.hash(key);
    const bucket = this._buckets[bucketIndex];
    if (bucket.length === 0) {
      return undefined;
    } else {
      return bucket.find((el) => el[0] === key)?.[1];
    }
  }

  get size(): number {
    return this._size;
  }

  delete(key: K): boolean {
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

  has(key: K): boolean {
    const bucketIndex = this.hash(key);
    return this._buckets[bucketIndex].some((el) => el[0] === key);
  }

  keys(): K[] {
    const keysArr: K[] = [];
    this._buckets.forEach((bucket) => {
      bucket.forEach((el) => keysArr.push(el[0]));
    });
    return keysArr;
  }

  values(): V[] {
    const valuesArr: V[] = [];
    this._buckets.forEach((bucket) => {
      bucket.forEach((el) => valuesArr.push(el[1]));
    });
    return valuesArr;
  }

  // ─── Visualization helpers ───

  get buckets(): readonly [key: K, value: V][][] {
    return this._buckets;
  }

  get bucketCount(): number {
    return this._bucketCount;
  }

  get loadFactor(): number {
    return this._size / this._bucketCount;
  }

  clone(): HashMap<K, V> {
    const copy = new HashMap<K, V>(this._bucketCount);
    copy._buckets = this._buckets.map((b) =>
      b.map((entry) => [...entry] as [K, V]),
    );
    copy._size = this._size;
    return copy;
  }
}
