"use strict";

/**
 * @file ELock
 * @author Yourtion Guo <yourtion@gmail.com>
 */
import Promise = require("bluebird");
import { Redis } from "ioredis";

export interface IELockOptions {
  prefix?: string;
  timeout?: number;
}

/**
 * Easy use distributed redis lock implementation
 *
 * @class ELock
 */
class ELock {

  private client: Redis;
  private prefix: string;
  private timeout: number;

  /**
   * Creates an instance of ELock.
   * @param {Redis} redis ioredis client
   * @param {IELockOptions} options options
   * @memberof ELock
   */
  constructor(redis: Redis, options: IELockOptions) {
    this.client = redis;
    this.prefix = options.prefix ? "l:" + options.prefix : "l:" + new Date().getTime();
    this.timeout = options.timeout || 1000;
  }

  /**
   * Acquire a lock (fail will throw a error)
   *
   * @param {string} [key="default"] lock key
   * @param {number} [timeout=this.timeout] lock time (ms)
   * @returns {Promise}
   * @memberof ELock
   */
  public acquire(key = "default", timeout: number = this.timeout) {
    return this.client.set(this.getKey(key), new Date().getTime(), "PX", timeout, "NX");
  }

  /**
   * Get a lock (fail will return null)
   *
   * @param {string} [key="default"] lock key
   * @param {number} [timeout=this.timeout] lock time (ms)
   * @returns {Promise}
   * @memberof ELock
   */
  public get(key = "default", timeout: number = this.timeout) {
    return this.client.set(this.getKey(key), new Date().getTime(), "PX", timeout, "NX");
  }

  /**
   * Release the lock
   *
   * @param {string} [key="default"] lock key
   * @returns @returns {Promise}
   * @memberof ELock
   */
  public release(key = "default") {
    return this.client.del(this.getKey(key));
  }

  /**
   * Check is locked
   *
   * @param {string} [key="default"] lock key
   * @returns {Promise}
   * @memberof ELock
   */
  public locked(key = "default") {
    return this.client.get(this.getKey(key)).then((res) => !!res);
  }

  /**
   * Get the real lock key in redis
   *
   * @private
   * @param {string} key
   * @returns {string}
   * @memberof ELock
   */
  private getKey(key: string) {
    return this.prefix + ":" + key;
  }
}

export default ELock;
