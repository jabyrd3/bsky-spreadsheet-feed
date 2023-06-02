import { InvalidRequestError } from '@atproto/xrpc-server'
import { QueryParams } from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import { AppContext } from '../config'

// export const uri = 'at://did:plc:yv6gvhnalg56qtfxh26d5dou/app.bsky.feed.generator/kabuki-friends'
export const uri = 'at://did:web:bsky.dev.host/app.bsky.feed.generator/as-hole' //{YOUR_REMOTE_SERVER_PUBLIC_DOMAIN
export const handler = async (ctx: AppContext, params: QueryParams) => {
  let builder = ctx.db
    .selectFrom('ashole')
    .selectAll()
    .orderBy('indexedAt', 'desc')
    .orderBy('cid', 'desc')
    .limit(params.limit)

  if (params.cursor) {
    const [indexedAt, cid] = params.cursor.split('::')
    if (!indexedAt || !cid) {
      throw new InvalidRequestError('malformed cursor')
    }
    const timeStr = new Date(parseInt(indexedAt, 10)).toISOString()
    builder = builder
      .where('ashole.indexedAt', '<', timeStr)
      .orWhere((qb) => qb.where('ashole.indexedAt', '=', timeStr))
      .where('ashole.cid', '<', cid)
  }
  const res = await builder.execute()

  const feed = res.map((row) => ({
    post: row.uri,
  }))

  let cursor: string | undefined
  const last = res.at(-1)
  if (last) {
    cursor = `${new Date(last.indexedAt).getTime()}::${last.cid}`
  }

  return {
    cursor,
    feed,
  }
}
