
const queue: any[] = []
export function queueJobs(job) {
    if(!queue.includes(job)) {
        queue.push(job)
    }
    queueFlush()
}

function queueFlush() {
    Promise.resolve().then(() => {
        let job
        while (job = queue.shift()) {
            job && job()
        }
    })
}