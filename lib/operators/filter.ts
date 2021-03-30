
import Edge from "../edge"
import Operator from "../operator"

export default class Filter extends Operator {
    f ?: ( value : any ) => boolean
    constructor( f : ( value : any ) => boolean ) {
        super( apply, 'filter' )
        this.f = f
        this.destructor = () => delete this.f
    }
}

function apply( edge : Edge )
{
    const parentValue = edge.child.parents[ 0 ].parent.value;
    const filter = edge.operator as Filter
    if ( ! filter.f )
        return false
    const passed = filter.f( parentValue );
    if ( passed )
    {
        edge.child.value = parentValue;
    }
    return passed;
}

