
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";
import Operator from '../operator'

export default function( ... params : any[] )
{
    const args = Args( "to", params, { minTargets : 1 } );
    
    const operator = new Operator( apply, 'to' )
    
    for ( const t of args.targets )
    {
        new Edge(
            args.source,
            t,
            operator
        );
    }
    
    return args.source;
}

function apply( edge )
{
    edge.child.value = edge.parent.value;
    return true;
}

