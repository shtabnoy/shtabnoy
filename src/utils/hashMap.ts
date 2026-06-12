export class HashMap {
  private buckets: [key: string, value: number][][];
  private initialSize: number = 16;

  constructor() {
    this.buckets = Array.from({ length: this.initialSize }, () => []);
  }

  private hash(key: string) {
    let index = 0;
    for (let c of key) {
      index += c.charCodeAt(0);
    }
    return index % this.buckets.length;
  }

  set(key: string, value: number) {
    const bucketIndex = this.hash(key);
    this.buckets[bucketIndex].push([key, value]);
  }

  get(key: string) {
    const bucketIndex = this.hash(key);
    const bucket = this.buckets[bucketIndex];
    if (bucket.length === 0) {
      return undefined;
    } else {
      const value = bucket.find((el) => el[0] === key)?.[1];
      return value;
    }
  }

  size(): number {
    return this.buckets.filter((bucket) => bucket.length > 0).length;
  }

  delete(key: string) {
    const bucketIndex = this.hash(key);
    const bucket = this.buckets[bucketIndex];

    if (bucket.length === 0) {
      return false;
    } else if (bucket.length === 1) {
      this.buckets[bucketIndex] = [];
      return true;
    } else {
      const index = bucket.findIndex((el) => el[0] === key);
      this.buckets[bucketIndex].splice(index, 1);
      return true;
    }
  }

  keys() {
    const keysArr: string[] = [];

    const nonEmptyBuckets = this.buckets.filter((bucket) => bucket.length > 0);
    nonEmptyBuckets.forEach((b) => {
      b.forEach((el) => {
        keysArr.push(el[0]);
      });
    });
    return keysArr;
  }

  values() {
    const valuesArr: number[] = [];

    const nonEmptyBuckets = this.buckets.filter((bucket) => bucket.length > 0);
    nonEmptyBuckets.forEach((b) => {
      b.forEach((el) => {
        valuesArr.push(el[1]);
      });
    });
    return valuesArr;
  }
}
