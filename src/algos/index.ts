import { AppContext } from '../config'
import {
  QueryParams,
  OutputSchema as AlgoOutput,
} from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import * as kabuki from './kabuki-friends'
import * as asshole from './asshole'
type AlgoHandler = (ctx: AppContext, params: QueryParams) => Promise<AlgoOutput>

const algos: Record<string, AlgoHandler> = {
  [kabuki.uri]: kabuki.handler,
  [asshole.uri]: asshole.handler
}

export default algos
