/* eslint-disable unicorn/no-null */
import { createIndexer } from "crossbell";
import matter from "gray-matter";
import { StorageMeta, defineDriver } from "unstorage";

const indexer = createIndexer();

const IPFS_GATEWAY = "https://ipfs.4everland.xyz/ipfs/";

export interface XLogStorageDriverOptions {
  characterId: number;
  ttl: number;
  ipfsGateway?: string;
}

interface xLogFileMeta extends StorageMeta {
  title: string;
  slug: string;
  tags: string[];
  uri: string;
  create_time: string;
  update_time: string;
  publish_time: string;
  summary: string;
}

interface xLogFile {
  content: string;
  meta: xLogFileMeta;
}

const DRIVER_NAME = "xLog-driver";
const LIMIT = 100;
const TAGS = "post";

async function fetchFiles(options: XLogStorageDriverOptions) {
  const files = new Map<string, xLogFile>();

  try {
    const characterId = Number(options.characterId);
    const rawRes = await indexer.note.getMany({
      characterId,
      includeNestedNotes: false,
      limit: LIMIT,
      tags: TAGS,
    });

    const lists = rawRes.list ?? [];

    for (const i of lists) {
      const key = i.noteId + ".md";

      const attributes = i.metadata?.content?.attributes ?? [];
      const slug =
        attributes
          .find((item) => item.trait_type === "xlog_slug")
          ?.value?.toString() ?? `note-${i.noteId}`;
      const summary =
        i.metadata?.content && "summary" in i.metadata?.content
          ? (i.metadata?.content.summary as string)
          : "";
      const body = i.metadata?.content?.content ?? "";

      const contentWithData = matter(body);

      const meta: xLogFileMeta = {
        uri: i.uri ?? "",
        create_time: i?.createdAt ?? "",
        update_time: i?.updatedAt ?? "",
        publish_time: i.metadata?.content?.date_published ?? "",
        title: i.metadata?.content?.title ?? "",
        tags: i.metadata?.content?.tags ?? [],
        slug,
        summary,
        ...contentWithData.data,
      };

      const content = matter.stringify(
        contentWithData.content.replaceAll(
          /ipfs:\/\/([^\n ]+)/g,
          (options.ipfsGateway ?? IPFS_GATEWAY) + "$1",
        ),
        meta,
      );

      files.set(key, {
        content,
        meta,
      });
    }
    return files;
  } catch {
    throw new Error(DRIVER_NAME + " Error: Failed");
  }
}

export const xLogStorageDriver = defineDriver(
  (opt: XLogStorageDriverOptions) => {
    const defaultOpt = {
      ttl: 60 * 60,
    };
    const options: XLogStorageDriverOptions = {
      ...defaultOpt,
      ...opt,
    };

    let files: Map<string, xLogFile>;
    let lastCheck = 0;
    let syncPromise: undefined | Promise<any>;

    // 这里缓存数据，多次读取不会重复请求
    const syncFiles = async () => {
      if (!options.characterId) {
        throw new Error(DRIVER_NAME + " Error: Not set characterId");
      }

      if (lastCheck + options.ttl * 1000 > Date.now()) {
        return;
      }

      if (!syncPromise) {
        syncPromise = fetchFiles(options);
      }

      files = await syncPromise;
      lastCheck = Date.now();
      syncPromise = undefined;
    };

    return {
      name: DRIVER_NAME,
      options,
      async hasItem(key) {
        await syncFiles();
        return files.has(key);
      },
      async getItem(key: string) {
        await syncFiles();

        return files.get(key)?.content;
      },
      // async setItem(key, value, _opts) {},
      // async removeItem(key, _opts) {},
      async getKeys() {
        await syncFiles();
        return [...files.keys()];
      },
      async getMeta(key) {
        await syncFiles();
        return files.get(key)?.meta as StorageMeta;
      },
      clear() {
        files.clear();
      },
      dispose() {
        files.clear();
      },
    };
  },
);
export default xLogStorageDriver;
