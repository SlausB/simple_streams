
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";

export default function()
{
    const args = Args( "delay", arguments, { needNumber : true, maxTargets : 0 } );
    
    const operator = {
        apply,
        number : args.number
    };
    operator.destructor = () => {
        if ( operator.timeouts )
        {
            for ( const timeout of operator.timeouts ) clearTimeout( timeout );
            delete operator.timeouts;
        }
    };
    
    const r = new Stream( args.source._name + ".delay" );
    new Edge(
        args.source,
        r,
        operator
    );
    return r;
}

function apply( edge )
{
    //bind value now since it can change during the timeout:
    const value = edge.parent.value;
    const timeout = setTimeout(
        () => {
            edge.operator.timeouts.splice( edge.operator.timeouts.indexOf( timeout ), 1 );
            edge.child.next( value );
        },
        edge.operator.number
    );
    if ( ! edge.operator.timeouts ) edge.operator.timeouts = [ timeout ];
    else edge.operator.timeouts.push( timeout );
    return false;
}

