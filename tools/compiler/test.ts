import Space from './space'

class EmbeddedType {
    field = 'embedded field'
    method( param : string ) {
        return false
    }
}

const stream_type = {
    value : 100500,
    something : 'part of my complicated type',
    embedded : new EmbeddedType,
}

const space = new Space
space.s( 'first', stream_type )

space.s( 'second', 42 )

console.log( 'space:', space )
