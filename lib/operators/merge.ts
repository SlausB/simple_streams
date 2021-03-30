
import Edge from "../edge"
import Operator from "../operator"

export default class Merge extends Operator {
    constructor(){
        super( apply, 'merge' )
    }
}

function apply( edge : Edge )
{
    edge.child.value = edge.parent.value;
    return true;
}

