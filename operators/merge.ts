
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";

export default function()
{
    const args = Args( "merge", arguments, { minTargets : 1 } );
    
    const operator = {
        apply
    };
    
    const r = new Stream( args.source._name + ".merge" );
    r.parents = [];
    const glue = t => {
        new Edge(
            t,
            r,
            operator
        );
    };
    glue( args.source );
    for ( const t of args.targets ) glue( t );
    return r;
}

function apply( edge )
{
    edge.child.value = edge.parent.value;
    return true;
}

