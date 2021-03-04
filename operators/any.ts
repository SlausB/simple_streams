
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";

export default function()
{
    const args = Args( "any", arguments, { canF : true, minTargets : 1 } );
    
    const operator = {
        apply,
        f : args.f
    };
    operator.destructor = () => delete operator.f;
    
    const r = new Stream( args.source._name + ".any" );
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
    const values = edge.child.parents.map( parentEdge => parentEdge.parent.value );
    if ( edge.operator.f )
    {
        edge.child.value = edge.operator.f.apply( null, values );
    }
    else
    {
        edge.child.value = values;
    }
    return true;
}

