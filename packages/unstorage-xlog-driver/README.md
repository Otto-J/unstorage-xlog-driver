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
import { createStorage } from "unstorage";
import { xLogStorageDriver } from "@web.worker/unstorage-xlog-driver";

const OTTO_ID = 53_709;

async function main() {
  const storage = createStorage({
    driver: xLogStorageDriver({
      characterId: OTTO_ID,
      ttl: 60 * 60, // cache 1h
    }),
  });

  // 获取所有的 key
  // const keys = await storage.getKeys();
  // console.log(keys);

  const info = await storage.getItem("72.md");
  // const info = await storage.getMeta("72.md");
  console.log(info);
}

main();
```

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
