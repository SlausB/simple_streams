
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";

export default function()
{
    const args = Args( "changed", arguments, { maxTargets : 0, canF : true } );
    
    const operator = {
        apply,
        f : args.f
    };
    operator.destructor = () => delete operator.f;
    
    const r = new Stream( args.source._name + ".changed" );
    new Edge(
        args.source,
        r,
        operator
    );
    return r;
}

function apply( edge )
{
    let changed;
    if ( edge.had )
    {
        if ( edge.operator.f ) changed = ! edge.operator.f( edge.child.value, edge.parent.value );
        else changed = edge.child.value != edge.parent.value;
    }
    else
    {
        edge.had = true;
        changed = true;
    }
    if ( changed )
    {
        edge.child.value = edge.parent.value;
        return true;
    }
    return false;
}

