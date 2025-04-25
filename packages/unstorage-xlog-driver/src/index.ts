import type { StorageMeta } from 'unstorage'
import type {
  ICache,
  IGetKeysOptions,
  IGetKeysOptionsParsed,
  xLogFile,
  XLogStorageDriverOptions,
} from './types'
import fs from 'node:fs'
import pino from 'pino'
import { defineDriver } from 'unstorage'
import caches from './core/cache'
import { fetchFiles } from './core/fetch-info'
import { getKeysOptionsSchema, XLogStorageDriverOptionsSchema } from './schema'

// 创建一个写入流，将日志输出到 dist/log.txt 文件
const logFilePath = './logs/log.txt'
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs') // 确保 dist 目录存在
}
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' })

const logger = pino(
  {
    name: 'xlog-driver',
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  },
  logStream,
)

export const DRIVER_NAME = 'xLog-driver'

let files: Map<string, xLogFile>

export const xLogStorageDriver = defineDriver(
  (opt: XLogStorageDriverOptions) => {
    logger.debug({ opt }, 'user raw options')
    const _options = XLogStorageDriverOptionsSchema.safeParse(opt)
    logger.debug({ _options }, 'user safeParse result')
    if (!_options.success) {
      logger.error({ error: _options.error }, 'user options parse error')
      throw new Error(_options.error.message)
    }
    const options = _options.data as Required<XLogStorageDriverOptions>
    logger.debug({ options }, 'user format options')

    const syncFiles = async (_fetchOptions: IGetKeysOptions = {}) => {
      logger.debug('syncFiles start')
      const now = +Date.now()

      const fetchOptions: IGetKeysOptionsParsed
        = getKeysOptionsSchema.parse(_fetchOptions)

      const expired = caches.get<ICache>(options.characterId.toString())
      // 判断 limit/cursor 是否发生变化，如果发生变化，销毁 cache 然后存储，如果无变化判断 expire
      const hasChanged
        = expired?.limit !== fetchOptions.limit
          && expired?.cursor !== fetchOptions.cursor

      if (hasChanged) {
        logger.debug('limit or cursor changed, will fetchFiles')
        files = await fetchFiles(options, fetchOptions)
        logger.debug({ files }, 'syncFiles files')
        caches.set<ICache>(options.characterId.toString(), {
          expired: now + options.ttl * 1000,
          limit: fetchOptions.limit,
          cursor: fetchOptions.cursor ?? '',
        })
      }
      else {
        logger.debug('query no changed, will not fetchFiles')
        logger.debug({ expired }, 'caches get result')

        // 如果缓存不存在或已过期，则重新请求
        if (!expired?.expired || Number(expired.expired) < now) {
          logger.debug('expired, will fetchFiles')
          files = await fetchFiles(options, fetchOptions)
          logger.debug({ files }, 'syncFiles files')

          // 这里存储过期时间、limit/cursor
          caches.set(options.characterId.toString(), {
            expired: now + options.ttl * 1000,
            limit: fetchOptions.limit,
            cursor: fetchOptions.cursor,
          })
          logger.debug('syncFiles done')
        }
        else {
          logger.debug('no expired, will not fetchFiles')
        }
      }
    }

    return {
      name: DRIVER_NAME,
      options,
      async hasItem(key: string) {
        logger.debug('hasItem', key)
        await syncFiles({})
        return files.has(key)
      },
      async getItem(key: string) {
        logger.debug('getItem', key)
        await syncFiles({})

        return files.get(key)?.content
      },
      async getKeys(_, _options: any) {
        logger.debug('start getKeys function')
        const options = getKeysOptionsSchema.safeParse(_options)
        if (!options.success) {
          logger.error({ error: options.error }, 'user options parse error')
          throw new Error(options.error.message)
        }
        await syncFiles(options.data)

        const res: string[] = []

        if (options.data.meta || options.data.content) {
          const obj: any = {}
          for (const [key, value] of files.entries()) {
            obj.id = key
            obj.meta = options.data.meta ? value.meta : undefined
            obj.content = options.data.content ? value.content : undefined
            res.push(encodeURIComponent(JSON.stringify(obj)))
          }
          return res
        }

        return [...files.keys()]
      },
      // 获取头文件
      async getMeta(key: string) {
        logger.debug('getMeta', key)
        await syncFiles()
        return files.get(key)?.meta as StorageMeta
      },
      clear() {
        logger.debug('clear')
        files.clear()
      },
      dispose() {
        logger.debug('dispose')
        files.clear()
      },
    }
  },
)
export default xLogStorageDriver
