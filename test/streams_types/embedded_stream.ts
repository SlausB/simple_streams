import Space from '../../lib/space'

const space = new Space

space.s( 'my_stream' )
    .to( space.s( 'source' ).map( a => a ) )