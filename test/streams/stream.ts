
import Stream from "../../stream";
import Space from "../../space";
const chai = require( "chai" );
const expect = chai.expect;

describe( "Stream", () =>
{
    it( "on", done =>
    {
        const root = new Stream( "root" );
        root.on( () => done() );
        root.next();
    } );
    
    it( "multiple children with propagation cancel", done =>
    {
        const root = new Stream( "root" );
        let onCalls = 0;
        root.on( () => ++ onCalls );
        root.on( () => ++ onCalls );
        root.next( "r" );
        expect( onCalls ).eql( 2 );
        done();
    } );
    
    it( "diamond with", done =>
    {
        const root = new Stream( "root" );
        let mappedCalls = 0;
        const mapped = root.map( v => {
            ++ mappedCalls;
            return v + "+map";
        } );
        let withCalls = 0;
        let onCalls = 0;
        mapped
            .with( root, ( v, m ) => {
                ++ withCalls;
                return v + "|" + m + "+with";
            } )
            .on( v => {
                ++ onCalls;
                expect( v ).eql( "pulse+map|pulse+with" );
            } );
        
        expect( mappedCalls ).eql( 0 );
        expect( withCalls ).eql( 0 );
        expect( onCalls ).eql( 0 );
        
        root.next( "pulse" );
        
        expect( mappedCalls ).eql( 1 );
        expect( withCalls ).eql( 1 );
        expect( onCalls ).eql( 1 );
        
        root.next( "pulse" );
        
        expect( mappedCalls ).eql( 2 );
        expect( withCalls ).eql( 2 );
        expect( onCalls ).eql( 2 );
        
        done();
    } );
    
    it( "with", done =>
    {
        const r1 = new Stream( "r1" );
        const r2 = new Stream( "r2" );
        let onWithCalls = 0;
        r1
            .with(
                r2,
                ( l, r ) => l + "|with|" + r
            )
            .on( v => {
                ++ onWithCalls;
                switch ( v )
                {
                    case "l1|with|undefined":
                        break;
                    case "l1|with|r1":
                        break;
                    case "l2|with|r1":
                        break;
                    default:
                        throw "unexpected with";
                }
            } );
        expect( onWithCalls ).eql( 0 );
        r1.next( "l1" );
        expect( onWithCalls ).eql( 1 );
        r2.next( "r1" );
        expect( onWithCalls ).eql( 1 );
        r1.next( "l2" );
        expect( onWithCalls ).eql( 2 );
        done();
    } );
    
    it( "to", done =>
    {
        const source = new Stream( "source" );
        const target = new Stream( "target" );
        source.to( target );
        
        let onTargetCalls = 0;
        target.on( v => {
            ++ onTargetCalls;
            expect( v ).eql( "s" );
        } );
        expect( onTargetCalls ).eql( 0 );
        source.next( "s" );
        expect( onTargetCalls ).eql( 1 );
        done();
    } );
    
    it( "merge", done =>
    {
        const left = new Stream( "left" );
        const right = new Stream( "right" );
        let e = merge => expect( merge ).eql( "l" );
        let mergeCalls = 0;
        left
            .merge( right )
            .on( merge => {
                ++ mergeCalls;
                e( merge );
            } );
        expect( mergeCalls ).eql( 0 );
        left.next( "l" );
        expect( mergeCalls ).eql( 1 );
        e = merge => expect( merge ).eql( "r" );
        right.next( "r" );
        expect( mergeCalls ).eql( 2 );
        done();
    } );
    
    it( "map merge", done =>
    {
        const left = new Stream( "left" );
        const right = new Stream( "right" );
        let onCalls = 0;
        let e = v => expect( v ).eql( true );
        left
            .map( () => true )
            .merge( right.map( () => false ) )
            .on( v => {
                ++ onCalls;
                e( v );
            } );
        expect( onCalls ).eql( 0 );
        left.next( "l" );
        expect( onCalls ).eql( 1 );
        e = v => expect( v ).eql( false );
        right.next( "r" );
        expect( onCalls ).eql( 2 );
        done();
    } );
    
    it( "diamond merge", done =>
    {
        const root = new Stream( "root" );
        const left = root.map( v => v + "+lm" );
        const right = root.map( v => v + "+rm" );
        let onMergeCalls = 0;
        let expectations = [
            "r+lm",
            "r+rm",
        ];
        left
            .merge( right )
            .on( v =>
            {
                ++ onMergeCalls;
                const i = expectations.indexOf( v );
                expect( i ).least( 0 );
                expectations.splice( i, 1 );
            } );
        expect( onMergeCalls ).eql( 0 );
        root.next( "r" );
        //actually it's an undefined behaviour: may be 0 - it's one because of topological sort which invokes merge() only once in the end of propagation:
        expect( onMergeCalls ).eql( 1 );
        expect( expectations.length ).eql( 1 );
        done();
    } );
    
    it( "diamond any", done =>
    {
        const root = new Stream( "root" );
        const left = root.map( v => v + "+la" );
        const right = root.map( v => v + "+ra" );
        let onAnyCalls = 0;
        left
            .any(
                right,
                ( l, r ) => l + "|" + r + "+any"
            )
            .on( v =>
            {
                ++ onAnyCalls;
                expect( v ).eql( "r+la|r+ra+any" );
            } );
        expect( onAnyCalls ).eql( 0 );
        root.next( "r" );
        expect( onAnyCalls ).eql( 1 );
        done();
    } );
    
    it( "any", done =>
    {
        const r1 = new Stream( "r1" );
        const r2 = new Stream( "r2" );
        let onAnyCalls = 0;
        let e = v => expect( v ).eql( "rl|any|undefined" );
        r1
            .any(
                r2,
                ( l, r ) => l + "|any|" + r
            )
            .on( v => {
                ++ onAnyCalls;
                e( v );
            } );
        expect( onAnyCalls ).eql( 0 );
        r1.next( "rl" );
        expect( onAnyCalls ).eql( 1 );
        e = v => expect( v ).eql( "rl|any|rr" );
        r2.next( "rr" );
        expect( onAnyCalls ).eql( 2 );
        done();
    } );
    
    it( "filter", done =>
    {
        const root = new Stream( "root" );
        let onFilterCalls = 0;
        root
            .filter( v => v % 2 == 0 )
            .on( v => {
                ++ onFilterCalls;
                expect( v % 2 ).eql( 0 );
            } );
        root.next( 1 );
        root.next( 2 );
        root.next( 3 );
        root.next( 4 );
        root.next( 5 );
        expect( onFilterCalls ).eql( 2 );
        done();
    } );
    
    it( "delay", done =>
    {
        const root = new Stream( "root" );
        let onDelayCalls = 0;
        root
            .delay( 0.200 * 1000 )
            .on( v => {
                ++ onDelayCalls;
                expect( v ).eql( "r" );
            } );
        setTimeout(
            () => {
                expect( onDelayCalls ).eql( 1 );
                done();
            },
            0.300 * 1000
        );
        expect( onDelayCalls ).eql( 0 );
        root.next( "r" );
        expect( onDelayCalls ).eql( 0 );
    } );
    
    it( "delay overlap", done =>
    {
        //ensure that consecutive delayed calls having previous values regardless of source timeline:
        const root = new Stream( "root" );
        let onDelayCalls = 0;
        root
            .delay( 0.100 * 1000 )
            .on( v => {
                ++ onDelayCalls;
                expect( v ).eql( onDelayCalls );
                expect( onDelayCalls ).most( 4 );
            } );
        const source = new Stream( "source" );
        source.delay( 0.030 * 1000 ).on( () => root.next( 1 ) );
        source.delay( 0.060 * 1000 ).on( () => root.next( 2 ) );
        source.delay( 0.090 * 1000 ).on( () => root.next( 3 ) );
        source.delay( 0.120 * 1000 ).on( () => root.next( 4 ) );
        setTimeout(
            () => {
                expect( onDelayCalls ).eql( 4 );
                done();
            },
            0.400 * 1000
        );
        source.next();
    } );
    
    it( "delay destructor", done =>
    {
        const root = new Stream( "root" );
        root
            .delay( 0.300 * 1000 )
            .on( v => { throw "should be canceled" } );
        root.next( 1 );
        root.next( 2 );
        root.next( 3 );
        setTimeout(
            () => {
                root.destructor();
                done();
            },
            0.050 * 1000
        );
    } );
    
    it( "take", done =>
    {
        const root = new Stream( "root" );
        let onTakeCalls = 0;
        root
            .take( 3 )
            .on( v => {
                ++ onTakeCalls;
                expect( v ).eql( onTakeCalls );
            } );
        root.next( 1 );
        root.next( 2 );
        root.next( 3 );
        root.next( 4 );
        root.next( 5 );
        root.next( 6 );
        expect( onTakeCalls ).eql( 3 );
        done();
    } );
    
    it( "pair", done =>
    {
        const root = new Stream( "root" );
        let onPairCalls = 0;
        root
            .pair()
            .on( pair => {
                ++ onPairCalls;
                expect( pair.length ).eql( 2 );
                expect( pair[ 0 ] ).eql( onPairCalls );
                expect( pair[ 1 ] ).eql( onPairCalls + 1 );
            } );
        root.next( 1 );
        root.next( 2 );
        root.next( 3 );
        root.next( 4 );
        root.next( 5 );
        expect( onPairCalls ).eql( 4 );
        done();
    } );
    
    it( "changed", done =>
    {
        const root = new Stream( "root" );
        let onChangedCalls = 0;
        root
            .changed()
            .on( v => {
                ++ onChangedCalls;
                expect( v ).eql( onChangedCalls );
            } );
        root.next( 1 );
        root.next( 1 );
        root.next( 2 );
        root.next( 3 );
        root.next( 3 );
        root.next( 3 );
        root.next( 4 );
        expect( onChangedCalls ).eql( 4 );
        done();
    } );
    
    it( "changed compare", done =>
    {
        //"changed" when even -> <- odd:
        const root = new Stream( "root" );
        let onChangedCalls = 0;
        root
            .changed( ( previous, pending ) => previous % 2 == 0 ? pending % 2 == 0 : pending % 2 == 1 )
            .on( v => {
                ++ onChangedCalls;
                expect( v ).eql( onChangedCalls );
            } );
        root.next( 1 );
        root.next( 3 );
        root.next( 7 );
        root.next( 2 );
        root.next( 3 );
        expect( onChangedCalls ).eql( 3 );
        done();
    } );
    
    //all children must resolve without dropping sides through their parents:
    it( "multiple children", done =>
    {
        const root = new Stream( "root" );
        const side = new Stream( "side" );
        
        let onRootSideCalls = 0;
        let le;
        root
            .map( v => v + ".l_map" )
            .any( side, ( r, s ) => r + s + ".l_any" )
            .on( v => {
                ++ onRootSideCalls;
                le( v );
            } );
        
        let onSideRootCalls = 0;
        let re;
        side
            .map( v => v + ".r_map" )
            .any( root, ( s, r ) => s + r + ".r_any" )
            .on( v => {
                ++ onSideRootCalls;
                re( v );
            } );
        
        expect( onRootSideCalls ).eql( 0 );
        expect( onSideRootCalls ).eql( 0 );
        
        le = v => expect( v ).eql( "r.l_mapundefined.l_any" );
        re = v => expect( v ).eql( "undefinedr.r_any" );
        root.next( "r" );
        expect( onRootSideCalls ).eql( 1 );
        expect( onSideRootCalls ).eql( 1 );
        
        le = v => expect( v ).eql( "r.l_maps.l_any" );
        re = v => expect( v ).eql( "s.r_mapr.r_any" );
        side.next( "s" );
        expect( onRootSideCalls ).eql( 2 );
        expect( onSideRootCalls ).eql( 2 );
        done();
    } );
    
    it.skip( "one-directional edges", done =>
    {
        const left = new Stream( "left" );
        const right = new Stream( "right" );
        
        let onLeftMapCalls = 0;
        left
            .map( v => v + ".map" )
            .on( v => {
                ++ onLeftMapCalls;
                expect( v ).eql( "l.map" );
            } );
        
        let onMergeCalls = 0;
        left
            .merge( right )
            .on( v => {
                ++ onMergeCalls;
                expect( v ).eql( "dunno yet" );
            } );
        
        let onWithCalls = 0;
        left
            .with( right, ( l, r ) => l + "|with|" + r )
            .on( v => {
                ++ onWithCalls;
                expect( v ).eql( "dunno yet" );
            } );
        
        expect( onLeftMapCalls ).eql( 0 );
        expect( onMergeCalls ).eql( 0 );
        expect( onWithCalls ).eql( 0 );
        
        left.next( "l" );
        
        expect( onLeftMapCalls ).eql( 1 );
        expect( onMergeCalls ).eql( 1 );
        expect( onWithCalls ).eql( 1 );
        
        right.next( "r" );
        
        expect( onLeftMapCalls ).eql( 1 );
        expect( onMergeCalls ).eql( 2 );
        expect( onWithCalls ).eql( 1 );
        
        right.destructor();
        
        left.next( "l" );
        
        expect( onLeftMapCalls ).eql( 2 );
        expect( onMergeCalls ).eql( 2 );
        expect( onWithCalls ).eql( 1 );
    } );
    
    it( "altering", done =>
    {
        const space = new Space;
        const root = space.s( "root" );
        const a = space.s( "a" );
        a.next( "a" );
        
        const original = root
            .with( a, ( root, a ) => root + "_original_" + a )
            .name( space, "original" );
        
        let onOriginalCalls = 0;
        original.on( v => {
            if ( onOriginalCalls == 0 ) expect( v ).eql( "root_original_a" );
            if ( onOriginalCalls == 1 ) expect( v ).eql( "root_original_a_altered_b" );
            ++ onOriginalCalls;
        } );
        root.next( "root" );
        expect( onOriginalCalls ).eql( 1 );
        
        const b = space.s( "b" );
        const alteredOriginal = space.s( "original" ).alter();
        space.s( "original" )
            .any( b, ( original, b ) => original + "_altered_" + b )
            .to( alteredOriginal );
        b.next( "b" );
        
        expect( onOriginalCalls ).eql( 2 );
        
        done();
    } );
    
    it( "one-sided edges are not traversed when removing resolved parents", done =>
    {
    } );
    
    it.skip( "complex", done =>
    {
    } );
    
    it.skip( "benchmark", done =>
    {
    } );
} );



