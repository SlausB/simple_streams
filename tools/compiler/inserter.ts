import type { NodeVisitor } from 'simple-ts-transform'
import type { Node, StringLiteral } from 'typescript'
import { isStringLiteral } from 'typescript'
import Context from './context'

export default class MyFileNameInserter implements NodeVisitor<StringLiteral> {
  private readonly fileName: string
  public constructor(private readonly context: Context) {
    this.fileName = context.fileName
  }
  public wants(node: Node): node is StringLiteral {
    return isStringLiteral(node)
  }
  public visit(node: StringLiteral) {
    const { createStringLiteral } = this.context.factory
    return [
        createStringLiteral( this.fileName + ': ' + node.getText().slice(1, -1) )
    ]
  }
}