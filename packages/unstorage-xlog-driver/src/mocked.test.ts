import { describe, expect, it, beforeEach, mock, spyOn } from 'bun:test'
import { createStorage } from 'unstorage'
import { xLogStorageDriver } from './index'
import caches from './core/cache'
import * as fetchInfoModule from './core/fetch-info'
import type { xLogFile, XLogStorageDriverOptions, IGetKeysOptionsParsed } from './types'

// Create mock data
const mockData = new Map<string, xLogFile>([
  ['1.md', {
    content: '---\ntitle: Test Post 1\nslug: test-post-1\ntags: ["test", "mock"]\n---\nThis is test content 1',
    meta: {
      title: 'Test Post 1',
      slug: 'test-post-1',
      tags: ['test', 'mock'],
      uri: 'test-uri-1',
      create_time: '2023-01-01T00:00:00Z',
      update_time: '2023-01-02T00:00:00Z',
      publish_time: '2023-01-03T00:00:00Z',
      summary: 'Test summary 1',
      id_xlog: 1
    }
  }],
  ['2.md', {
    content: '---\ntitle: Test Post 2\nslug: test-post-2\ntags: ["test", "example"]\n---\nThis is test content 2',
    meta: {
      title: 'Test Post 2',
      slug: 'test-post-2',
      tags: ['test', 'example'],
      uri: 'test-uri-2',
      create_time: '2023-02-01T00:00:00Z',
      update_time: '2023-02-02T00:00:00Z',
      publish_time: '2023-02-03T00:00:00Z',
      summary: 'Test summary 2',
      id_xlog: 2
    }
  }]
])

const TEST_CHARACTER_ID = 12345

describe('xLogStorageDriver with mocked fetchFiles', () => {
  // Use spyOn to mock the fetchFiles function
  const fetchFilesSpy = spyOn(fetchInfoModule, 'fetchFiles')
  
  beforeEach(() => {
    // Reset the spy and set the mock implementation
    fetchFilesSpy.mockReset()
    fetchFilesSpy.mockImplementation(async () => mockData)
    
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
      // The implementation returns an empty object for non-existent keys, not undefined
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
      
      // Mock fetchFiles to return an empty map for this test
      fetchFilesSpy.mockImplementationOnce(async () => new Map())
      
      // Check if keys are empty after clear
      const keys = await storage.getKeys()
      expect(keys.length).toBe(0)
    })
    
    it('dispose should clear all files', async () => {
      // First ensure we have files
      await storage.getKeys()
      
      // Now dispose and check
      storage.dispose()
      
      // Mock fetchFiles to return an empty map for this test
      fetchFilesSpy.mockImplementationOnce(async () => new Map())
      
      // Check if keys are empty after dispose
      const keys = await storage.getKeys()
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
      } catch (error) {
        expect(error).toBeDefined()
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
      } catch (error: any) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Network error')
      }
    })
  })
})
