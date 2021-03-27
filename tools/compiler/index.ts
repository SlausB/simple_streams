import ts from 'typescript'

export default function stream_type_safety_as_transformer<T extends ts.Node>(
    program : ts.Program,
    configuration : unknown,
    something_big_I_dont_know_what_is : unknown,
): ts.TransformerFactory<T> {
    const checker = program.getTypeChecker()

    for ( const sourceFile of program.getSourceFiles() ) {
        if ( ! sourceFile.isDeclarationFile ) {
            console.log( 'source file:', sourceFile.fileName )
            // Walk the tree
            ts.forEachChild( sourceFile, visit );
        }
    }

    return context => {
        //console.log( 'CONTEXT:', context )
        const visit: ts.Visitor = node => {
            //console.log( 'Node:', node.kind, node.getText(), node.pos )

            /*if (ts.isNumericLiteral(node)) {
                return ts.createStringLiteral(node.text);
            }
            return ts.visitEachChild(node, child => visit(child), context);*/
            return ts.visitEachChild( node, child => visit( child ), context )
        };
  
        return node => ts.visitNode(node, visit);
    };

    function visit( node: ts.Node ) {
        if ( ts.isMethodSignature( node ) ) {
            const fe = node as ts.MethodSignature
            console.log( 'FUNCTION', fe.name, ':', checker.typeToString( checker.getTypeAtLocation( fe ) ) )
            /*for ( const pd of fe.parameters ) {
                pd.
            }*/
        }

        /**
        "space.s( 'hi', stream_type )" is:
            ExpressionStatement = 233
            CallExpression = 203
            PropertyAccessExpression = 201
        */

        /*if ( ts.isExpressionStatement( node ) ) {
            const es = node as ts.ExpressionStatement
            es.forEachChild( verbose_visitor )
        }*/

        match_stream_s( node, checker )

        //console.log( 'Node:', node.kind, node.getText(), node.pos )

        /*//@ts-ignore
        const name = node.name
        if ( name ) {
            const symbol = checker.getSymbolAtLocation( name )
            if ( symbol ) {
                console.log(
                    'type string:',
                    checker.typeToString( checker.getTypeOfSymbolAtLocation( symbol, symbol.valueDeclaration ) )
                )
            }
        }*/

        ts.forEachChild( node, visit )
    }
}

function verbose_visitor( node : ts.Node, depth : number = 1 ) {
    console.log( '    '.repeat(depth) + 'verbose visitor:', node.kind, node.getText(), node.pos )
    node.forEachChild( node => verbose_visitor( node, depth + 1 ) )
}

function match_stream_s( node : ts.Node, checker : ts.TypeChecker ) : boolean {
    if ( node.kind != ts.SyntaxKind.CallExpression )
        return false
    const ce = node as ts.CallExpression
    if ( ce.expression.kind != ts.SyntaxKind.PropertyAccessExpression )
        return false
    const pae = ce.expression as ts.PropertyAccessExpression
    if ( ! is_space_object( pae.expression, checker ) )
        return false
    
    console.log( 'Space detected!' )
    console.log( 'arguments:' )
    for ( const arg of ce.arguments ) {
        console.log( '    ', arg.getText() )
    }

    const type = checker.getTypeAtLocation( ce.arguments[1] )
    console.log( 'TYPE:', checker.typeToString( type ) )
    //console.log( 'naked:', type )
    console.log( 'serialized:', serialize_type( type, checker ) )

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

function serialize_type( type : ts.Type, checker : ts.TypeChecker ) : string {
    const result : { [ key : string ] : string } = {}
    console.log( 'properties:')
    for ( const p of type.getProperties() ) {
        //@ts-ignore
        const field = ( p.type as ts.Type )
        const field_name = p.getName()
        const field_type = checker.typeToString( field )
        result[ field_name ] = field_type
        console.log( '    ', field_name, field_type )
        if ( field_type == 'EmbeddedType' ) {
            //console.log( 'widened type:', checker.getWidenedType( field ) )
            const widened_type = checker.getWidenedType( field )
            const symbol = widened_type.getSymbol()
            if ( symbol ) {
                for ( const member of symbol.members ) {
                    const member_symbol = member[ 1 ]
                    //console.log( 'member symbol:', member_symbol )
                    console.log( 'member symbol string:', checker.getFullyQualifiedName( member_symbol ) )
                    const type_of_member_symbol = checker.getDeclaredTypeOfSymbol( member_symbol )
                    //console.log( 'TYPE:', type_of_member_symbol ) = { ..., intrinsicName: 'error', ... }
                }
            }

            /*//console.log( 'TYPE:', field )
            const properties = checker.getPropertiesOfType( field )
            //console.log( properties.length, 'properties:', properties )
            for ( const embedded_p of properties ) {
                const target_symbol = embedded_p.target as ts.Symbol
                console.log( '    ', embedded_p.escapedName.toString(), ' target:', target_symbol )
            }*/

            /*//object fields initializations with starting values:
            const ds = p.getDeclarations()
            if ( ds ) {
                console.log( '    ', 'declarations:' )
                for ( const d of ds ) {
                    console.log( '        ', d.getText(), d )
                }
            }*/
        }
    }
    return JSON.stringify( result )
}

function find_child( children : ts.Node[], kind : ts.SyntaxKind ) : ts.Node | undefined {
    for ( const child of children ) {
        if ( child.kind == kind )
            return child
    }
    return undefined
}

