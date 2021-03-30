
import Edge from "../edge"
import Operator from "../operator"

export default class Take extends Operator {
    times : number
    took : number = 0

    constructor( times : number ) {
        super( apply, 'take' )
        this.times = times
    }
}

function apply( edge : Edge )
{
    const take = edge.operator as Take
    ++ take.took
    if ( take.took > take.times )
    {
        return false;
    }
    else
    {
        edge.child.value = edge.parent.value;
        return true;
    }
}

