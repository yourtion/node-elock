"use strict";

import { assert } from "chai";
import * as IORedis from "ioredis";

function delay(time: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}

describe("Libs - Redis Lock", async () => {
  const packPath = process.env.ISCOV ? "../lib" : "../../dist/lib";
  const pack = require(packPath);
  const ELock = pack.default;
  const redis = new IORedis();
  const lock = new ELock(redis, { timeout: 100 });

  beforeEach(async () => {
    await lock.release();
  });

  it("Test - Default Lock acquire and release", async () => {
    assert.isFalse(await lock.locked());
    assert.ok(await lock.get());
    assert.isTrue(await lock.locked());
    assert.isNull(await lock.get());
    try {
      await lock.acquire();
    } catch (error) {
      assert.equal(error.message, "acquire lock fail");
    }
    await lock.release();
    assert.ok(await lock.acquire());
  });

  it("Test - Default Lock concurrent", async () => {
    const all = await Promise.all([lock.get(), lock.get(), lock.get()]);
    assert.equal(all.length, 3);
    const res = all.filter((r: any) => !!r);
    assert.equal(res.length, 1);
  });

  it("Test - Default Lock timeout", async () => {
    assert.ok(await lock.acquire());
    assert.isNull(await lock.get());
    await delay(10);
    assert.isNull(await lock.get());
    try {
      await lock.acquire();
    } catch (error) {
      assert.equal(error.message, "acquire lock fail");
    }
    await delay(91);
    assert.isFalse(await lock.locked());
    assert.ok(await lock.get());
  });

});
