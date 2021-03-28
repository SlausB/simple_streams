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
    const symbol = type.getSymbol()
    if ( ! symbol ) {
        //seems like it's actually just TypeScript-provided type:
        /*console.log( 'type', checker.typeToString( type ), 'has NO symbol', type )
        throw new Error( 'Type MUST have a symbol' )*/

        return checker.typeToString( type )
    }

    //I don't know yet what multiple declarations mean:
    for ( const d of symbol.declarations ) {
        const declaration_type = checker.getTypeAtLocation( d )
        if ( symbol.members ) {
            console.log( 'user type:', checker.typeToString( declaration_type ) )
            const result : { [ key : string ] : string } = {}
            for ( const [ name, mbr ] of symbol.members ) {
                const member = mbr as ts.Symbol

                const member_type = checker.getTypeAtLocation( member.valueDeclaration )

                console.log( 'recursing into', name )
                result[ name ] = serialize_type( member_type, checker )
            }
            return JSON.stringify( result )
        }
        else {
            console.log( 'lib type:', checker.typeToString( declaration_type ) )
            return checker.typeToString( declaration_type )
        }
    }
    throw new Error( 'type was supposed to unravel at this point' )
}

function find_child( children : ts.Node[], kind : ts.SyntaxKind ) : ts.Node | undefined {
    for ( const child of children ) {
        if ( child.kind == kind )
            return child
    }
    return undefined
}

