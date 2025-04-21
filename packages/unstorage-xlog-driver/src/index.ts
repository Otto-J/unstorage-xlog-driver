import fs from "node:fs";
import { defineDriver, type StorageMeta } from "unstorage";
import pino from "pino";
import { fetchFiles } from "./core/fetch-info";
import { XLogStorageDriverOptionsSchema } from "./schema";
import caches from "./core/cache";
import type { xLogFile, XLogStorageDriverOptions } from "./types";

// 创建一个写入流，将日志输出到 dist/log.txt 文件
const logFilePath = "./dist/log.txt";
if (!fs.existsSync("./dist")) {
  fs.mkdirSync("./dist"); // 确保 dist 目录存在
}
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

const logger = pino(
  {
    name: "xlog-driver",
    level: process.env.LOG_LEVEL || "info",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  },
  logStream,
);

export const DRIVER_NAME = "xLog-driver";

let files: Map<string, xLogFile>;

export const xLogStorageDriver = defineDriver(
  (opt: XLogStorageDriverOptions) => {
    logger.debug({ opt }, "user raw options");
    const _options = XLogStorageDriverOptionsSchema.safeParse(opt);
    logger.debug({ _options }, "user safeParse result");
    if (!_options.success) {
      logger.error({ error: _options.error }, "user options parse error");
      throw new Error(_options.error.message);
    }
    const options = _options.data as Required<XLogStorageDriverOptions>;
    logger.debug({ options }, "user format options");

    const syncFiles = async () => {
      logger.debug("syncFiles start");
      const expired = caches.get(options.characterId.toString());
      logger.debug({ expired }, "caches get result");
      const now = Date.now();

      // 如果缓存不存在或已过期，则重新请求
      if (!expired || Number(expired) < now) {
        logger.debug("expired, will fetchFiles");
        files = await fetchFiles(options);
        logger.debug({ files }, "syncFiles files");
        logger.debug(
          {
            now,
            ttl: options.ttl,
            expired: now + options.ttl * 1000,
          },
          "syncFiles set cache",
        );
        caches.set(options.characterId.toString(), now + options.ttl * 1000);
        logger.debug("syncFiles done");
      } else {
        logger.debug("no expired, will not fetchFiles");
      }
    };

    return {
      name: DRIVER_NAME,
      options,
      async hasItem(key: string) {
        logger.debug("hasItem", key);
        await syncFiles();
        return files.has(key);
      },
      async getItem(key: string) {
        logger.debug("getItem", key);
        await syncFiles();

        return files.get(key)?.content;
      },
      // async setItem(key, value, _opts) {},
      // async removeItem(key, _opts) {},
      async getKeys() {
        logger.debug("start getKeys function");
        await syncFiles();
        return [...files.keys()];
      },
      async getMeta(key: string) {
        logger.debug("getMeta", key);
        await syncFiles();
        return files.get(key)?.meta as StorageMeta;
      },
      clear() {
        logger.debug("clear");
        files.clear();
      },
      dispose() {
        logger.debug("dispose");
        files.clear();
      },
    };
  },
);
export default xLogStorageDriver;
