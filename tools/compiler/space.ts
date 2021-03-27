
export default class Space {
    streams : Stream[] = []

    s< Value >( name : string, value : Value ) : Space
    {
        const stream = new Stream( name )
        stream.value = value
        this.streams.push( stream )
        return this
    }
}

class Stream {
    name : string
    value : any

    constructor( name : string ) {
        this.name = name
    }
}
