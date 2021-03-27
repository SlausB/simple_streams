
function stream< Space, Value >( space : Space, stream : string, value : Value ) : Space
{
    //nothing here
    return space
}

const space = { types : [] }
const stream_type = {
    value : 100500,
    something : 'part of my complicated type',
}
stream( space, 'hi', stream_type )

console.log( 'space:', space )
