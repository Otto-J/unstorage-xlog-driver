import { defineDriver, type Driver } from 'unstorage'

export interface DemoDriverOptions {
  name?: string
  ttl?: number
}

export const demoDriver: (options?: DemoDriverOptions) => Driver = defineDriver((options: DemoDriverOptions = {}) => {
  const cache = new Map<string, any>()
  const { name = 'demo-driver', ttl = 60 } = options

  return {
    name,
    options,
    async hasItem(key: string): Promise<boolean> {
      return cache.has(key)
    },
    async getItem(key: string): Promise<any> {
      return cache.get(key) || null
    },
    async setItem(key: string, value: any): Promise<void> {
      cache.set(key, value)
      
      // Simple TTL implementation
      if (ttl > 0) {
        setTimeout(() => {
          cache.delete(key)
        }, ttl * 1000)
      }
    },
    async removeItem(key: string): Promise<void> {
      cache.delete(key)
    },
    async getKeys(): Promise<string[]> {
      return Array.from(cache.keys())
    },
    async clear(): Promise<void> {
      cache.clear()
    },
    async dispose(): Promise<void> {
      cache.clear()
    }
  }
})

export default demoDriver