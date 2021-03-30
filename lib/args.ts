
import Operator from "./operator";
import Space from "./space";
import Stream from "./stream";

export class ParsedArgs {
    source : Stream
    targets : Stream[] = []
    f : any = undefined
    number ?: number = undefined

    constructor( source : Stream ) {
        this.source = source
    }
}

/** Parse arguments for arbitrary operator semantic with specified requirements.*/
export default function Args(
    space : Space,
    operator : string,
    args : any[],
    options : any,
)
{
    if ( args.length < 1 )
        throw new Error( "At least source must be specified." )
    let source = args[ 0 ];
    if ( is_string( source ) )
        source = space.s( source as string )
    if ( ! ( source instanceof Stream ) )
        throw new Error( "Source must be an instance of Stream." )
    
    const r = new ParsedArgs( source )

    const { minTargets, maxTargets, canF, needF, canNumber, needNumber } = options

    function handle_stream( stream : Stream ) {
        if ( ! isNaN( maxTargets ) && maxTargets <= 0 )
            throw new Error( operator + ": No target streams allowed." )
        
        if ( ! r.targets )
            r.targets = [ stream ];
        else
            r.targets.push( stream );
        
        if ( ! isNaN( maxTargets ) && r.targets.length > maxTargets )
            throw new Error( operator + ": At most " + maxTargets + " target streams are allowed." )
    }
    
    for ( let i = 0; i < args.length; ++ i )
    {
        const arg = args[ i ];
        if ( arg instanceof Stream )
        {
            handle_stream( arg as Stream )
        }
        else if ( is_string( arg ) )
        {
            handle_stream( space.s( arg as string ) )
        }
        else if ( is_function( arg ) )
        {
            if ( r.f )
                throw new Error( "Cannot have more than one function as an argument." )
            if ( canF === false )
                throw new Error( operator + ": Cannot have a function as an argument." )
            r.f = arg;
        }
        else if ( ! isNaN( arg ) )
        {
            if ( canNumber === false )
                throw new Error( operator + ": Cannot have a number as an argument." )
            r.number = arg;
        }
        else
        {
            throw new Error( "Undefined parameter type of" + arg )
        }
    }
    
    if ( ! isNaN( minTargets ) && ( r.targets ? r.targets.length : 0 ) < minTargets )
        throw new Error( operator + ": At least " + minTargets + " target streams are needed." )
    
    if ( needF === true && r.f === undefined )
        throw new Error( operator + ": Must have a function as some argument." )
    
    if ( needNumber === true && r.number === undefined )
        throw new Error( operator + ": Must have a number as some argument." )
    
    return r;
}

export function literal_stream( s : Stream | string, space : Space ) {
    if ( is_string( s ) ) {
        return space.s( s as string )
    }
    return s as Stream
}

export function is_string( s : any ) {
    return typeof s === 'string' || s instanceof String
}

export function is_function( f : any ) {
    return typeof f === "function"
}



