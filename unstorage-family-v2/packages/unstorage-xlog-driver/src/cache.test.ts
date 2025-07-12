import { afterEach, describe, expect, it } from 'bun:test'
import caches from './core/cache'

describe('Cache module', () => {
  afterEach(() => {
    caches.clear()
  })

  it('should store and retrieve values', () => {
    const testKey = 'test-key'
    const testValue = { data: 'test-value' }

    caches.set(testKey, testValue)
    const retrieved = caches.get(testKey)

    expect(retrieved).toEqual(testValue)
  })

  it('should return undefined for non-existent keys', () => {
    const nonExistentKey = 'non-existent-key'
    const retrieved = caches.get(nonExistentKey)

    expect(retrieved).toBeUndefined()
  })

  it('should correctly report cache size', () => {
    expect(caches.size()).toBe(0)

    caches.set('key1', 'value1')
    expect(caches.size()).toBe(1)

    caches.set('key2', 'value2')
    expect(caches.size()).toBe(2)
  })

  it('should remove specific keys', () => {
    caches.set('key1', 'value1')
    caches.set('key2', 'value2')

    caches.remove('key1')

    expect(caches.get('key1')).toBeUndefined()
    expect(caches.get('key2')).not.toBeUndefined()
    expect(caches.size()).toBe(1)
  })

  it('should clear all keys', () => {
    caches.set('key1', 'value1')
    caches.set('key2', 'value2')

    caches.clear()

    expect(caches.size()).toBe(0)
    expect(caches.get('key1')).toBeUndefined()
    expect(caches.get('key2')).toBeUndefined()
  })

  it('should iterate through keys', () => {
    caches.set('key1', 'value1')
    caches.set('key2', 'value2')

    const keys = Array.from(caches.keys())

    expect(keys).toContain('key1')
    expect(keys).toContain('key2')
    expect(keys.length).toBe(2)
  })

  it('should verify bugs in cache clear', () => {
    caches.set('key1', 'value1')

    caches.clear()

    expect(caches.size()).toBe(0)
  })
})
