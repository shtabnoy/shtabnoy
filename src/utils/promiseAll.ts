export function promiseAll<T>(promises: (T | Promise<T>)[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const result: any[] = [];
    let counter = 0;
    const total = promises.length;

    if (total === 0) {
      resolve([]);
    }

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then((res) => {
          result[index] = res;
          counter++;
          if (counter === total) {
            resolve(result);
          }
        })
        .catch((err0r) => {
          reject(err0r);
        });
    });
  });
}
