
import Edge from "../edge"
import Operator from "../operator"

export default class Do extends Operator {
    f ?: ( value : number ) => any
    constructor( f : ( value : number ) => any ) {
        super( apply, 'do' )
        this.f = f
        this.destructor = () => delete this.f
    }
}

function apply( edge : Edge )
{
    const operator = edge.operator as Do
    if ( operator.f )
        operator.f( edge.parent.value )
    edge.child.value = edge.parent.value
    return true;
}

