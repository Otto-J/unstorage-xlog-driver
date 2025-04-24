#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import debug from "debug";
import { createStorage } from "unstorage";
import { xLogStorageDriver } from "@web.worker/unstorage-xlog-driver";
import { z } from "zod";

const log = debug("mcp:xlog");

// 创建MCP服务器
const server = new McpServer(
  {
    name: "Fetch Xlog.app",
    description: "读取 xlog.app 指定任务的博客",
    version: "1.0.0",
  },
  {
    capabilities: {
      prompts: {},
    },
  },
);

// 定义获取小宇宙排行榜工具
server.tool(
  "getXlogList",
  "获取 xlog 上的博客列表",
  {
    CHARACTER_ID: z.string(),
  },
  async ({ CHARACTER_ID }) => {
    const storage = createStorage({
      driver: xLogStorageDriver({
        characterId: Number(CHARACTER_ID),
      }),
    });
    const keys = await storage.getKeys();

    log("获取到的数据:", keys);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(keys, null, 2),
        },
      ],
    };
  },
);

// 连接服务器
const transport = new StdioServerTransport();
await server.connect(transport);
