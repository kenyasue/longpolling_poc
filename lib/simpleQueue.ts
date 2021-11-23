const itemLifeSpan = 10 * 1000; //ms

class QueueItem {

    expiredAt: number = 0;
    payload: any = {};
    key: string = "";

    constructor(key: string, payload: any) {
        this.expiredAt = Date.now();
        this.key = key;
        this.payload = payload;
    }

}

export default class SimpleQueue {

    queue: Array<QueueItem> = [];

    constructor() {

    }

    push(key: string, payload: any) {

        this.queue.push(new QueueItem(key, payload));

    }

    count() {
        return this.queue.length;
    }
}
