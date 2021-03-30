import Edge from "../edge";
import Operator from "../operator";

export default class Changed extends Operator {
    f ?: Function
    constructor( f ?: Function ) {
        super( apply, 'changed' )
        this.f = f
        this.destructor = () => delete this.f
    }
}

function apply( edge : Edge )
{
    let changed : boolean;
    //@ts-ignore
    if ( edge.had )
    {
        const operator = edge.operator as Changed
        if ( operator.f )
            changed = ! operator.f( edge.child.value, edge.parent.value );
        else
            changed = edge.child.value != edge.parent.value;
    }
    else
    {
        //@ts-ignore
        edge.had = true;
        changed = true;
    }
    if ( changed )
    {
        edge.child.value = edge.parent.value;
        return true;
    }
    return false;
}

