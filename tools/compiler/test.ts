import Space from './space'

const stream_type = {
    value : 100500,
    something : 'part of my complicated type',
}

const space = new Space
space.s( 'hi', stream_type )

console.log( 'space:', space )
