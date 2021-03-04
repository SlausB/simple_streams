
/** That's what any operator creates besides spawning another stream. Connection between two streams where "parent" is the one whose method was called to make an operator (and any parameters) and "child" is the spawned stream.
@param params depends on operator. Mostly just a function.
*/
export default class Edge
{
    constructor( parent, child, operator )
    {
        this.parent = parent;
        this.child = child;
        this.operator = operator;
        //true if child had the same rank when parent approached it:
        this.pending = false;
        
        parent.children.push( this );
        child.parents.push( this );
    }
    
    destructor( fromParent, fromChild )
    {
        //remove from parent:
        if ( fromChild )
        {
            this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
            delete this.parent;
        }
        
        //remove from child:
        if ( fromParent )
        {
            this.child.parents.splice( this.child.parents.indexOf( this ), 1 );
            delete this.child;
        }
        
        if ( this.operator )
        {
            if ( this.operator.destructor ) this.operator.destructor();
            delete this.operator;
        }
    }
}


