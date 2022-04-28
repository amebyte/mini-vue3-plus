
let activePostFlushCbs: any = null
let postFlushIndex = 0
const pendingPostFlushCbs: any[] = []
const queue: any[] = []
let isFlushPending = false
const p = Promise.resolve()
export function nextTick(fn) {
    return fn ? p.then(fn) : p
}

export function queueJobs(job) {
    if(!queue.includes(job)) {
        queue.push(job)
    }
    queueFlush()
}

export function queuePostFlushCb(cb) {
    queueCb(cb, pendingPostFlushCbs)
}

export function flushPostFlushCbs(seen?) {
    if (pendingPostFlushCbs.length) {
      const deduped = [...new Set(pendingPostFlushCbs)]
      pendingPostFlushCbs.length = 0
      console.log('deduped', deduped, 'pendingPostFlushCbs', pendingPostFlushCbs)
      activePostFlushCbs = deduped
      console.log('activePostFlushCbs', activePostFlushCbs)
      for (
        postFlushIndex = 0;
        postFlushIndex < activePostFlushCbs.length;
        postFlushIndex++
      ) {
        activePostFlushCbs[postFlushIndex]()
      }
      activePostFlushCbs = null
      postFlushIndex = 0
    }
  }

function queueCb(
    cb,
    pendingQueue
  ) {
      console.log('cb', cb)
    pendingQueue.push(...cb)
    console.log('pendingQueue', pendingQueue, 'pendingPostFlushCbs', pendingPostFlushCbs)
    queueFlush()
  }

function queueFlush() {
    if(isFlushPending) return
    isFlushPending = true
    nextTick(flushJobs)
}

function flushJobs(seen?) {
    isFlushPending = false
    try{
        let job
        while (job = queue.shift()) {
            job && job()
        }
    } finally {
        flushPostFlushCbs(seen)
    }
}