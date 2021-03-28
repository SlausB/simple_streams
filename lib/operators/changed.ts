
import Stream from "../stream";
import Edge from "../edge";
import Args from "../args";
import Operator from "../operator";

class ChangedOperator extends Operator {
    f : Function
    constructor( f : Function ) {
        super( apply, 'changed' )
        this.f = f
        this.destructor = () => delete this.f
    }
}

export default function( ... params : any[] )
{
    const args = Args( "changed", params, { maxTargets : 0, canF : true } );
    

    const operator = new ChangedOperator( args.f )
    operator.destructor = () => delete operator.f;
    
    const r = new Stream( args.source._name + ".changed" );
    new Edge(
        args.source,
        r,
        operator
    );
    return r;
}

function apply( edge : Edge )
{
    let changed : boolean;
    //@ts-ignore
    if ( edge.had )
    {
        const operator = edge.operator as ChangedOperator
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

