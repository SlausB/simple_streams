
        const live = new Stream( "live" );
        const dragon = new Stream( "dragon" );
        live.to( dragon );
        const wizard = live.map( v => v );
        const knight = live.map( () => undefined );
        
        const townhall = live.map( v => undefined );
        const militia = new Stream( "militia" );
        townhall
            .with( militia, ( l, m ) => m ? m.concat( 0 ) : [] )
            .to( militia );
        
        const dragonActions = dragon.map( v => v % 4 );
        //dragon kills at least 3 people with his breath:
        dragonActions
            .filter( v => v == 0 )
            .map( () => 3 )
            .with( militia, ( kills, m ) => {
                while ( m.length > 0 && kills > 0 )
                {
                    m.shift();
                    -- kills;
                }
                return kills;
            } )
            .filter( kills => kills > 0 )
            .on
        
        live.next( 1 );
        live.next( 2 );
        live.next( 3 );
        live.next( 4 );
        live.next( 5 );
        live.next( 6 );
        live.next( 7 );
        live.next( 8 );
        live.next( 9 );
        live.next( 10 );