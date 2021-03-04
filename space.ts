
import Stream from "./stream";

const DELIMITER = ":";

export default class Space
{
    constructor( name, description = '' )
    {
        if ( name && name.indexOf( DELIMITER ) >= 0 ) throw "Space name cannot have delimiter (which is \"" + DELIMITER + "\") in it's name.";
        
        this.name = name;
        this.description = description;
        
        this.streams = {};
    
        /** Other spaces which will be removed along with this one.*/
        this.children = {};
        
        this.states = [];
    }
    
    /** Returns a subject of specified name. Creates new if doesn't yet exist.
     * @param initialUndefined Enforce that initial value does exist but it's undefined.
     */
    s( name, initial, initialUndefined)
    {
        const addressed = addressToChild( this, arguments );
        if ( addressed ) return addressed;
        
        //may happen when some asynchronous operation accesses this space after it was cleared:
        if ( this.cleared )
        {
            console.warn( "Space already cleared. Covering with empty Stream, but please fix it, because it's a memory leak." );
            return new Stream;
        }
        
        let stream = this.streams[ name ];
        if ( ! stream )
        {
            const subject = new Stream( name );
            
            stream = {
                subject,
                name
            };
            
            this.streams[ name ] = stream;
        }
        if ( initial !== undefined || initialUndefined )
        {
            this.states.push( {
                stream,
                initial,
            } );
        }
        return stream.subject;
    }
    $() { this.s.apply( this, arguments ); }
    
    tween( v )
    {
        const r = new TWEEN.Tween( v );
        if( ! this.tweens ) this.tweens = [];
        this.tweens.push( r );
        return r;
    }
    
    clear()
    {
        if ( this.cleared )
        {
            console.log( "Space already cleared. Don't reuse already cleared Spaces." );
            return;
        }
        
        //children:
        for ( const spaceName in this.children )
        {
            this.children[ spaceName ].clear();
        }
        delete this.children;
        
        //destroy:
        for ( const streamName in this.streams )
        {
            this.streams[ streamName ].subject.destructor();
        }
        delete this.streams;
        
        if ( this.tweens )
        {
            for ( const tween of this.tweens )
            {
                if ( tween.kill )
                {
                    tween.kill()
                }
                else
                {
                    console.error( "TWEEN has NO kill() method" )
                }
            }
            delete this.tweens;
        }
        
        this.cleared = true;
    }
    
    /** Get specified child. Will be created if not yet existing.*/
    child( name, description)
    {
        let s = this
        for ( const n of name.split( DELIMITER ) )
        {
            const existing = s.children[ n ]
            if ( existing ) s = existing
            else
            {
                const new_s = new Space( n, description )
                s.children[ n ] = new_s
                s = new_s
            }
        }
        return s
    }
    
    /** Flush states. Must be commited after everything constructed.*/
    apply()
    {
        for ( const childName in this.children )
        {
            this.children[ childName ].apply();
        }
        
        for ( const state of this.states )
        {
            //console.log( this.name, ".", state.stream.name, "<-", state.initial );
            state.stream.subject.next( state.initial );
        }
        this.states.length = 0;
        delete this.states;
    }
    
    /** Subscribes right Subject (one from specified space) to left (of current Space) which has the same name.*/
    glue( name, space )
    {
        this.s( name ).to( space.s( name ) );
    }
    
    print( t )
    {
        t = t || "";
        const siblingT = t + "    ";
        let spaceDescription = this.description;
        if (spaceDescription !== '') {
            spaceDescription = ' - ' + spaceDescription;
        }
        console.groupCollapsed( "%c" + t + this.name + "%c" + spaceDescription, "color: #2151a0", "color: #000544" )
        const alphabetically = Object.keys( this.streams ).sort()
        for ( const streamName of alphabetically )
        {
            let description = this.streams[ streamName ].subject.description();
            if (description !== '') {
                description = ' - ' + description;
            }
            
            console.log( "%c" + siblingT + streamName + "%c" + description, "color: #9b334b", "color: #600016" );
        }
        for ( const childName in this.children )
        {
            this.children[ childName ].print( siblingT );
        }
        console.groupEnd()
    }
    
    //TODO: check that all subscribtions have corresponding .next()s existing ...
}

function addressToChild( space, args )
{
    //original arguments IS an array but it doesn't have shift() method:
    const shifted = [];
    //because some browsers have no slice() :( :
    //args = Array.prototype.slice.call( args );
    for ( let i = 1; i < args.length; ++ i )
    {
        shifted.push( args[ i ] );
    }
    
    const name = args[ 0 ]
    const index = name.lastIndexOf( DELIMITER );
    if ( index <= 0 ) return undefined;
    return space.child( name.substr( 0, index ) ).s( name.substr( index + DELIMITER.length ), ... shifted )
}

