
import Stream from "./stream";

const DELIMITER = ":";

class StreamState {
    subject : Stream
    name : string
    constructor( subject : Stream, name : string ) {
        this.subject = subject
        this.name = name
    }
}
class InitialState {
    stream : StreamState
    initial : any
    constructor( stream : StreamState, initial : string ) {
        this.stream = stream
        this.initial = initial
    }
}

export default class Space
{
    name : String
    description : String
    streams : { [key: string]: StreamState } = {}
    states : InitialState[] = []

    /** <stream name> -> <type> TypeScript type system verification.*/
    stream_types : { [ key : string ] : string } = {}


    constructor( name = '', description = '' )
    {
        this.name = name;
        this.description = description;
    }
    
    /** Returns a subject of specified name. Creates new if doesn't yet exist.
     * @param initialUndefined Enforce that initial value does exist but it's undefined.
     */
    s( name : string, initial : any = undefined, initialUndefined : boolean = false )
    {
        let stream = this.streams[ name ];
        if ( ! stream )
        {
            const subject = new Stream( name )
            this.streams[ name ] = new StreamState( subject, name )
        }
        if ( initial !== undefined || initialUndefined )
        {
            this.states.push({
                stream,
                initial,
            })
        }
        return stream.subject;
    }
    
    clear()
    {
        //destroy:
        for ( const streamName in this.streams )
        {
            this.streams[ streamName ].subject.destructor();
            delete this.streams[ streamName ]
        }
    }
    
    /** Flush states. Must be commited after everything constructed.*/
    apply()
    {
        for ( const state of this.states )
        {
            state.stream.subject.next( state.initial );
        }
        this.states.length = 0
    }
    
    /** Subscribes right Subject (one from specified space) to left (of current Space) which has the same name.*/
    glue( name : string, space : Space )
    {
        this.s( name ).to( space.s( name ) );
    }
    
    print( t ?: string )
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
            let description = this.streams[ streamName ].subject._description;
            if (description !== '') {
                description = ' - ' + description;
            }
            
            console.log( "%c" + siblingT + streamName + "%c" + description, "color: #9b334b", "color: #600016" );
        }
        console.groupEnd()
    }
    
    //TODO: check that all subscribtions have corresponding .next()s existing ...
}

