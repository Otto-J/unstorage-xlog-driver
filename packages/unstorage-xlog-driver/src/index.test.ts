import { expect, it, describe } from "bun:test";
import { createStorage } from "unstorage";
import { xLogStorageDriver } from "./index";

const OTTO_ID = 53_709;

describe("Must set characterID", () => {
  it("require pass", () => {
    expect(() => {
      createStorage({
        driver: xLogStorageDriver({
          ttl: 60 * 60,
        } as any),
      });
    }).toThrow(/Required/);

    expect(() => {
      createStorage({
        driver: xLogStorageDriver({
          characterId: OTTO_ID,
        } as any),
      });
    }).not.toThrow(/Required/);
  });
});

// 返回的 getKeys
describe("Storage features", () => {
  it.skip("getKeys", async () => {
    const storage = createStorage({
      driver: xLogStorageDriver({
        characterId: OTTO_ID,
        // ttl: 60 * 60,
      }),
    });
    const keys = await storage.getKeys();
    expect(keys).toBeInstanceOf(Array);
    // 返回的是 string[]
    expect(keys[0]).toBeTypeOf("string");
  });

  // 测试 getItem
  it.skip("getItem", async () => {
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
  it.skip("getMeta", async () => {
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
    expect(meta).toHaveProperty("title");
  });
});
