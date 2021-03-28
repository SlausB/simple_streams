
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";
import Operator from "../operator";

class PairOperator extends Operator {
    pair : any[] = undefined
    constructor() {
        super( apply, 'pair' )
        this.destructor = () => delete this.pair
    }
}

export default function( ... params : any[] )
{
    const args = Args( "pair", params, { maxTargets : 0 } );
    const operator = new PairOperator
    
    const r = new Stream( args.source._name + ".pair" );
    new Edge(
        args.source,
        r,
        operator
    );
    return r;
}

function apply( edge : Edge )
{
    const operator = edge.operator as PairOperator
    if ( ! operator.pair )
        operator.pair = [ edge.parent.value ];
    else
        operator.pair.push( edge.parent.value );
    if ( operator.pair.length >= 2 )
    {
        if ( operator.pair.length > 2 )
            operator.pair.shift();
        edge.child.value = operator.pair.concat();
        return true;
    }
    return false;
}

