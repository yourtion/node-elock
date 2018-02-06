# node-elock

Easy use distributed redis lock implementation

## Installation

```bash
npm install elock --save
```

## Usage

```javascript
// Init redis client
const Redis = require('ioredis');
const redisClient = new Redis();

// Init ELock
const ELock = require('elock');
const lock = new ELock({ redis: redisClient });

// Acquire Lock
lock.acquire('key').then(() => {
  // do someting when get lock

  // release after done
  return lock.release('key')
}).catch((err) => {
  // err when can't get lock
})

// Get lock
lock.get('key').then((res) => {
  if(res === null) return '' // null is get lock fail
  // do someting when get lock
})

// Check is Locked
lock.locked('key').then((locked) => {
  // locked is a boolean
})
```
