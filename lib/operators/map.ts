
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";
import Operator from "../operator";

export default function( ... params : any[] )
{
    const args = Args( "map", params, { maxTargets : 0, needF : true } );
    
    const operator = new Operator( apply, 'map' )
    //@ts-ignore
    operator.f = args.f
    //@ts-ignore
    operator.destructor = () => delete operator.f;
    
    const r = new Stream( args.source._name + ".map" );
    new Edge(
        args.source,
        r,
        operator
    );
    return r;
}

function apply( edge : Edge )
{
    //@ts-ignore
    edge.child.value = edge.operator.f( edge.parent.value );
    return true;
}

