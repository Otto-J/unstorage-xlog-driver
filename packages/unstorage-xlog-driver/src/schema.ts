import { z } from "zod";

export const XLogStorageDriverOptionsSchema = z.object({
  characterId: z.number(),
  ttl: z.number().default(60).optional(),
  ipfsGateway: z.string().url().optional(),
});
