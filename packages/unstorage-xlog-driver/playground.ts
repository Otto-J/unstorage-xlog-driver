import { createStorage } from "unstorage";
import { z } from "zod";
import { xLogStorageDriver } from "./src/index";
import { IGetKeysOptions } from "./src/types";
// import { xLogStorageDriver } from "./dist/index.js";

const OTTO_ID = 53_709;

const storage = createStorage({
  driver: xLogStorageDriver({ characterId: OTTO_ID }),
});

async function main() {
  const query: IGetKeysOptions = {
    limit: 5,
    cursor: "",
    meta: true,
    content: true,
  };
  const keys = await storage.getKeys("", query);
  console.log(keys);
}

main();

// const obj1 = z.object({
//   name: z.string().optional().default("john"),
// });

// console.log(obj1.parse({}));
