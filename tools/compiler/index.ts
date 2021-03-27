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
        //@ts-ignore
        const name = node.name
        if ( name ) {
            const symbol = checker.getSymbolAtLocation( name )
            if ( symbol ) {
                console.log(
                    'type string:',
                    checker.typeToString( checker.getTypeOfSymbolAtLocation( symbol, symbol.valueDeclaration ) )
                )
            }
        }
        ts.forEachChild( node, visit )
    }
}

