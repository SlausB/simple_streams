import Edge from "./edge";

import { SETTINGS } from './space'

export default class Propagating
{
    /** last propagated stream value */
    value : any = undefined
    children : Edge[] = []
    parents : Edge[] = []
    
    destructor()
    {
        if ( this.children )
            for ( const child of this.children )
                child.destructor( this, undefined );
        //can't just delete children here because pend() relies on it, so moving the processing load here because this operation is supposed to occur much less frequently:
        //delete this.children;
        this.children.length = 0
        
        if ( this.parents )
            for ( const parent of this.parents )
                parent.destructor( undefined, this );
        //... the same:
        //delete this.parents;
        this.parents.length = 0
    }
    
    propagate( v : any )
    {
        this.value = v;
        if ( pend( this ) )
            return;
        if ( propagating )
            return;
        propagating = true;
        while ( S.length > 0 )
        {
            let pending = undefined;
            let any = undefined;
            for ( const node of S )
            {
                for ( const childEdge of node.children )
                {
                    //if parent does not propagate to child (dependence from bottom to top only):
                    if ( childEdge.weak )
                        continue;
                    
                    if ( resolved( childEdge.child ) )
                        continue;
                    
                    //if all the parents was already resolved and so this one is independent:
                    if ( childEdge.child.pending( childEdge ) )
                    {
                        pending = childEdge;
                        break;
                    }
                    any = childEdge;
                }
                if ( pending )
                    break;
            }
            
            const resolving = pending || any;
            if ( ! resolving )
            {
                S = [];
                break;
            }
            
            //say that chosen node was resolved:
            L.push( resolving.child );
            //remove all the parents whose [all] children was resolved:
            for ( const parentEdge of resolving.child.parents )
            {
                if ( parentEdge.parent.childrenResolved )
                {
                    const i = S.indexOf( parentEdge.parent );
                    if ( i >= 0 )
                        S.splice( i, 1 );
                }
            }
            
            const further = apply( resolving );
            
            if ( further )
                pend( resolving.child );
        }
        propagating = false;
        L = [];
    }
    
    /** Returns true if all the children was resolved in the current propagation course (they may need to recursively resolve more than once, btw) and so current node can be removed from S.*/
    get childrenResolved()
    {
        for ( const childEdge of this.children )
        {
            if ( childEdge.weak )
                continue;
            if ( ! resolved( childEdge.child ) )
                return false;
        }
        return true;
    }
    
    /** Returns true if all the parents of current node was already resolved in the current propagation course and so current node is "free" of dependencies and can also be resolved.*/
    pending( fromEdge : Edge )
    {
        for ( const parentEdge of this.parents )
        {
            //design flaw: "to" operators clump the target stream and force normal propagation coarse to wait for all other parents (which are "to") to resolve which is unneeded:
            if ( parentEdge !== fromEdge && parentEdge.operator.name === "to" )
                continue;
            
            if ( ! resolved( parentEdge.parent ) )
                return false;
        }
        return true;
    }
}

//nodes whose children need to be resolved yet in current propagation:
let S : Propagating[] = [];
//nodes which was already resolved in the current propagation:
let L : Propagating[] = [];

//actually the same as L.length > 0 || S.length > 0
let propagating = false;

function apply( edge : Edge )
{
    if ( SETTINGS.try_catch_apply ) {
        try
        {
            return edge.operator.apply( edge );
        }
        catch ( e )
        {
            console.error( "apply() failed:", e.message, e );
            return false;
        }
    }
    else {
        return edge.operator.apply( edge )
    }
}

/** Add node to the propagation course. Read it's children if needed (recursive propagation).*/
function pend( node : Propagating )
{
    if ( node.children.length <= 0 )
        return true;
    
    if ( S.indexOf( node ) < 0 )
        S.push( node );
    
    //children must be updated again:
    for ( const childEdge of node.children )
    {
        //if parent does not propagate to child (dependence from bottom to top only):
        if ( childEdge.weak )
            continue;
        
        const i = L.indexOf( childEdge.child );
        if ( i >= 0 )
            L.splice( i, 1 );
    }
    
    if ( L.indexOf( node ) < 0 )
        L.push( node );
    return false;
}

function resolved( node : Propagating )
{
    return L.indexOf( node ) >= 0;
}

