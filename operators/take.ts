
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";

export default function()
{
    const args = Args( "take", arguments, { maxTargets : 0, needNumber : true } );
    
    const operator = {
        apply,
        number : args.number
    };
    
    const r = new Stream( args.source._name + ".take" );
    new Edge(
        args.source,
        r,
        operator
    );
    return r;
}

function apply( edge )
{
    if ( ! edge.operator.took ) edge.operator.took = 0;
    ++ edge.operator.took;
    if ( edge.operator.took > edge.operator.number )
    {
        return false;
    }
    else
    {
        edge.child.value = edge.parent.value;
        return true;
    }
}

