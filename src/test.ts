"use strict";

import * as IORedis from "ioredis";

function delay(time: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}

describe("Libs - Redis Lock", async () => {
  const packPath = process.env.ISLIB ? "./" : "../dist/";
  const pack = require(packPath);
  const ELock = pack.default;
  const redis = new IORedis();
  const lock = new ELock(redis, { timeout: 100 });

  beforeEach(async () => {
    await lock.release();
  });

  afterAll(async () => {
    await redis.disconnect();
  });

  it("Test - Default Lock acquire and release", async () => {
    expect.assertions(6);
    await expect(lock.locked()).resolves.toBeFalsy();
    await expect(lock.get()).resolves.toBeTruthy();
    await expect(lock.locked()).resolves.toBeTruthy();
    await expect(lock.get()).resolves.toBeNull();
    await expect(lock.acquire()).rejects.toThrow("acquire lock fail");
    await lock.release();
    await expect(lock.acquire()).resolves.toBeTruthy();
  });

  it("Test - Default Lock concurrent", async () => {
    expect.assertions(2);
    const all = await Promise.all([lock.get(), lock.get(), lock.get()]);
    expect(all.length).toEqual(3);
    const res = all.filter((r: any) => !!r);
    expect(res.length).toEqual(1);
  });

  it("Test - Default Lock timeout", async () => {
    expect.assertions(6);
    await expect(lock.acquire()).resolves.toBeTruthy();
    await expect(lock.get()).resolves.toBeNull();
    await delay(10);
    await expect(lock.get()).resolves.toBeNull();
    await expect(lock.acquire()).rejects.toThrow("acquire lock fail");
    await delay(91);
    await expect(lock.locked()).resolves.toBeFalsy();
    await expect(lock.get()).resolves.toBeTruthy();
  });
});
