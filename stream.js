
import Propagating from "./propagating";

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
    constructor( name, description = '' )
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
    
    description(description) {
        if (!description) {
            return this._description;
        }
        
        this._description = description;
        return this;
    }
    desc() { return this.description.apply( this, arguments ); }
    
    name( space, name )
    {
        //cannot just replace the name of current stream because there already might exist a stream with such name, so just redirecting:
        const s = space.s( name )
        this.to( s )
        return s
    }
    
    alter()
    {
        const r = new Stream( "altered_" + this._name );
        
        for ( const child of this.children ) child.parent = r;
        r.children = this.children;
        this.children = [];
        
        return r;
    }
    
    next( v ) { this.propagate( v ); return this; };
    
    log()
    {
        this.on( v => console.log( this._name, ":", v ) );
        return this;
    }
    
    with()
    {
        return With( this, ... arguments );
    }
    withLatestFrom() { return this.with.apply( this, arguments ); }
    
    /** When any of streams update (both this and specified).*/
    any()
    {
        return Any( this, ... arguments );
    }
    combineLatest() { return this.any.apply( this, arguments ); }
    static any()
    {
        return Any( ... arguments );
    }
    static combineLatest() { return Stream.any.apply( null, arguments ); }
    
    merge()
    {
        return Merge( this, ... arguments );
    }
    static merge()
    {
        return Merge( ... arguments );
    }
    
    filter()
    {
        return Filter( this, ... arguments );
    }
    
    take()
    {
        return Take( this, ... arguments );
    }
    
    map()
    {
        return Map( this, ... arguments );
    }
    
    /** Subscribe. Any calls to next() here won't obey to atomic updates rules.*/
    on()
    {
        return On( this, ... arguments );
    }
    subscribe( t )
    {
        if ( t instanceof Stream ) return this.to( t );
        return this.on( t );
    }
    
    do()
    {
        return Do( this, ... arguments )
    }
    
    delay()
    {
        return Delay( this, ... arguments );
    }
    
    pair()
    {
        return Pair( this, ... arguments );
    }
    pairwise() { return this.pair.apply( this, arguments ); }
    
    changed()
    {
        return Changed( this, ... arguments );
    }
    distinctUntilChanged() { return this.changed.apply( this, arguments ); };
    
    to()
    {
        return To( this, ... arguments );
    }
}

