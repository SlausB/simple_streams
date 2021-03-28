
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";
import Operator from "../operator";

export default function( ... params : any[] )
{
    const args = Args( "take", params, { maxTargets : 0, needNumber : true } );
    
    const operator = new Operator( apply, 'take' )
    //@ts-ignore
    operator.number = args.number
    
    const r = new Stream( args.source._name + ".take" );
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
    if ( ! edge.operator.took )
        //@ts-ignore
        edge.operator.took = 0;
    //@ts-ignore
    ++ edge.operator.took;
    //@ts-ignore
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

