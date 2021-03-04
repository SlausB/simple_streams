
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";

export default function()
{
    const args = Args( "do", arguments, { maxTargets : 0, needF : true } );
    
    const operator = {
        apply,
        f : args.f
    };
    operator.destructor = () => delete operator.f;
    
    const r = new Stream( args.source._name + ".do" );
    new Edge(
        args.source,
        r,
        operator
    );
    return r;
}

function apply( edge )
{
    edge.operator.f( edge.parent.value );
    edge.child.value = edge.parent.value
    return true;
}

