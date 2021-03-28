import Space from './space'

class EmbeddedType {
    field = 'embedded field'
    method( param : string ) {
        return false
    }
}

const stream_type = {
    //value : 100500,
    //something : 'part of my complicated type',
    embedded : new EmbeddedType,
}

const space = new Space
space.s( 'hi', stream_type )

console.log( 'space:', space )
