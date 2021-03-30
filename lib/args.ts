
import Operator from "./operator";
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
export default function Args( operator : string, args : any[], options : any )
{
    if ( args.length < 1 )
        throw "At least source must be specified.";
    const source = args[ 0 ];
    if ( ! ( source instanceof Stream ) )
        throw "Source must be an instance of Stream.";
    
    const r = new ParsedArgs( source )

    const { minTargets, maxTargets, canF, needF, canNumber, needNumber } = options
    
    for ( let i = 1; i < args.length; ++ i )
    {
        const arg = args[ i ];
        if ( arg instanceof Stream )
        {
            if ( ! isNaN( maxTargets ) && maxTargets <= 0 )
                throw operator + ": No target streams allowed.";
            
            if ( ! r.targets )
                r.targets = [ arg ];
            else
                r.targets.push( arg );
            
            if ( ! isNaN( maxTargets ) && r.targets.length > maxTargets )
                throw operator + ": At most " + maxTargets + " target streams are allowed.";
        }
        else if ( typeof arg === "function" )
        {
            if ( r.f )
                throw "Cannot have more than one function as an argument.";
            if ( canF === false )
                throw operator + ": Cannot have a function as an argument.";
            r.f = arg;
        }
        else if ( ! isNaN( arg ) )
        {
            if ( canNumber === false )
                throw operator + ": Cannot have a number as an argument.";
            r.number = arg;
        }
        else
        {
            throw "Undefined parameter type of" + arg;
        }
    }
    
    if ( ! isNaN( minTargets ) && ( r.targets ? r.targets.length : 0 ) < minTargets )
        throw operator + ": At least " + minTargets + " target streams are needed.";
    
    if ( needF === true && r.f === undefined )
        throw operator + ": Must have a function as some argument.";
    
    if ( needNumber === true && r.number === undefined )
        throw operator + ": Must have a number as some argument.";
    
    return r;
}



