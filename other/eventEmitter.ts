class EventEmitter {
    events: { [evt: string]: any[] | null } = {};

    on = (evt: string, cb: (...args: any[]) => void) => {
        if (!this.events[evt]) {
            this.events[evt] = [];
        }
        this.events[evt]!.push(cb);
    };

    off = (evt: string, cb?: (...args: any[]) => void) => {
        if (cb) {
            this.events[evt] = this.events[evt]!.filter(item => item !== cb);
        }
        else {
            this.events[evt] = null;
        }
    };

    // 只触发一次
    once = (evt: string, cb: (...args: any[]) => void) => {
        const func = (...args: any[]) => {
            this.off(evt, func);
            cb.apply(this, args);
        };
        this.on(evt, func);
    };

    emit = (evt: string, ...args: any[]) => {
        const cbs = this.events[evt];
        if (cbs) {
            cbs.forEach(cb => {
                cb.apply(this, args);
            });
        }
    };
}