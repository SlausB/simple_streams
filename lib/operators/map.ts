
import Edge from "../edge"
import Operator from "../operator"

export default class Map extends Operator {
    f ?: ( value : any ) => any
    constructor( f : ( value : any ) => any ) {
        super( apply, 'map' )
        this.f = f
        this.destructor = () => delete this.f
    }
}

function apply( edge : Edge )
{
    const map = edge.operator as Map
    if ( map.f ) {
        edge.child.value = map.f( edge.parent.value )
        return true
    }
    return false
}

