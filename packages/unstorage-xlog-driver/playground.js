import { createStorage } from "unstorage";
import { xLogStorageDriver } from "./dist/index.js";

const OTTO_ID = 53_709;

const storage = createStorage({
  driver: xLogStorageDriver({ characterId: OTTO_ID }),
});

async function main() {
  const keys = await storage.getKeys();
  console.log(keys);
}

main();
