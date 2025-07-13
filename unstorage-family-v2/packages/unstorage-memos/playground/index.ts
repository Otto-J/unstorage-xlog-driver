import { createStorage } from "unstorage";
import { MemosStorageDriver } from "../src/index";
// import { MemosStorageDriver } from "../dist/index.js";
import type { IGetListOptions } from "../src/memos";
const storage = createStorage({
  driver: MemosStorageDriver({
    baseUrl: "https://notes.ijust.cc",
    AccessToken: process.env.token as string,
  }),
});

// console.log(process.env.token);

const [nextPage, ...res1] = await storage.getKeys("", {
  pageSize: 5,
  filter: ["PUBLIC"],
  // filter: ["PUBLIC", "PRIVATE"],
  // pageToken: "CAUQCg==",
  pageToken: "",
  moreInfo: true,
} as IGetListOptions);
console.log(res1);
// console.log(res1.map((i) => JSON.parse(decodeURIComponent(i))));
