import Space from '../../lib/space'

const space = new Space

//space.s( 'my_stream', true )
space.s( 'my_stream' )
    .to( space.s( 'another_stream' ) )