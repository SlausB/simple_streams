import Space from '../../lib/space'

const space = new Space

space.s( 'my_stream', true )
    .to( space.s( 'source', false ).map( ( a : boolean ) => a ) )