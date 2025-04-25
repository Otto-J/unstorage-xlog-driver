# unstorage-xlog-driver

简化版操作 xlog.app 上的个人数据。背后依赖 `crossbell` sdk。

## Usage

Install package:

```sh
# npm
npm install unstorage @web.worker/unstorage-xlog-driver
```

Import:

```js
import { xLogStorageDriver } from '@web.worker/unstorage-xlog-driver'
import { createStorage } from 'unstorage'

const OTTO_ID = 53_709

async function main() {
  const storage = createStorage({
    driver: xLogStorageDriver({
      characterId: OTTO_ID,
      ttl: 60 * 60, // cache 1h
    }),
  })

  // 获取所有的 key
  // const keys = await storage.getKeys();
  // console.log(keys);

  const info = await storage.getItem('72.md')
  // const info = await storage.getMeta("72.md");
  console.log(info)
}

main()
```

### getKeys()

获取指定用户公开日志。通过参数返回节目 id和详情列表，可实现分页。

```ts
const query: IGetKeysOptions = {
  limit: 4,
  /** {userId}_noteId */
  cursor: `${OTTO_ID}_109`,
  meta: true,
  content: false,
}
const keys = await storage.getKeys('', query)
try {
  const res = keys.map((key) => {
    // 必须 decode
    return JSON.parse(decodeURIComponent(key))
  })
  console.log(res.map(item => item.meta.id_xlog))
}
catch (error) {
  console.log(error)
}
```

cursor 参数格式为 `userId_noteId`，可通过最后一条的 `id-1` 作为参数传递。

如果 meta/content 都为 false，无需 JSON.parse

## 目前实现了

- getKeys
- hasItem
- getItem
- getMeta

## Development

```shell
export LOG_LEVEL=debug
```

## License

Made with 💛

Published under [MIT License](./LICENSE).
