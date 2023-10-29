import { expect, it, describe } from "vitest";
import { createStorage } from "unstorage";
import { xLogStorageDriver } from "../src/index";

const OTTO_ID = 53_709;

describe("Must set characterID", () => {
  it("pass", () => {
    const opt = {
      ttl: 60 * 60,
      // characterId: OTTO_ID,
    };
    const storage = createStorage({
      driver: xLogStorageDriver(opt as any),
    });
    // expect().toBe(true);
    // 通过 stroage.getKeys 会报错
    expect(storage.getKeys()).rejects.toThrow();
  });
});

// 返回的 getKeys
describe("Storage features", () => {
  it("getKeys", async () => {
    const storage = createStorage({
      driver: xLogStorageDriver({
        characterId: OTTO_ID,
        ttl: 60 * 60,
      }),
    });
    const keys = await storage.getKeys();
    expect(keys).toBeInstanceOf(Array);
    // 返回的是 string[]
    expect(keys[0]).toBeTypeOf("string");
  });

  // 测试 getItem
  it("getItem", async () => {
    const storage = createStorage({
      driver: xLogStorageDriver({
        characterId: OTTO_ID,
        ttl: 60 * 60,
      }),
    });
    const keys = await storage.getKeys();

    const item = await storage.getItem(keys[0]);
    // const item = await storage.getItem("72.md");
    expect(item).toBeTypeOf("string");
  });

  // 测试 getMeta
  it("getMeta", async () => {
    const storage = createStorage({
      driver: xLogStorageDriver({
        characterId: OTTO_ID,
        ttl: 60 * 60,
      }),
    });
    const keys = await storage.getKeys();

    const meta = await storage.getMeta(keys[0]);
    console.log(meta.title);
    // const meta = await storage.getMeta("72.md");
    expect(meta).haveOwnProperty("title");
  });
});
