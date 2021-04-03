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
) : boolean
{
    const file = find_parent( node, ts.SyntaxKind.SourceFile ) as ts.SourceFile
    if ( is_lib_file( file ) )
        return false

    if ( ! ts.isCallExpression( node ) )
        return false
    const ce = node as ts.CallExpression
    if ( ! ts.isPropertyAccessExpression( ce.expression ) )
        return false
    
    //both space.s() and stream.* must return Stream:
    const result_type = checker.getTypeAtLocation( ce )
    if ( ! result_type || ! result_type.symbol || ! result_type.symbol.declarations || result_type.symbol.declarations.length != 1 )
        return false
    if ( ! is_lib_file( find_parent( result_type.symbol.declarations[ 0 ], ts.SyntaxKind.SourceFile ) as ts.SourceFile ) )
        return false
    if ( ! is_stream_type( result_type, checker ) )
        return false

    const pae = ce.expression as ts.PropertyAccessExpression
    const field_name = ( pae.name as ts.Identifier ).escapedText

    //space.s detected:
    if ( is_space_object( pae.expression, checker ) )
    {
        if ( field_name != 's' )
            return false

        if ( ce.arguments.length < 1 )
            return false
        
        //pollutes the text with quotes:
        //const stream_name = ce.arguments[ 0 ].getText()
        const stream_name = ce.arguments[0].text
        
        console.log(
            'Space detected at', place(node),
            'arguments:'
        )
        for ( const arg of ce.arguments ) {
            console.log( '    ', arg.getText() )
        }

        //console.log( 'CallExpression:', checker.getTypeAtLocation( ce ) )

        //console.log( 'argument:', ce.arguments[1] )
        const type = checker.getTypeAtLocation( ce.arguments[1] )
        const stream_data = serialize_type( type, checker )

        streams[ stream_name ] = stream_data
    }
    //stream.*() detected:
    else if ( is_stream_object( pae.expression, checker ) ) {
        console.log(
            'Stream detected at', place(node),
            'arguments:'
        )
        for ( const arg of ce.arguments ) {
            console.log( '    ', arg.getText() )
        }

        console.log( 'stream method:', field_name )
    }
    else {
        return false
    }

    return true
}

function is_space_object( e : ts.Node, checker : ts.TypeChecker ) : boolean {
    const type = checker.getTypeAtLocation( e )
    return is_space_type( type, checker )
}
function is_space_type( type : ts.Type, checker : ts.TypeChecker ) : boolean {
    return is_my_type(
        type,
        checker,
        'Space',
        [
            'name',
            'description',
            'streams',
            'states',
            'stream_types',
            'clear',
            'apply',
            'glue',
            'print',
        ]
    )
}
function is_stream_object( e : ts.Node, checker : ts.TypeChecker ) : boolean {
    const type = checker.getTypeAtLocation( e )
    return is_stream_type( type, checker )
}
function is_stream_type( type : ts.Type, checker : ts.TypeChecker ) : boolean {
    return is_my_type(
        type,
        checker,
        'Stream',
        [
            'on',
            'do',
            'to',
            'with',
            'any',
            'map',
            'filter',
        ]
    )
}
function is_my_type( type : ts.Type, checker : ts.TypeChecker, name : string, required : string[] ) {
    const type_string = checker.typeToString( type )
    if ( type_string != name )
        return false
    
    const properties = checker.getPropertiesOfType( type ).map( p => p.escapedName.toString() )

    for ( const p of required ) {
        if ( properties.indexOf( p ) < 0 )
            return false
    }
    
    return true
}

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
        /*console.log( 'type', checker.typeToString( type ), 'has NO symbol', type )/*
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
function find_parent( from : ts.Node, kind : ts.SyntaxKind ) : ts.Node | undefined {
    if ( ! from.parent )
        return undefined
    if ( from.parent.kind == kind )
        return from.parent
    return find_parent( from.parent, kind )
}
function place( node : ts.Node ) : string {
    const sourceFile = find_parent( node, ts.SyntaxKind.SourceFile ) as ts.SourceFile
    let { line, character } = sourceFile.getLineAndCharacterOfPosition( node.getStart() )
    return `${sourceFile.fileName} (${line + 1},${character + 1})`
}
function is_lib_file( file : ts.SourceFile ) : boolean {
    return  file.fileName.includes( LIB_NAME + '/lib/' )
}

const LIB_NAME = 'simple_streams'

export function pretty_print( object : any, prefix : any = undefined ) {
    if ( prefix )
        console.log( prefix )
    console.dir( object, {depth: null, colors: true})
}

