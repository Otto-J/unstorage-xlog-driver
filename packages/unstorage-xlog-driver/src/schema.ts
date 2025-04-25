import { z } from 'zod'
import { IPFS_GATEWAY } from './core/fetch-info'

const LIMIT_MIN = 1
const LIMIT_MAX = 9999
const LIMIT_DEFAULT = 500

export const XLogStorageDriverOptionsSchema = z.object({
  characterId: z.number(),
  ttl: z.number().optional().default(60),
  ipfsGateway: z.string().url().optional().default(IPFS_GATEWAY),
})

export const getKeysOptionsSchema = z.object({
  limit: z
    .number()
    .gte(LIMIT_MIN)
    .lte(LIMIT_MAX)
    .optional()
    .default(LIMIT_DEFAULT),
  cursor: z.string().optional().default(''),
  meta: z.boolean().optional().default(false),
  content: z.boolean().optional().default(false),
})
