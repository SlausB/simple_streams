import type { NodeVisitorContext } from 'simple-ts-transform'
import type { NodeFactory, Program, SourceFile, TransformationContext } from 'typescript'
import fs from 'fs'

export default class Context implements NodeVisitorContext {
    public readonly basePath: string
    public factory!: NodeFactory
    public fileName!: string
    public constructor(program: Program, public readonly _configuration: unknown) {
        this.basePath = program.getCompilerOptions().rootDir || program.getCurrentDirectory()

        console.log( 'hello?' )
        fs.writeFileSync( './hello.json', 'hello?' )
    }
    public initNewFile(context: TransformationContext, sourceFile: SourceFile): void {
        this.factory = context.factory
        this.fileName = sourceFile.fileName
    }
}
