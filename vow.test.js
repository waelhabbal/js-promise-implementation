const { Vow, States } = require("./vow.js");

const A_VALUE = "default";

describe("then", () => {
  it("no chaining", () => {
    return vowFactory().then((value) => expect(value).toEqual(A_VALUE));
  });

  it("vow with multiple thens", () => {
    const doAfterResolve = (value) => expect(value).toEqual(A_VALUE);
    const vow = vowFactory();
    const thenVow1 = vow.then(doAfterResolve);
    const thenVow2 = vow.then(doAfterResolve);
    return Vow.allSettled([thenVow1, thenVow2]);
  });

  it("vow with then and catch", () => {
    const doAfterResolve = (value) => expect(value).toEqual(A_VALUE);
    const doAfterReject = (value) => expect(1).toEqual(2);
    const resolveVow = vowFactory().then(doAfterResolve, doAfterReject);
    const rejectVow = vowFactory({ willRejected: true }).then(
      doAfterReject,
      doAfterResolve
    );
    return Vow.allSettled([resolveVow, rejectVow]);
  });

  it("vow chaining", () => {
    return vowFactory({ value: 3 })
      .then((value) => value * 4)
      .then((value) => expect(value).toEqual(12));
  });
});

describe("catch", () => {
  it("with no chaining", () => {
    return vowFactory({ willRejected: true }).catch((value) =>
      expect(value).toEqual(A_VALUE)
    );
  });

  it("with multiple catches for same vow", () => {
    const doAfterReject = (value) => expect(value).toEqual(A_VALUE);
    const vow = vowFactory({ willRejected: true });
    const catchVow1 = vow.catch(doAfterReject);
    const catchVow2 = vow.catch(doAfterReject);
    return Vow.allSettled([catchVow1, catchVow2]);
  });

  it("with chaining", () => {
    return vowFactory({ value: 3 })
      .then((value) => {
        throw value * 4;
      })
      .catch((value) => expect(value).toEqual(12));
  });
});

describe("finally", () => {
  it("with no chaining", () => {
    const doFinally = (value) => (value) => expect(value).toBeUndefined();
    const successVow = vowFactory().finally(doFinally);
    const failVow = vowFactory({ willRejected: true }).finally(doFinally);
    return Vow.allSettled([successVow, failVow]);
  });

  it("with multiple finallys for same vow", () => {
    const doFinally = (value) => expect(value).toBeUndefined();
    const vow = vowFactory();
    const finallyVow1 = vow.finally(doFinally);
    const finallyVow2 = vow.finally(doFinally);
    return Vow.allSettled([finallyVow1, finallyVow2]);
  });

  it("with chaining", () => {
    const doFinally = (value) => (value) => expect(value).toBeUndefined();
    const successVow = vowFactory()
      .then((value) => value)
      .finally(doFinally);
    const failVow = vowFactory({ willRejected: true })
      .then((value) => value)
      .finally(doFinally);
    return Vow.allSettled([successVow, failVow]);
  });
});

describe("static methods", () => {
  it("resolve", () => {
    return Vow.resolve(A_VALUE).then((value) => expect(value).toEqual(A_VALUE));
  });

  it("reject", () => {
    return Vow.reject(A_VALUE).catch((value) => expect(value).toEqual(A_VALUE));
  });

  describe("all", () => {
    it("with success", () => {
      return Vow.all([vowFactory({ value: 1 }), vowFactory({ value: 2 })]).then(
        (value) => expect(value).toEqual([1, 2])
      );
    });

    it("with fail", () => {
      return Vow.all([vowFactory(), vowFactory({ willRejected: true })]).catch(
        (value) => expect(value).toEqual(A_VALUE)
      );
    });
  });

  it("allSettled", () => {
    return Vow.allSettled([
      vowFactory(),
      vowFactory({ willRejected: true }),
    ]).then((value) =>
      expect(value).toEqual([
        { status: "fulfilled", value: A_VALUE },
        { status: "rejected", reason: A_VALUE },
      ])
    );
  });

  describe("race", () => {
    it("with success", () => {
      return Vow.race([
        vowFactory({ value: 1 }),
        vowFactory({ value: 2 }),
      ]).then((value) => expect(value).toEqual(1));
    });

    it("with fail", () => {
      return Vow.race([
        vowFactory({ willRejected: true, value: 1 }),
        vowFactory({ willRejected: true, value: 2 }),
      ]).catch((value) => expect(value).toEqual(1));
    });
  });

  describe("any", () => {
    it("with success", () => {
      return Vow.any([vowFactory({ value: 1 }), vowFactory({ value: 2 })]).then(
        (value) => expect(value).toEqual(1)
      );
    });

    it("with fail", () => {
      return Vow.any([
        vowFactory({ willRejected: true, value: 1 }),
        vowFactory({ value: 2 }),
      ]).catch((value) => expect(value.errors).toEqual([1, 2]));
    });
  });
});

function vowFactory({ value = A_VALUE, willRejected = false } = {}) {
  return new Vow((resolve, reject) => {
    willRejected ? reject(value) : resolve(value);
  });
}
