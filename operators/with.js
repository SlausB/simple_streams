
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";

export default function()
{
    const args = Args( "with", arguments, { canF : true, minTargets : 1 } );
    
    const operator = {
        apply,
        f : args.f
    };
    operator.destructor = () => delete operator.f;
    
    const r = new Stream( args.source._name + ".with" );
    new Edge(
        args.source,
        r,
        operator
    );
    for ( const t of args.targets )
    {
        const R = new Edge(
            t,
            r,
            operator
        );
        R.down = true;
    }
    return r;
}

/** Apply operator in edge from parent to child.
* @param path edge through which propagation has come to this Stream. .child is this Stream. Now it's parent within that edge.
* @return true if value has changed and so stream must be propagated further (to it's children).*/
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
