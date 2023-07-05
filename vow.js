States = Object.freeze({
  PENDING: "pending",
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
});

class Vow {
  #state = States.PENDING;
  #value;
  #onSuccessThisVow = this.#onSuccess.bind(this);
  #onFailThisVow = this.#onFail.bind(this);

  #callbacks = {
    fulfiled: [],
    rejected: [],
  };

  constructor(executor) {
    try {
      executor(this.#onSuccessThisVow, this.#onFailThisVow);
    } catch (e) {
      this.#onFail(e);
    }
  }

  #processQueue() {
    if (this.#state === States.FULFILLED) {
      this.#callbacks.fulfiled.forEach((callback) => {
        callback(this.#value);
      });

      this.#callbacks.fulfiled = [];
      return;
    }

    if (this.#state === States.REJECTED) {
      this.#callbacks.rejected.forEach((callback) => {
        callback(this.#value);
      });

      this.#callbacks.rejected = [];
      return;
    }
  }

  #onSuccess(value) {
    queueMicrotask(() => {
      if (this.#state !== States.PENDING) return;

      if (value instanceof Vow) {
        value.then(this.#onSuccessThisVow, this.#onFailThisVow);
        return;
      }

      this.#value = value;
      this.#state = States.FULFILLED;
      this.#processQueue();
    });
  }

  #onFail(value) {
    queueMicrotask(() => {
      if (this.#state !== States.PENDING) return;

      if (value instanceof Vow) {
        value.then(this.#onSuccessThisVow, this.#onFailThisVow);
        return;
      }

      if (this.#callbacks.rejected.length === 0) {
        throw new UncaughtVowError(value);
      }

      this.#value = value;
      this.#state = States.REJECTED;
      this.#processQueue();
    });
  }

  then(resolveCallback, rejectedCallback) {
    console.log(States);
    return new Vow((resolve, reject) => {
      this.#callbacks.fulfiled.push((result) => {
        if (resolveCallback == null) {
          resolve(result);
          return;
        }

        try {
          resolve(resolveCallback(result));
        } catch (error) {
          reject(error);
        }
      });

      this.#callbacks.rejected.push((result) => {
        if (rejectedCallback == null) {
          reject(result);
          return;
        }

        try {
          resolve(rejectedCallback(result));
        } catch (error) {
          reject(error);
        }
      });

      this.#processQueue();
    });
  }

  catch(callback) {
    return this.then(undefined, callback);
  }

  finally(callback) {
    return this.then(
      (result) => {
        callback();
        return result;
      },
      (result) => {
        callback();
        throw result;
      }
    );
  }

  static resolve(value) {
    return new Promise((resolve) => {
      resolve(value);
    });
  }

  static reject(value) {
    return new Promise((resolve, reject) => {
      reject(value);
    });
  }

  static all(vows) {
    const results = [];
    let countOfDoneVows = 0;
    return new Vow((resolve, reject) => {
      for (let i = 0; i < vows.length; i++) {
        const vow = vows[i];
        vow
          .then((value) => {
            countOfDoneVows++;
            results[i] = value;
            if (countOfDoneVows === vows.length) {
              resolve(results);
            }
          })
          .catch(reject);
      }
    });
  }

  static allSettled(vows) {
    const results = [];
    let countOfDoneVows = 0;
    return new Vow((resolve) => {
      for (let i = 0; i < vows.length; i++) {
        const vow = vows[i];
        vow
          .then((value) => {
            results[i] = { status: States.FULFILLED, value };
          })
          .catch((reason) => {
            results[i] = { status: States.REJECTED, reason };
          })
          .finally(() => {
            countOfDoneVows++;
            if (countOfDoneVows === vows.length) {
              resolve(results);
            }
          });
      }
    });
  }

  static race(vows) {
    return new Vow((resolve, reject) => {
      vows.forEach((vow) => {
        vow.then(resolve).catch(reject);
      });
    });
  }

  static any(vows) {
    const rejected = [];
    let rejectedVowsCount = 0;
    return new Vow((resolve, reject) => {
      for (let i = 0; i < vows.length; i++) {
        const vow = vows[i];
        vow.then(resolve).catch((value) => {
          rejectedVowsCount++;
          rejected[i] = value;
          if (rejectedVowsCount === vows.length) {
            reject(new AggregateError(rejected, "All vows were rejected"));
          }
        });
      }
    });
  }
}

class UncaughtVowError extends Error {
  constructor(error) {
    super(error);

    this.stack = `(in vow) ${error.stack}`;
  }
}

module.exports = { Vow, States };
