import type { IGetKeysOptionsParsed, xLogFile, XLogStorageDriverOptions } from './types'
import { describe, expect, it, spyOn } from 'bun:test'
import * as fetchInfoModule from './core/fetch-info'

describe('fetchFiles', () => {
  it('should be mockable', async () => {
    // Create mock data
    const mockData = new Map<string, xLogFile>([
      ['test.md', {
        content: 'Test content',
        meta: {
          title: 'Test Title',
          slug: 'test-slug',
          tags: ['test'],
          uri: 'test-uri',
          create_time: '2023-01-01T00:00:00Z',
          update_time: '2023-01-02T00:00:00Z',
          publish_time: '2023-01-03T00:00:00Z',
          summary: 'Test summary',
          id_xlog: 1,
        },
      }],
    ])

    // Use spyOn to mock the fetchFiles function
    const fetchFilesSpy = spyOn(fetchInfoModule, 'fetchFiles')
    fetchFilesSpy.mockImplementation(async () => mockData)

    // Create test options
    const options: XLogStorageDriverOptions = {
      characterId: 12345,
      ttl: 60,
      ipfsGateway: 'https://ipfs.example.com/ipfs/',
    }

    const fetchOptions: IGetKeysOptionsParsed = {
      limit: 10,
      cursor: '',
      meta: false,
      content: false,
    }

    // Call the mocked function
    fetchFilesSpy.mockClear() // Clear previous calls
    const result = await fetchInfoModule.fetchFiles(options, fetchOptions)

    // Verify the result
    expect(result).toBe(mockData)
    expect(result.size).toBe(1)
    expect(result.has('test.md')).toBe(true)
    expect(fetchFilesSpy).toHaveBeenCalledTimes(1)
  })
})
