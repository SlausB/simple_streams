
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";
import Operator from "../operator";

export default function( ... params : any[] )
{
    const args = Args( "on", params, { maxTargets : 0, needF : true } );
    
    const operator = new Operator( apply, 'on' )
    //@ts-ignore
    operator.f = args.f
    //@ts-ignore
    operator.destructor = () => delete operator.f;
    
    const r = new Stream( args.source._name + ".on" );
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
    edge.operator.f( edge.parent.value );
    return false;
}

