
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";
import Operator from "../operator";

export default function( ... params : any[] )
{
    const args = Args( "merge", params, { minTargets : 1 } );
    
    const operator = new Operator( apply, 'merge' )
    
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
    for ( const t of args.targets )
        glue( t );
    return r;
}

function apply( edge : Edge )
{
    edge.child.value = edge.parent.value;
    return true;
}

