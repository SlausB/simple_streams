
import Propagating from "./propagating"
import Edge from './edge'
import Space from './space'

import With    from "./operators/with"
import Any     from "./operators/any"
import Changed from "./operators/changed"
import Delay   from "./operators/delay"
import Filter  from "./operators/filter"
import Map     from "./operators/map"
import Merge   from "./operators/merge"
import Pair    from "./operators/pair"
import Take    from "./operators/take"
import To      from "./operators/to"
import Do      from "./operators/do"
import { literal_stream } from "./args"

export default class Stream extends Propagating
{
    space : Space
    _name : string
    _description : string
    children : Edge[] = []


    constructor( space : Space, name : string, description = '' )
    {
        super();
        
        this.space = space
        this._name = name;
        this._description = description;
    }
    
    description( description ?: string ) {
        if ( ! description ) {
            return this._description;
        }
        
        this._description = description;
        return this;
    }
    desc( ...args: Parameters<Stream["description"]> ) {
        return this.description.apply( this, args )
    }
    
    name( space : Space, name : string )
    {
        //cannot just replace the name of current stream because there already might exist a stream with such name, so just redirecting:
        const s = space.s( name )
        this.to( s )
        return s
    }
    
    alter()
    {
        const r = new Stream( this.space, "altered_" + this._name );
        
        for ( const child of this.children )
            child.parent = r;
        r.children = this.children;
        this.children = [];
        
        return r;
    }
    
    next( v ?: any ) {
        this.propagate( v )
        return this
    }
    
    log()
    {
        this.on( ( v : any ) => console.log( this._name, ":", v ) );
        return this;
    }
    
    with( ... args : any[] )
    {
        return With( this.space, ... args )
    }
    withLatestFrom( ... args : Parameters< Stream['with'] > ) { return this.with.apply( this, args ) }
    
    /** When any of streams update (both this and specified).*/
    any( ... args : any[] )
    {
        return Any( this.space, ... args )
    }
    combineLatest( ...args: Parameters<Stream["any"]> ) { return this.any.apply( this, args ) }
    
    /** That's bad operator - try to avoid using it.*/
    merge( ... args : Stream[] )
    {
        const r = new Stream( this.space, this._name + ".merge" )
        r.parents = [];
        const glue = ( t : Stream ) => {
            new Edge(
                t,
                r,
                new Merge,
            );
        };
        glue( this );
        for ( const t of args )
            glue( t );
        return r;
    }
    
    filter( f : ( value : any ) => boolean )
    {
        const r = new Stream( this.space, this._name + ".filter" );
        new Edge(
            this,
            r,
            new Filter( f ),
        );
        return r;
    }
    
    take( times : number )
    {
        const r = new Stream( this.space, this._name + ".take" );
        new Edge(
            this,
            r,
            new Take( times ),
        );
        return r;
    }
    
    map( f : ( value : any ) => any )
    {
        const r = new Stream( this.space, this._name + ".map" );
        new Edge(
            this,
            r,
            new Map( f ),
        );
        return r
    }
    
    delay( milliseconds : number )
    {
        const operator = new Delay( milliseconds )
        
        const r = new Stream( this.space, this._name + ".delay" );
        new Edge(
            this,
            r,
            operator
        );
        return r;
    }
    
    /** Subscribe. Any calls to next() here won't obey to atomic updates rules.*/
    do( f : ( value : any ) => any )
    {
        const r = new Stream( this.space, this._name + ".do" );
        new Edge(
            this,
            r,
            new Do( f ),
        );
        return r;
    }
    on( ... args : Parameters<Stream['do']> ) {
        return this.do.apply( this, args )
    }
    subscribe( target : Stream | string | ( ( value : any ) => any ) ) {
        if ( typeof target === 'function' )
            return this.on( target as ( ( value : any ) => any ) )
        return this.to( target as ( Stream | string ) )
    }
    
    pair()
    {
        const r = new Stream( this.space, this._name + ".pair" )
        new Edge(
            this,
            r,
            new Pair,
        );
        return r;
    }
    pairwise( ... args : Parameters<Stream['pair']> ) { return this.pair.apply( this, args ) }
    
    changed( f ?: ( prev_v : any, new_v : any ) => boolean )
    {
        const r = new Stream( this.space, this._name + ".changed" );
        new Edge(
            this,
            r,
            new Changed( f ),
        );
        return r;
    }
    changes             ( ... args : Parameters<Stream['changed']> ) { return this.changed.apply( this, args ) }
    distinctUntilChanged( ... args : Parameters<Stream['changed']> ) { return this.changed.apply( this, args ) }
    
    to( target : Stream | string )
    {
        new Edge(
            this,
            literal_stream( target, this.space ),
            new To,
        )
        return target;
    }
}

