import type { StorageMeta } from "unstorage";
import { z } from "zod";
import { getKeysOptionsSchema, XLogStorageDriverOptionsSchema } from "./schema";

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

export type ICache =
  | {
      expired: number;
      limit: number;
      cursor: string;
    }
  | undefined;

export type IGetKeysOptions = z.input<typeof getKeysOptionsSchema>;
export type IGetKeysOptionsParsed = z.infer<typeof getKeysOptionsSchema>;
