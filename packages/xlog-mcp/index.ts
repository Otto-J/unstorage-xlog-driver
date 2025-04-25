#!/usr/bin/env node

import type { IGetKeysOptions, xLogFile } from '@web.worker/unstorage-xlog-driver/types'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { xLogStorageDriver } from '@web.worker/unstorage-xlog-driver'
import debug from 'debug'
import { createStorage } from 'unstorage'
import { z } from 'zod'
import { fetchXlogList } from './src/core'

const log = debug('mcp:xlog')

// 创建MCP服务器
const server = new McpServer(
  {
    name: 'Fetch Xlog.app',
    description: '读取 xlog.app 指定任务的博客',
    version: '1.0.0',
  },
  {
    capabilities: {
      prompts: {},
    },
  },
)

server.tool(
  'getXlogList',
  '获取 xlog 上的博客列表',
  {
    CHARACTER_ID: z.string().default('53709').describe('xlog 用户 id，纯数字'),
    limit: z.number().default(10).describe('获取的博客数量，默认 10'),
    cursor: z.string().default('').describe('游标，用于分页，默认空字符串，格式为 {CHARACTER_ID}_{nodeId}'),
    meta: z.boolean().default(false).describe('是否获取博客的元数据，默认 false'),
    content: z.boolean().default(false).describe('是否获取博客的内容，默认 false'),
  },
  async (options) => {
    const res = await fetchXlogList(options)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(res),
        },
      ],
    }
  },
)

// 连接服务器
const transport = new StdioServerTransport()
await server.connect(transport)
