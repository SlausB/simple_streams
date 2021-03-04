
import Propagating from "./propagating";
import Edge from './edge'
import Space from './space'

import With    from "./operators/with";
import Any     from "./operators/any";
import Changed from "./operators/changed";
import Delay   from "./operators/delay";
import Filter  from "./operators/filter";
import Map     from "./operators/map";
import Merge   from "./operators/merge";
import On      from "./operators/on";
import Pair    from "./operators/pair";
import Take    from "./operators/take";
import To      from "./operators/to";
import Do      from "./operators/do"

export default class Stream extends Propagating
{
    _name : string
    _description : string
    children : Edge[] = []

    constructor( name : string, description = '' )
    {
        super();
        
        this._name = name;
        this._description = description;
    }
    
    destructor()
    {
        delete this._name;
        delete this._description;
        
        super.destructor();
    }
    
    description( description : string ) {
        if (!description) {
            return this._description;
        }
        
        this._description = description;
        return this;
    }
    desc() { return this.description.apply( this, arguments ); }
    
    name( space : Space, name : string )
    {
        //cannot just replace the name of current stream because there already might exist a stream with such name, so just redirecting:
        const s = space.s( name )
        this.to( s )
        return s
    }
    
    alter()
    {
        const r = new Stream( "altered_" + this._name );
        
        for ( const child of this.children )
            child.parent = r;
        r.children = this.children;
        this.children = [];
        
        return r;
    }
    
    next( v : any ) { this.propagate( v ); return this; };
    
    log()
    {
        this.on( ( v : any ) => console.log( this._name, ":", v ) );
        return this;
    }
    
    with( ... args : any[] )
    {
        return With( this, ... args );
    }
    withLatestFrom() { return this.with.apply( this, arguments ); }
    
    /** When any of streams update (both this and specified).*/
    any( ... args : any[] )
    {
        return Any( this, ... args );
    }
    combineLatest( ... args : any[] ) { return this.any.apply( this, args ); }
    static any( ... args : any[] )
    {
        return Any( ... args );
    }
    static combineLatest( ... args : any[] ) { return Stream.any.apply( null, args ); }
    
    merge( ... args : any[] )
    {
        return Merge( this, ... args );
    }
    static merge( ... args : any[] )
    {
        return Merge( ... args );
    }
    
    filter( ... args : any[] )
    {
        return Filter( this, ... args );
    }
    
    take( ... args : any[] )
    {
        return Take( this, ... args );
    }
    
    map( ... args : any[] )
    {
        return Map( this, ... args );
    }
    
    /** Subscribe. Any calls to next() here won't obey to atomic updates rules.*/
    on( ... args : any[] )
    {
        return On( this, ... args );
    }
    subscribe( t : any )
    {
        if ( t instanceof Stream )
            return this.to( t );
        return this.on( t );
    }
    
    do( ... args : any[] )
    {
        return Do( this, ... args )
    }
    
    delay( ... args : any[] )
    {
        return Delay( this, ... args );
    }
    
    pair( ... args : any[] )
    {
        return Pair( this, ... args );
    }
    pairwise( ... args : any[] ) { return this.pair.apply( this, args ); }
    
    changed( ... args : any[] )
    {
        return Changed( this, ... args );
    }
    distinctUntilChanged() { return this.changed.apply( this, arguments ); };
    
    to( ... args : any[] )
    {
        return To( this, ... args );
    }
}

