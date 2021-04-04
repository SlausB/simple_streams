import child_process from 'child_process'
import { expect } from 'chai'
import assert from 'assert'
import fs, { unlinkSync, existsSync } from 'fs'

const STREAMS_TYPES = 'streams_types.json'

function compare( source : string, expectation : string ) {
    //try { child_process.execSync( 'rm streams_types.json' ) } catch(e:any){}
    //can't achieve test passing on GitLab CI when file doesn't exist:
    if ( existsSync( STREAMS_TYPES ) )
        unlinkSync( STREAMS_TYPES )

    //invoking the compiler:
    child_process.execSync( 'npx ttsc --noEmit ' + source )
    
    assert.deepStrictEqual(
        JSON.parse( fs.readFileSync( STREAMS_TYPES, 'utf8' ) ),
        JSON.parse( fs.readFileSync( expectation, 'utf8' ) ),
    )
}

describe( 'Types extraction', () => {
    it( 'boolean', () => {
        compare(
            'test/streams_types/boolean.ts',
            'test/streams_types/boolean_expectation.json',
        )
    })
    it.only( 'stream', () => {
        compare(
            'test/streams_types/stream.ts',
            'test/streams_types/stream_expectation.json',
        )
    })
    it( 'function_result_argument', () => {
        compare(
            'test/streams_types/function_result_argument.ts',
            'test/streams_types/function_result_argument_expectation.json',
        )
    })
    it( 'number', () => {
        compare(
            'test/streams_types/simple.ts',
            'test/streams_types/simple_expectation.json',
        )
    })
    it( 'array', () => {
        compare(
            'test/streams_types/array.ts',
            'test/streams_types/array_expectation.json',
        )
    })
})
