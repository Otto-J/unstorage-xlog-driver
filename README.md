# unstorage-xlog-driver

This is my package description.

## Usage

Install package:

```sh
# npm
npm install unstorage unstorage-xlog-driver

# yarn
yarn add unstorage unstorage-xlog-driver

# pnpm
pnpm install unstorage unstorage-xlog-driver

# bun
bun install unstorage unstorage-xlog-driver
```

Import:

```js
import { createStorage } from "unstorage";

import { xLogStorageDriver } from "unstorage-xlog-driver";

const OTTO_ID = 53_709;

async function main() {
  const storage = createStorage({
    driver: xLogStorageDriver({
      characterId: OTTO_ID,
      ttl: 60 * 60,
    }),
  });

  // const keys = await storage.getKeys();
  // console.log(keys);

  const info = await storage.getItem("72.md");
  // const info = await storage.getMeta("72.md");
  console.log(info);
}

main();
```

## Development

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

## License

Made with 💛

Published under [MIT License](./LICENSE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/packageName?style=flat&colorA=18181B&colorB=F0DB4F
[npm-version-href]: https://npmjs.com/package/packageName
[npm-downloads-src]: https://img.shields.io/npm/dm/packageName?style=flat&colorA=18181B&colorB=F0DB4F
[npm-downloads-href]: https://npmjs.com/package/packageName
[codecov-src]: https://img.shields.io/codecov/c/gh/unjs/packageName/main?style=flat&colorA=18181B&colorB=F0DB4F
[codecov-href]: https://codecov.io/gh/unjs/packageName
[bundle-src]: https://img.shields.io/bundlephobia/minzip/packageName?style=flat&colorA=18181B&colorB=F0DB4F
[bundle-href]: https://bundlephobia.com/result?p=packageName
