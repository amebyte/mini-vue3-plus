
let activePostFlushCbs: any = null
let postFlushIndex = 0
const pendingPostFlushCbs: any[] = []
const queue: any[] = []
let isFlushPending = false
const p = Promise.resolve()
export function nextTick(fn) {
    return fn ? p.then(fn) : p
}

const getId = (job): number =>
  job.id == null ? Infinity : job.id

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
      activePostFlushCbs.sort((a, b) => getId(a) - getId(b))
      
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
    // 组件更新前队列执行
    // flushPreFlushCbs(seen)
    try{
        // 组件更新队列执行
        let job
        while (job = queue.shift()) {
            job && job()
        }
    } finally {
        // 组件更新后队列执行
        flushPostFlushCbs(seen)

        // 如果在执行异步任务的过程中又产生了新的队列，那么则继续回调执行
        if (
            queue.length ||
            // pendingPreFlushCbs.length ||
            pendingPostFlushCbs.length
        ) {
            flushJobs(seen)
        }
    }
}