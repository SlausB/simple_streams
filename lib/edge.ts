
import Operator from './operator'
import Propagating from './propagating'
import Stream from './stream'

/** That's what any operator creates besides spawning another stream. Connection between two streams where "parent" is the one whose method was called to make an operator (and any parameters) and "child" is the spawned stream.
@param params depends on operator. Mostly just a function.
*/
export default class Edge
{
    parent : Stream
    child : Stream
    operator : Operator
    /** if parent does not propagate to child (dependence from bottom to top only) */
    down = false
    /** true if child had the same rank when parent approached it */
    pending = false

    constructor( parent : Stream, child : Stream, operator : Operator )
    {
        this.parent = parent;
        this.child = child;
        this.operator = operator;
        
        parent.children.push( this );
        child.parents.push( this );
    }
    
    destructor( fromParent ?: Propagating, fromChild ?: Propagating )
    {
        //remove from parent:
        if ( fromChild )
        {
            this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
            //@ts-ignore
            delete this.parent;
        }
        
        //remove from child:
        if ( fromParent )
        {
            this.child.parents.splice( this.child.parents.indexOf( this ), 1 );
            //@ts-ignore
            delete this.child;
        }
        
        if ( this.operator )
        {
            if ( this.operator.destructor )
                this.operator.destructor();
            //@ts-ignore
            delete this.operator;
        }
    }
}


