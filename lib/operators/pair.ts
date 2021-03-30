
import Stream from "../stream";
import Edge from "../edge";
import Operator from "../operator";

export default class Pair extends Operator {
    pair ?: any[] = undefined
    constructor() {
        super( apply, 'pair' )
        this.destructor = () => delete this.pair
    }
}

function apply( edge : Edge )
{
    const operator = edge.operator as Pair
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

