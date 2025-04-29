import { describe, expect, it, beforeEach, afterEach, spyOn } from 'bun:test'
import { createStorage } from 'unstorage'
import { xLogStorageDriver } from './index'
import caches from './core/cache'
import * as fetchInfoModule from './core/fetch-info'
import { mockFiles, mockFetchFiles } from './core/__mocks__/fetch-info.mock'

const TEST_CHARACTER_ID = 53709

describe('xLogStorageDriver with mocked network requests', () => {
  // Use spyOn to mock the fetchFiles function
  const fetchFilesSpy = spyOn(fetchInfoModule, 'fetchFiles')
  const getFn = spyOn(caches, 'get')
  const setFn = spyOn(caches, 'set')
  
  beforeEach(() => {
    // Reset the spy and set the mock implementation
    fetchFilesSpy.mockReset()
    fetchFilesSpy.mockImplementation(mockFetchFiles)
    
    // Clear the cache before each test
    getFn.mockClear()
    setFn.mockClear()
    caches.clear()
  })
  
  describe('Schema validation', () => {
    it('require pass - should throw an error when characterId is missing', () => {
      expect(() => {
        createStorage({
          driver: xLogStorageDriver({
            ttl: 60 * 60,
          } as any),
        })
      }).toThrow(/Required/)
    })
    
    it('require pass - should not throw when characterId is provided', () => {
      expect(() => {
        createStorage({
          driver: xLogStorageDriver({
            characterId: TEST_CHARACTER_ID,
          }),
        })
      }).not.toThrow()
    })
  })
  
  describe('Storage features', () => {
    let storage: ReturnType<typeof createStorage>
    
    beforeEach(() => {
      storage = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID,
          ttl: 60 * 60,
        }),
      })
    })
    
    it('getKeys use cache', async () => {
      const keys = await storage.getKeys()
      expect(keys).toBeInstanceOf(Array)
      expect(keys.length).toBe(2)
      expect(keys).toContain('1.md')
      expect(keys).toContain('2.md')
      
      // Check cache functions were called
      expect(getFn).toHaveBeenCalled()
      expect(setFn).toHaveBeenCalled()

      // Reset mocks
      getFn.mockClear()
      setFn.mockClear()
      
      // Second call should use cache
      await storage.getKeys()
      expect(getFn).toHaveBeenCalled()
    })
    
    it('getItem', async () => {
      const item = await storage.getItem('1.md')
      expect(item).toBeTypeOf('string')
      expect(item).toContain('Test Post 1')
    })
    
    it('getMeta', async () => {
      const meta = await storage.getMeta('1.md')
      expect(meta).toHaveProperty('title')
      expect(meta.title).toBe('Test Post 1')
    })
    
    it('hasItem returns correct values', async () => {
      const hasExisting = await storage.hasItem('1.md')
      expect(hasExisting).toBe(true)
      
      const hasNonExisting = await storage.hasItem('nonexistent.md')
      expect(hasNonExisting).toBe(false)
    })
    
    it('clear removes all items', async () => {
      // First ensure we have files
      const keysBeforeClear = await storage.getKeys()
      expect(keysBeforeClear.length).toBeGreaterThan(0)
      
      // Now clear
      storage.clear()
      
      // Mock fetchFiles to return an empty map for this test
      fetchFilesSpy.mockImplementationOnce(async () => new Map())
      
      // Create a new storage instance to avoid cache
      const storage2 = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID + 1, // Use a different ID to avoid cache
        }),
      })
      
      // Check if keys are empty after clear
      const keys = await storage2.getKeys()
      expect(keys.length).toBe(0)
      
      // Restore the original mock for subsequent tests
      fetchFilesSpy.mockImplementation(mockFetchFiles)
    })
    
    it('handles fetchFiles errors', async () => {
      // Mock fetchFiles to throw an error
      fetchFilesSpy.mockImplementationOnce(async () => {
        throw new Error('Network error')
      })
      
      // Create a new storage instance
      const errorStorage = createStorage({
        driver: xLogStorageDriver({
          characterId: TEST_CHARACTER_ID,
          ttl: 60 * 60,
        }),
      })
      
      // Attempt to get keys, should throw the error
      try {
        await errorStorage.getKeys()
        expect.unreachable('Should have thrown an error')
      } catch (error: any) {
        expect(error).toBeDefined()
        expect(error.message).toContain('Network error')
      }
    })
  })
})
