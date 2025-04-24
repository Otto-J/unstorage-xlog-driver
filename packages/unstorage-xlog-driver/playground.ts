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
    limit: 10,
    /** {userId}_noteId */
    cursor: `${OTTO_ID}_115`,
    meta: true,
    content: false,
  };
  const keys = await storage.getKeys("", query);
  try {
    const res = keys.map((key) => {
      return JSON.parse(decodeURIComponent(key));
    });
    console.log(res.map((item) => item.meta.title));
  } catch (error) {
    console.log(error);
  }
}

main();

// const obj1 = z.object({
//   name: z.string().optional().default("john"),
// });

// console.log(obj1.parse({}));
