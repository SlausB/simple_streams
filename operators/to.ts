
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";

export default function()
{
    const args = Args( "to", arguments, { minTargets : 1 } );
    
    const operator = {
        apply,
        name : "to"
    };
    
    for ( const t of args.targets )
    {
        new Edge(
            args.source,
            t,
            operator
        );
    }
    
    return args.source;
}

function apply( edge )
{
    edge.child.value = edge.parent.value;
    return true;
}

