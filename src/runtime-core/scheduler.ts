
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

function queueFlush() {
    if(isFlushPending) return
    isFlushPending = true
    nextTick(flushJobs)
}

function flushJobs() {
    isFlushPending = false
    let job
    while (job = queue.shift()) {
        job && job()
    }
}