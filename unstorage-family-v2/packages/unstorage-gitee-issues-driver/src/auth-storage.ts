import { resolve } from 'path';
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';

// 定义存储用户认证信息的接口
export interface AuthStorage {
  getToken(serviceName: string): string | null;
  setToken(serviceName: string, token: string): void;
  removeToken(serviceName: string): void;
}

// 文件系统实现的认证存储
export class FileAuthStorage implements AuthStorage {
  private configPath: string;
  private tokens: Record<string, string>;

  constructor(configPath?: string) {
    // 如果未提供配置路径，则使用默认路径
    this.configPath = configPath || resolve(homedir(), '.context7', 'auth.json');
    this.tokens = {};
    this.loadTokens();
  }

  private loadTokens() {
    try {
      // 确保目录存在
      const dir = this.configPath.substring(0, this.configPath.lastIndexOf('/'));
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      // 读取现有的tokens
      if (existsSync(this.configPath)) {
        const data = readFileSync(this.configPath, 'utf-8');
        this.tokens = JSON.parse(data);
      } else {
        // 如果文件不存在，创建一个空的配置文件
        writeFileSync(this.configPath, JSON.stringify({}), 'utf-8');
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  }

  private saveTokens() {
    try {
      writeFileSync(this.configPath, JSON.stringify(this.tokens, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  }

  getToken(serviceName: string): string | null {
    return this.tokens[serviceName] || null;
  }

  setToken(serviceName: string, token: string): void {
    this.tokens[serviceName] = token;
    this.saveTokens();
  }

  removeToken(serviceName: string): void {
    delete this.tokens[serviceName];
    this.saveTokens();
  }
}

// 内存实现的认证存储，仅用于临时使用或测试
export class MemoryAuthStorage implements AuthStorage {
  private tokens: Record<string, string> = {};

  getToken(serviceName: string): string | null {
    return this.tokens[serviceName] || null;
  }

  setToken(serviceName: string, token: string): void {
    this.tokens[serviceName] = token;
  }

  removeToken(serviceName: string): void {
    delete this.tokens[serviceName];
  }
}

// 环境变量实现的认证存储
export class EnvAuthStorage implements AuthStorage {
  private prefix: string;

  constructor(prefix = 'CONTEXT7_TOKEN_') {
    this.prefix = prefix;
  }

  getToken(serviceName: string): string | null {
    const envKey = `${this.prefix}${serviceName.toUpperCase()}`;
    return process.env[envKey] || null;
  }

  setToken(serviceName: string, token: string): void {
    const envKey = `${this.prefix}${serviceName.toUpperCase()}`;
    process.env[envKey] = token;
  }

  removeToken(serviceName: string): void {
    const envKey = `${this.prefix}${serviceName.toUpperCase()}`;
    delete process.env[envKey];
  }
}

// 创建默认的认证存储实例
export function createAuthStorage(type: 'file' | 'memory' | 'env' = 'file', options?: { configPath?: string; prefix?: string }): AuthStorage {
  switch (type) {
    case 'file':
      return new FileAuthStorage(options?.configPath);
    case 'memory':
      return new MemoryAuthStorage();
    case 'env':
      return new EnvAuthStorage(options?.prefix);
    default:
      return new FileAuthStorage(options?.configPath);
  }
}