import child_process from 'child_process'
import { expect } from 'chai'
import assert from 'assert'
import fs from 'fs'

function compare( source : string, expectation : string ) {
    //invoking the compiler:
    try { child_process.execSync( 'rm streams_types.json' ) } catch(e:any){}
    child_process.execSync( 'npx ttsc --noEmit ' + source )
    
    assert.deepStrictEqual(
        JSON.parse( fs.readFileSync( 'streams_types.json', 'utf8' ) ),
        JSON.parse( fs.readFileSync( expectation, 'utf8' ) ),
    )
}

describe( 'Types extraction', async () => {
    it( 'number', async () => {
        compare(
            'test/streams_types/simple.ts',
            'test/streams_types/simple_expectation.json',
        )
    })
})
