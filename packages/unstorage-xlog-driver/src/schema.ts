import { z } from "zod";
import { IPFS_GATEWAY } from "./core/fetch-info";

export const XLogStorageDriverOptionsSchema = z.object({
  characterId: z.number(),
  ttl: z.number().optional().default(60),
  ipfsGateway: z.string().url().optional().default(IPFS_GATEWAY),
});
