
declare function stream< Type >( space : { names : string[] }, stream : string, value : Type ) : undefined

const space = { names : [] }
const stream_type = {
    value : 100500,
    something : 'my complicated type',
}
stream!!( space, 'hi', stream_type )

console.log( 'space:', space )
