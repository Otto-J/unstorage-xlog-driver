/* eslint-disable unicorn/prefer-top-level-await */
import { createStorage } from "unstorage";

import { xLogStorageDriver } from "../src/index";

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
