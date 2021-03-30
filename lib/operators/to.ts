import Edge from "../edge"
import Operator from "../operator"

export default class To extends Operator {
    constructor() {
        super( apply, 'to' )
    }
}

function apply( edge : Edge )
{
    edge.child.value = edge.parent.value;
    return true;
}
