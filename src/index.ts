/* eslint-disable unicorn/no-null */
import { defineDriver } from "unstorage";
import { createIndexer } from "crossbell";
import matter from "gray-matter";

const indexer = createIndexer();

const IPFS_GATEWAY = "https://ipfs.4everland.xyz/ipfs/";

export interface XLogStorageDriverOptions {
  characterId: number;
  ttl: number;
}

interface xLogFile {
  body: string;
  meta: {
    title: string;
    slug: string;
    tags: string[];
    uri: string;
    create_time: string;
    update_time: string;
    publish_time: string;
    // showPublishtime: string; // 可浏览时间，这里是给用户看的
  };
}
interface XLogFileInfo {
  [prop: string]: xLogFile;
}

const DRIVER_NAME = "xLog-driver";
const LIMIT = 100;
const TAGS = "post";

async function fetchFiles(
  options: XLogStorageDriverOptions,
): Promise<XLogFileInfo> {
  const files: XLogFileInfo = {};
  try {
    const characterId = Number(options.characterId);
    const rawRes = await indexer.note.getMany({
      characterId,
      includeNestedNotes: false,
      limit: LIMIT,
      tags: TAGS,
    });

    const lists = rawRes.list ?? [];
    // console.log(JSON.stringify(lists[0].metadata, null, 2));

    // const res = lists.map((i) => String(i.noteId) + ".md");

    for (const i of lists) {
      files[i.noteId + ".md"] = {
        meta: {
          uri: i.uri ?? "",
          create_time: i?.createdAt ?? "",
          update_time: i?.updatedAt ?? "",
          // publishedAt: i?.publishedAt ?? "",
          publish_time: i.metadata?.content?.date_published ?? "",
          title: i.metadata?.content?.title ?? "",
          tags: i.metadata?.content?.tags ?? [],
          slug:
            ((i.metadata?.content?.attributes ?? []).find(
              (item) => item.trait_type === "xlog_slug",
            )?.value as string) ?? "",
        },
        body: i.metadata?.content?.content ?? "",
      };
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

    // 这是要实现缓存
    let files: XLogFileInfo = {};
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
        return key in files;
      },
      async getItem(key: string) {
        await syncFiles();
        // 可以考虑在这里转换 IPFS 为网关地址
        // 可以考虑把 meta 信息塞入 frontmatter 里
        // 解析 frontmatter
        const body = files[key]?.body ?? "";
        const { data, content } = matter(body);

        // 替换 content 中的 ipfs 地址，转换为网关地址
        const processedContent = content.replace(
          /ipfs:\/\/([^\n ]+)/g,
          IPFS_GATEWAY + "$1",
        );

        // 将处理后的结果写入文件
        const processedFrontmatter = {
          ...data,
          ...files[key]?.meta,
        };
        const processedMarkdown = matter.stringify(
          processedContent,
          processedFrontmatter,
        );

        return processedMarkdown;
      },
      // async setItem(key, value, _opts) {},
      // async removeItem(key, _opts) {},
      async getKeys() {
        await syncFiles();
        return Object.keys(files);
      },
      async getMeta(key) {
        await syncFiles();
        const item = files[key as keyof typeof files];
        return item ? item.meta : null;
      },
    };
  },
);
export default xLogStorageDriver;
