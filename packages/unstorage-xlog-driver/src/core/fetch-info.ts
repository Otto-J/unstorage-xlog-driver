import { createIndexer } from "crossbell";
import matter from "gray-matter";
import type {
  xLogFile,
  xLogFileMeta,
  XLogStorageDriverOptions,
} from "../types";

const LIMIT = 100;
const TAGS = "post";

export const IPFS_GATEWAY = "https://ipfs.4everland.xyz/ipfs/";

const indexer = createIndexer();

export async function fetchFiles(options: XLogStorageDriverOptions) {
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
  } catch (error: any) {
    console.log(error.message);
    throw new Error(error.message);
  }
}
