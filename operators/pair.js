
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";

export default function()
{
    const args = Args( "pair", arguments, { maxTargets : 0 } );
    const operator = {
        apply
    };
    
    const r = new Stream( args.source._name + ".pair" );
    new Edge(
        args.source,
        r,
        operator
    );
    operator.destructor = () => delete operator.pair;
    return r;
}

function apply( edge )
{
    if ( ! edge.operator.pair ) edge.operator.pair = [ edge.parent.value ];
    else edge.operator.pair.push( edge.parent.value );
    if ( edge.operator.pair.length >= 2 )
    {
        if ( edge.operator.pair.length > 2 ) edge.operator.pair.shift();
        edge.child.value = edge.operator.pair.concat();
        return true;
    }
    return false;
}

