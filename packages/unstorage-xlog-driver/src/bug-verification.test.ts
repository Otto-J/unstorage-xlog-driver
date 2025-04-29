import { describe, expect, it, beforeEach, spyOn } from 'bun:test'
import { createStorage } from 'unstorage'
import { xLogStorageDriver } from './index'
import caches from './core/cache'
import * as fetchInfoModule from './core/fetch-info'
import type { xLogFile } from './types'

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
  }]
])

// Create buggy data
const buggyData = new Map<string, xLogFile>([
  ['wrong.md', {
    content: '---\ntitle: Wrong Title\nslug: wrong-slug\ntags: ["wrong"]\n---\nWrong content',
    meta: {
      title: 'Wrong Title',
      slug: 'wrong-slug',
      tags: ['wrong'],
      uri: 'wrong-uri',
      create_time: '2023-01-01T00:00:00Z',
      update_time: '2023-01-02T00:00:00Z',
      publish_time: '2023-01-03T00:00:00Z',
      summary: 'Wrong summary',
      id_xlog: 999
    }
  }]
])

const TEST_CHARACTER_ID = 12345

describe('Bug verification tests', () => {
  // Use spyOn to mock the fetchFiles function
  const fetchFilesSpy = spyOn(fetchInfoModule, 'fetchFiles')
  
  beforeEach(() => {
    // Reset the spy and set the mock implementation
    fetchFilesSpy.mockReset()
    
    // Clear the cache before each test
    caches.clear()
  })
  
  describe('Temporary bug tests', () => {
    it('should detect when hasItem returns incorrect value', async () => {
      // Set up the mock to return normal data
      fetchFilesSpy.mockImplementation(async () => mockData)
      
      // Create a storage instance
      const storage = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID,
        }),
      })
      
      // Verify normal behavior
      const exists = await storage.hasItem('1.md')
      expect(exists).toBe(true)
      
      // Introduce a temporary bug by changing the mock implementation
      fetchFilesSpy.mockImplementation(async () => buggyData)
      
      // Create a new storage instance to avoid cache
      const storage2 = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID + 1, // Use a different ID to avoid cache
        }),
      })
      
      // This should now return false since the key is different
      const existsAfterBug = await storage2.hasItem('1.md')
      expect(existsAfterBug).toBe(false)
      
      // Fix the bug by restoring the original mock
      fetchFilesSpy.mockImplementation(async () => mockData)
      
      // Create a new storage instance
      const storage3 = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID + 2, // Use a different ID to avoid cache
        }),
      })
      
      // Verify it's fixed
      const existsAfterFix = await storage3.hasItem('1.md')
      expect(existsAfterFix).toBe(true)
    })
    
    it('should detect when getItem returns incorrect content', async () => {
      // Set up the mock to return normal data
      fetchFilesSpy.mockImplementation(async () => mockData)
      
      // Create a storage instance
      const storage = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID,
        }),
      })
      
      // Verify normal behavior
      const item = await storage.getItem('1.md')
      expect(item).toBeTypeOf('string')
      expect(item).toContain('Test Post 1')
      
      // Introduce a temporary bug by changing the mock implementation
      fetchFilesSpy.mockImplementation(async () => buggyData)
      
      // Create a new storage instance to avoid cache
      const storage2 = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID + 1, // Use a different ID to avoid cache
        }),
      })
      
      // This should now return undefined since the key is different
      const itemAfterBug = await storage2.getItem('1.md')
      expect(itemAfterBug).toBeUndefined()
      
      // Fix the bug by restoring the original mock
      fetchFilesSpy.mockImplementation(async () => mockData)
      
      // Create a new storage instance
      const storage3 = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID + 2, // Use a different ID to avoid cache
        }),
      })
      
      // Verify it's fixed
      const itemAfterFix = await storage3.getItem('1.md')
      expect(itemAfterFix).toBeTypeOf('string')
      expect(itemAfterFix).toContain('Test Post 1')
    })
    
    it('should detect when getMeta returns incorrect metadata', async () => {
      // Set up the mock to return normal data
      fetchFilesSpy.mockImplementation(async () => mockData)
      
      // Create a storage instance
      const storage = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID,
        }),
      })
      
      // Verify normal behavior
      const meta = await storage.getMeta('1.md')
      expect(meta).toHaveProperty('title', 'Test Post 1')
      
      // Introduce a temporary bug by changing the mock implementation
      fetchFilesSpy.mockImplementation(async () => buggyData)
      
      // Create a new storage instance to avoid cache
      const storage2 = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID + 1, // Use a different ID to avoid cache
        }),
      })
      
      // This should now return an empty object since the key is different
      const metaAfterBug = await storage2.getMeta('1.md')
      expect(metaAfterBug).toEqual({})
      
      // Fix the bug by restoring the original mock
      fetchFilesSpy.mockImplementation(async () => mockData)
      
      // Create a new storage instance
      const storage3 = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID + 2, // Use a different ID to avoid cache
        }),
      })
      
      // Verify it's fixed
      const metaAfterFix = await storage3.getMeta('1.md')
      expect(metaAfterFix).toHaveProperty('title', 'Test Post 1')
    })
    
    it('should detect when getKeys returns incorrect keys', async () => {
      // Set up the mock to return normal data
      fetchFilesSpy.mockImplementation(async () => mockData)
      
      // Create a storage instance
      const storage = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID,
        }),
      })
      
      // Verify normal behavior
      const keys = await storage.getKeys()
      expect(keys).toContain('1.md')
      
      // Introduce a temporary bug by changing the mock implementation
      fetchFilesSpy.mockImplementation(async () => buggyData)
      
      // Create a new storage instance to avoid cache
      const storage2 = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID + 1, // Use a different ID to avoid cache
        }),
      })
      
      // This should now return different keys
      const keysAfterBug = await storage2.getKeys()
      expect(keysAfterBug).not.toContain('1.md')
      expect(keysAfterBug).toContain('wrong.md')
      
      // Fix the bug by restoring the original mock
      fetchFilesSpy.mockImplementation(async () => mockData)
      
      // Create a new storage instance
      const storage3 = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID + 2, // Use a different ID to avoid cache
        }),
      })
      
      // Verify it's fixed
      const keysAfterFix = await storage3.getKeys()
      expect(keysAfterFix).toContain('1.md')
    })
  })
})
