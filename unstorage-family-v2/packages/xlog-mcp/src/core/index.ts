import type { IGetKeysOptions } from '@web.worker/unstorage-xlog-driver/types'
import { xLogStorageDriver } from '@web.worker/unstorage-xlog-driver'
import { createStorage } from 'unstorage'

export async function fetchXlogList(options: any) {
  const storage = createStorage({
    driver: xLogStorageDriver({
      characterId: Number(options.CHARACTER_ID),
      ttl: 60 * 60,
    }),
  })

  const query: IGetKeysOptions = {
    limit: options.limit,
    /** {userId}_noteId */
    cursor: options.cursor,
    meta: options.meta,
    content: options.content,
  }

  let res: any[] = []
  console.error({ query })

  if (query.meta || query.content) {
    const _res = await storage.getKeys('', query)
    res = _res.map((item) => {
      return JSON.parse(decodeURIComponent(item))
    })
  }
  else {
    res = await storage.getKeys('', query)
  }

  return res
}
