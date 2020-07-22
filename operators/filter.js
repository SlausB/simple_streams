
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";

export default function()
{
    const args = Args( "filter", arguments, { maxTargets : 0, needF : true } );
    
    const operator = {
        apply,
        f : args.f
    };
    operator.destructor = () => delete operator.f;
    
    const r = new Stream( args.source._name + ".filter" );
    new Edge(
        args.source,
        r,
        operator
    );
    return r;
}

function apply( edge )
{
    const parentValue = edge.child.parents[ 0 ].parent.value;
    const passed = edge.operator.f( parentValue );
    if ( passed )
    {
        edge.child.value = parentValue;
    }
    return passed;
}

