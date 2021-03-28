import ts from 'typescript'
import fs from 'fs'

export default function stream_type_safety_as_transformer<T extends ts.Node>(
    program : ts.Program,
    configuration : unknown,
    something_big_I_dont_know_what_is : unknown,
): ts.TransformerFactory<T> {
    const checker = program.getTypeChecker()

    for ( const sourceFile of program.getSourceFiles() ) {
        if ( ! sourceFile.isDeclarationFile ) {
            ts.forEachChild( sourceFile, visit );
        }
    }
    function visit( node: ts.Node ) {
        match_stream_s( node, checker )
        ts.forEachChild( node, visit )
    }

    //pretty_print( streams, 'streams:' )
    fs.writeFileSync( 'streams_types.json', JSON.stringify( streams ) )

    //no need to make any AST transformations: just statically analyze streams types:
    return context => {
        const visit: ts.Visitor = node => {
            return ts.visitEachChild( node, child => visit( child ), context )
        };
        return node => ts.visitNode(node, visit);
    };
}

const streams : { [ key : string ] : any } = {}

function match_stream_s(
    node : ts.Node,
    checker : ts.TypeChecker,
) : boolean {
    if ( node.kind != ts.SyntaxKind.CallExpression )
        return false
    const ce = node as ts.CallExpression
    if ( ce.expression.kind != ts.SyntaxKind.PropertyAccessExpression )
        return false
    const pae = ce.expression as ts.PropertyAccessExpression
    if ( ! is_space_object( pae.expression, checker ) )
        return false
    
    /*console.log( 'Space detected!' )
    console.log( 'arguments:' )
    for ( const arg of ce.arguments ) {
        console.log( '    ', arg.getText() )
    }*/

    //pollutes the text with quotes:
    //const stream_name = ce.arguments[ 0 ].getText()
    const stream_name = ce.arguments[0].text

    //console.log( 'argument:', ce.arguments[1] )
    const type = checker.getTypeAtLocation( ce.arguments[1] )
    const stream_data = serialize_type( type, checker )

    streams[ stream_name ] = stream_data

    return false
}

function is_space_object( e : ts.Node, checker : ts.TypeChecker ) : boolean {
    const type = checker.getTypeAtLocation( e )
    const type_string = checker.typeToString( type )
    if ( type_string != 'Space' )
        return false
    const properties = checker.getPropertiesOfType( type )

    let methods_detected = 0
    for ( const p of properties ) {
        if ( space_properties.indexOf( p.escapedName.toString() ) )
            ++ methods_detected
    }
    if ( methods_detected >= space_properties.length )
        return true
    
    return false
}
const space_properties = [
    'stream',
    's',
]

function serialize_type(
    type : ts.Type,
    checker : ts.TypeChecker,
    depth = 0,
) : { [ key : string ] : any } | string
{
    //console.log( '    '.repeat(depth) + 'type:', type )
    const symbol = type.getSymbol()
    if ( ! symbol ) {
        //seems like it's actually just TypeScript-provided type:
        /*console.log( 'type', checker.typeToString( type ), 'has NO symbol', type )
        throw new Error( 'Type MUST have a symbol' )*/

        //for some reason expression 42 has no symbol (making it impossible to determin it's type), has just text '42', but has flags: 256 which is TypeFlags.NumberLiteral:
        /*console.log( '    '.repeat(depth) + 'symbol-less:', checker.typeToString( type ), type )
        return checker.typeToString( type ) //returns string '42'*/
        if ( hasFlag( type, ts.TypeFlags.NumberLiteral ) )
            return 'number'
        if ( hasFlag( type, ts.TypeFlags.StringLiteral ) )
            return 'string'
        if ( hasFlag( type, ts.TypeFlags.BooleanLiteral ) )
            return 'boolean'
        return checker.typeToString( type )
    }

    //I don't know yet what multiple declarations mean:
    for ( const d of symbol.declarations ) {
        const declaration_type = checker.getTypeAtLocation( d )
        if ( symbol.members ) {
            const result : { [ key : string ] : any } = {}
            for ( const [ name, mbr ] of symbol.members ) {
                const member = mbr as ts.Symbol
                const member_type = checker.getTypeAtLocation( member.valueDeclaration )
                result[ name ] = serialize_type( member_type, checker, depth + 1 )
            }
            return result
        }
        else {
            return checker.typeToString( declaration_type )
        }
    }
    throw new Error( 'type was supposed to unravel at this point' )
}
function hasFlag(type: ts.Type, flag: ts.TypeFlags) {
    return (type.flags & flag) === flag;
}

function find_child( children : ts.Node[], kind : ts.SyntaxKind ) : ts.Node | undefined {
    for ( const child of children ) {
        if ( child.kind == kind )
            return child
    }
    return undefined
}

export function pretty_print( object : any, prefix : any = undefined ) {
    if ( prefix )
        console.log( prefix )
    console.dir( object, {depth: null, colors: true})
}

