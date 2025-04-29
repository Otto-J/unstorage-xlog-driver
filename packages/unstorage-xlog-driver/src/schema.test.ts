import { describe, expect, it } from 'bun:test'
import { XLogStorageDriverOptionsSchema, getKeysOptionsSchema } from './schema'

describe('Schema validation', () => {
  describe('XLogStorageDriverOptionsSchema', () => {
    it('should validate valid options', () => {
      const validOptions = {
        characterId: 12345,
        ttl: 60,
        ipfsGateway: 'https://ipfs.example.com/ipfs/'
      }
      
      const result = XLogStorageDriverOptionsSchema.safeParse(validOptions)
      expect(result.success).toBe(true)
    })

    it('should require characterId', () => {
      const invalidOptions = {
        ttl: 60,
        ipfsGateway: 'https://ipfs.example.com/ipfs/'
      }
      
      const result = XLogStorageDriverOptionsSchema.safeParse(invalidOptions)
      expect(result.success).toBe(false)
    })

    it('should set default values', () => {
      const minimalOptions = {
        characterId: 12345
      }
      
      const result = XLogStorageDriverOptionsSchema.parse(minimalOptions)
      expect(result.ttl).toBe(60) // Default ttl
      expect(result.ipfsGateway).toBe('https://ipfs.4everland.xyz/ipfs/') // Default gateway
    })

    it('should validate ipfsGateway is a valid URL', () => {
      const invalidOptions = {
        characterId: 12345,
        ipfsGateway: 'not-a-url'
      }
      
      const result = XLogStorageDriverOptionsSchema.safeParse(invalidOptions)
      expect(result.success).toBe(false)
    })
  })

  describe('getKeysOptionsSchema', () => {
    it('should validate valid options', () => {
      const validOptions = {
        limit: 10,
        cursor: 'test-cursor',
        meta: true,
        content: false
      }
      
      const result = getKeysOptionsSchema.safeParse(validOptions)
      expect(result.success).toBe(true)
    })

    it('should set default values', () => {
      const emptyOptions = {}
      
      const result = getKeysOptionsSchema.parse(emptyOptions)
      expect(result.limit).toBe(500) // Default limit
      expect(result.cursor).toBe('') // Default cursor
      expect(result.meta).toBe(false) // Default meta
      expect(result.content).toBe(false) // Default content
    })

    it('should enforce minimum limit', () => {
      const invalidOptions = {
        limit: 0 // Below minimum of 1
      }
      
      const result = getKeysOptionsSchema.safeParse(invalidOptions)
      expect(result.success).toBe(false)
    })

    it('should enforce maximum limit', () => {
      const invalidOptions = {
        limit: 10000 // Above maximum of 9999
      }
      
      const result = getKeysOptionsSchema.safeParse(invalidOptions)
      expect(result.success).toBe(false)
    })

    it('should verify bugs in limit validation', () => {
      const validOptions = {
        limit: 1 // Minimum valid value
      }
      
      const result = getKeysOptionsSchema.safeParse(validOptions)
      expect(result.success).toBe(true)
    })
  })
})
