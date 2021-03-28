import child_process from 'child_process'
import { expect } from 'chai'
import assert from 'assert'
import fs, { unlinkSync } from 'fs'

function compare( source : string, expectation : string ) {
    //try { child_process.execSync( 'rm streams_types.json' ) } catch(e:any){}
    try { unlinkSync( 'streams_types.json' ) } catch(e:any){}

    //invoking the compiler:
    child_process.execSync( 'npx ttsc --noEmit ' + source )
    
    assert.deepStrictEqual(
        JSON.parse( fs.readFileSync( 'streams_types.json', 'utf8' ) ),
        JSON.parse( fs.readFileSync( expectation, 'utf8' ) ),
    )
}

describe( 'Types extraction', () => {
    it( 'number', () => {
        compare(
            'test/streams_types/simple.ts',
            'test/streams_types/simple_expectation.json',
        )
    })
})
