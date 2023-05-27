import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { wkSkeeters } from './getDids';
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'

// refresh our list every 5 minutes to catch any additions or removals
setInterval(async () => {
  didsToListenFor = await wkSkeeters()
  console.log(`now listening for skeets from ${didsToListenFor.length} beautiful poasters`);
}, 300000)

let didsToListenFor
wkSkeeters()
  .then(ids => {
    didsToListenFor = ids;
    console.log(`now listening for skeets from ${didsToListenFor.length} beautiful poasters`);
  })
  .catch(e => console.error('uhoh', e))

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return
    const ops = await getOpsByType(evt)
    const postsToDelete = ops.posts.deletes.map((del) => del.uri)
    const postsToCreate = ops.posts.creates
      .filter((create) => {
        // only posts from our spreadsheet
        return didsToListenFor?.includes(create.author);
      })
      .map(create => {
        console.log(create)
        return create
      })
      .map((create) => {
        // map alf-related posts to a db row
        return {
          uri: create.uri,
          cid: create.cid,
          replyParent: create.record?.reply?.parent.uri ?? null,
          replyRoot: create.record?.reply?.root.uri ?? null,
          indexedAt: new Date().toISOString(),
        }
      })

    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute()
    }
    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }
  }
}
