import type { StorageMeta } from "unstorage";
import { z } from "zod";
import { XLogStorageDriverOptionsSchema } from "./schema";

export type XLogStorageDriverOptions = z.input<
  typeof XLogStorageDriverOptionsSchema
>;

export interface xLogFileMeta extends StorageMeta {
  title: string;
  slug: string;
  tags: string[];
  uri: string;
  create_time: string;
  update_time: string;
  publish_time: string;
  summary: string;
}

export interface xLogFile {
  content: string;
  meta: xLogFileMeta;
}
