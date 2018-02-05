"use strict";

/**
 * @file ELock
 * @author Yourtion Guo <yourtion@gmail.com>
 */
import { Redis } from "ioredis";

export interface IELockOptions {
  prefix?: string;
  timeout?: number;
}

class ELock {

  private client: Redis;
  private prefix: string;
  private timeout: number;

  constructor(redis: Redis, options: IELockOptions) {
    this.client = redis;
    this.prefix = options.prefix ? "l:" + options.prefix : "l:" + new Date().getTime();
    this.timeout = options.timeout || 1000;
  }

  public acquire(key = "default", timeout: number = this.timeout) {
    return this.client.set(this.getKey(key), new Date().getTime(), "PX", timeout, "NX");
  }

  public release(key = "default") {
    return this.client.del(this.getKey(key));
  }

  public locked(key = "default") {
    return this.client.get(this.getKey(key)).then((res) => !!res);
  }

  private getKey(key: string) {
    return this.prefix + ":" + key;
  }
}

export default ELock;
