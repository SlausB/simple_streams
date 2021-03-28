export default class Space {
    constructor() {
        this.streams = [];
    }
    s(name, value) {
        const stream = new Stream(name);
        stream.value = value;
        this.streams.push(stream);
        return this;
    }
}
class Stream {
    constructor(name) {
        this.name = name;
    }
}
