interface ICallback<T> {
    (object: T): void;
}

class ListItem<T> {
    object: T;
    created: Date;

    constructor(object?:T) {
        this.object = object;
        this.created = new Date();
    }
}

export class IntervalPoller<T> {
    private objects: ListItem<T>[];
    private intervalHandle: number;
    private callback: ICallback<T>;
    private interval: number;
    private maxAge: number;

    constructor(interval: number, callback: ICallback<T>, maxAge: number) {
        this.objects = [];
        this.callback = callback;
        this.interval = interval;
        this.maxAge = maxAge;

        this.intervalHandle = window.setInterval(() => this.onTimer(), this.interval);
    }
    
    add(obj: T): void {
        this.objects.push(new ListItem(obj));
    }

    remove(obj: T): boolean {
        let index = this.objects.findIndex(i => i.object === obj);
        if (index >= 0) {
            this.objects.splice(index, 1);
            return true;
        }
        return false;
    }

    stop(): void {
        window.clearInterval(this.intervalHandle);
    }

    private onTimer() {
        let objectsToDelete: T[] = [];
        for (var o of this.objects) {
            if (Date.now() - o.created.valueOf() > this.maxAge) {
                objectsToDelete.push(o.object);
            } else {
                this.callback(o.object);
            }
        }
        for (var d of objectsToDelete) {
            this.remove(d);
        }
    }
}