import type { xLogFile, XLogStorageDriverOptions, IGetKeysOptionsParsed } from '../../types'

// Mock data for testing
export const mockFiles = new Map<string, xLogFile>([
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

// Mock implementation of fetchFiles
export async function mockFetchFiles(
  options: XLogStorageDriverOptions,
  fetchOptions: IGetKeysOptionsParsed
): Promise<Map<string, xLogFile>> {
  return mockFiles
}

// Export the IPFS_GATEWAY constant to match the original module
export const IPFS_GATEWAY = 'https://ipfs.4everland.xyz/ipfs/'
