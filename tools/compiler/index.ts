import buildTransformer from 'simple-ts-transform'
import Context from './context'
import MyFileNameInserter from './inserter'

const transformer = buildTransformer(Context, [ MyFileNameInserter ])
export default transformer