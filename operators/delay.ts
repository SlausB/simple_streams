
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";
import Operator from "../operator";

class DelayOperator extends Operator {
    number : number
    timeouts : ReturnType<typeof setTimeout>[] = []

    constructor( number : number ) {
        super( apply, 'delay' )
        this.number = number
        this.destructor = () => {
            if ( this.timeouts )
            {
                for ( const timeout of this.timeouts )
                    clearTimeout( timeout );
                delete this.timeouts;
            }
        }
    }
}

export default function( ... params : any[] )
{
    const args = Args( "delay", params, { needNumber : true, maxTargets : 0 } );
    
    const operator = new DelayOperator( args.number )
    
    const r = new Stream( args.source._name + ".delay" );
    new Edge(
        args.source,
        r,
        operator
    );
    return r;
}

function apply( edge : Edge )
{
    //bind value now since it can change during the timeout:
    const value = edge.parent.value;
    const operator = edge.operator as DelayOperator
    const timeout = setTimeout(
        () => {
            operator.timeouts.splice( operator.timeouts.indexOf( timeout ), 1 );
            edge.child.next( value );
        },
        operator.number
    );
    if ( ! operator.timeouts )
        operator.timeouts = [ timeout ];
    else
        operator.timeouts.push( timeout );
    return false;
}

