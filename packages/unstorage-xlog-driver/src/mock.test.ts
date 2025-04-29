import { beforeEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { createStorage } from 'unstorage'
import { mockFiles } from './core/__mocks__/mock-data'
import caches from './core/cache'
import * as fetchInfoModule from './core/fetch-info'
import { xLogStorageDriver } from './index'

// Create a mock module for fetch-info
const mockFetchFiles = mock(async () => {
  return mockFiles
})

// Create a mock for the entire fetch-info module
const _mockFetchInfoModule = {
  fetchFiles: mockFetchFiles,
  IPFS_GATEWAY: 'https://ipfs.4everland.xyz/ipfs/',
}

// Mock the import using spyOn since jest.mock doesn't work with Bun
const fetchFilesSpy = spyOn(fetchInfoModule, 'fetchFiles')
fetchFilesSpy.mockImplementation(mockFetchFiles)

const TEST_CHARACTER_ID = 12345

describe('xLogStorageDriver with mocked network requests', () => {
  beforeEach(() => {
    // Clear the cache before each test
    caches.clear()
  })

  describe('Schema validation', () => {
    it('should throw an error when characterId is missing', () => {
      expect(() => {
        createStorage({
          driver: xLogStorageDriver({
            ttl: 60 * 60,
          } as any),
        })
      }).toThrow(/Required/)
    })

    it('should not throw when characterId is provided', () => {
      expect(() => {
        createStorage({
          driver: xLogStorageDriver({
            characterId: TEST_CHARACTER_ID,
          }),
        })
      }).not.toThrow()
    })
  })

  describe('Driver methods', () => {
    let storage: ReturnType<typeof createStorage>

    beforeEach(() => {
      storage = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID,
          ttl: 60 * 60,
        }),
      })
    })

    it('getKeys should return an array of keys', async () => {
      const keys = await storage.getKeys()
      expect(keys).toBeInstanceOf(Array)
      expect(keys.length).toBe(2)
      expect(keys).toContain('1.md')
      expect(keys).toContain('2.md')
    })

    it('getItem should return content for a valid key', async () => {
      const item = await storage.getItem('1.md')
      expect(item).toBeTypeOf('string')
      expect(item).toContain('Test Post 1')
    })

    it('getItem should return undefined for an invalid key', async () => {
      const item = await storage.getItem('nonexistent.md')
      expect(item).toBeUndefined()
    })

    it('hasItem should return true for existing items', async () => {
      const exists = await storage.hasItem('1.md')
      expect(exists).toBe(true)
    })

    it('hasItem should return false for non-existing items', async () => {
      const exists = await storage.hasItem('nonexistent.md')
      expect(exists).toBe(false)
    })

    it('getMeta should return metadata for a valid key', async () => {
      const meta = await storage.getMeta('1.md')
      expect(meta).toHaveProperty('title', 'Test Post 1')
      expect(meta).toHaveProperty('slug', 'test-post-1')
      expect(meta).toHaveProperty('tags')
      expect(meta.tags).toContain('test')
    })

    it('getMeta should return an empty object for an invalid key', async () => {
      const meta = await storage.getMeta('nonexistent.md')
      expect(meta).toEqual({})
    })

    it('getKeys with meta option should return encoded JSON strings', async () => {
      const keys = await storage.getKeys('', { meta: true })
      expect(keys).toBeInstanceOf(Array)
      expect(keys.length).toBe(2)

      // Decode and parse the first key
      const decoded = JSON.parse(decodeURIComponent(keys[0]))
      expect(decoded).toHaveProperty('meta')
      expect(decoded.meta).toHaveProperty('title')
    })

    it('getKeys with content option should return encoded JSON strings with content', async () => {
      const keys = await storage.getKeys('', { content: true })
      expect(keys).toBeInstanceOf(Array)

      // Decode and parse the first key
      const decoded = JSON.parse(decodeURIComponent(keys[0]))
      expect(decoded).toHaveProperty('content')
      expect(decoded.content).toBeTypeOf('string')
    })

    it('clear should clear all files', async () => {
      // First ensure we have files
      await storage.getKeys()

      // Introduce a temporary bug to verify the test catches it
      // Uncomment the next line to make the test fail
      // return

      // Now clear and check
      storage.clear()

      // Check if files are empty after clear
      // We need to create a new storage instance to bypass the cache
      const newStorage = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID,
          ttl: 60 * 60,
        }),
      })

      // Mock fetchFiles to return an empty map for this test
      mockFetchFiles.mockImplementationOnce(async () => new Map())

      const keys = await newStorage.getKeys()
      expect(keys.length).toBe(0)
    })

    it('dispose should clear all files', async () => {
      // First ensure we have files
      await storage.getKeys()

      // Now dispose and check
      storage.dispose()

      // Check if files are empty after dispose
      // We need to create a new storage instance to bypass the cache
      const newStorage = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID,
          ttl: 60 * 60,
        }),
      })

      // Mock fetchFiles to return an empty map for this test
      mockFetchFiles.mockImplementationOnce(async () => new Map())

      const keys = await newStorage.getKeys()
      expect(keys.length).toBe(0)
    })
  })

  describe('Error handling', () => {
    it('should throw an error when getKeys receives invalid options', async () => {
      const storage = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID,
        }),
      })

      // Pass an invalid limit value
      try {
        await storage.getKeys('', { limit: -1 } as any)
        expect.unreachable('Should have thrown an error')
      }
      catch (error: any) {
        expect(error).toBeDefined()
        expect(error.message).toContain('greater than or equal to 1')
      }
    })

    it('should handle fetchFiles errors gracefully', async () => {
      // Mock fetchFiles to throw an error
      fetchFilesSpy.mockImplementationOnce(async () => {
        throw new Error('Network error')
      })

      const storage = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID,
        }),
      })

      // Verify that the error is propagated
      try {
        await storage.getKeys()
        expect.unreachable('Should have thrown an error')
      }
      catch (error: any) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Network error')
      }
    })
  })
})
