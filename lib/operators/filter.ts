
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";
import Operator from "../operator";

export default function( ... params : any[] )
{
    const args = Args( "filter", params, { maxTargets : 0, needF : true } );
    
    const operator = new Operator( apply, 'filter' )
    //@ts-ignore
    operator.f = args.f
    //@ts-ignore
    operator.destructor = () => delete operator.f;
    
    const r = new Stream( args.source._name + ".filter" );
    new Edge(
        args.source,
        r,
        operator
    );
    return r;
}

function apply( edge : Edge )
{
    const parentValue = edge.child.parents[ 0 ].parent.value;
    //@ts-ignore
    const passed = edge.operator.f( parentValue );
    if ( passed )
    {
        edge.child.value = parentValue;
    }
    return passed;
}

