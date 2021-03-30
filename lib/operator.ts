
import Edge from './edge'

export default class Operator {
    apply : ( edge : Edge ) => boolean
    name : string
    destructor ?: () => void = undefined

    constructor(
        apply : ( edge : Edge ) => boolean,
        name : string
    ) {
        this.apply = apply
        this.name = name
    }
}
