import { expect, it, describe, mock, spyOn } from "bun:test";
import { createStorage } from "unstorage";
import caches from "./core/cache";
import { xLogStorageDriver } from "./index";

const getFn = spyOn(caches, "get");
const setFn = spyOn(caches, "set");

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
  });
  it("require pass", () => {
    expect(() => {
      createStorage({
        driver: xLogStorageDriver({
          characterId: OTTO_ID,
        }),
      });
    }).not.toThrow(/Required/);
  });
});

// 返回的 getKeys
describe.only("Storage features", () => {
  const storage = createStorage({
    driver: xLogStorageDriver({
      characterId: OTTO_ID,
      ttl: 60 * 60,
    }),
  });
  it("getKeys use cache", async () => {
    const keys = await storage.getKeys();
    expect(keys).toBeInstanceOf(Array);
    // 返回的是 string[]
    expect(keys[0]).toBeTypeOf("string");
    expect(getFn).toBeCalledTimes(1);
    expect(setFn).toBeCalledTimes(1);

    await storage.getKeys();
    expect(getFn).toBeCalledTimes(2);
  });

  // 测试 getItem
  it("getItem", async () => {
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
    expect(meta).toHaveProperty("title");
  });
});
