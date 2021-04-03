import Space from '../../lib/space'

function just_function() {
    return 'hello'
}

const space = new Space
space.s( 'function_call_result_type', just_function() )
