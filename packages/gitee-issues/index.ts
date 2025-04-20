import { defineDriver } from "unstorage";
import { fetchIssues } from "./model";

export interface GiteeIssuesDriverOptions {
  repo: string;
  access_token: string;
  labels?: string;
  creator?: string;
  ttl?: number;
}

export const giteeIssuesDriver = defineDriver(
  (options: GiteeIssuesDriverOptions) => {
    // options 判断
    // 1. 是否有 access_token
    if (!options.access_token) {
      throw new Error("access_token is required");
    }
    // 2. 是否有 repo
    if (!options.repo) {
      throw new Error("repo is required");
    }
    if (!options.repo.startsWith("https://gitee.com")) {
      throw new Error("repo should start with https://gitee.com");
    }

    // 引入 cache layer

    let cache: string[] = [];
    // ttl
    const ttl = (options.ttl || 60) * 1000;
    const expire = Date.now() + ttl;

    return {
      name: "gitee-issues-driver",
      options,
      async hasItem(key, _opts) {
        throw new Error("Method not implemented.");
        // return true;
      },
      async getItem(key, _opts) {
        throw new Error("Method not implemented.");

        // return null;
      },
      async setItem(key, value, _opts) {
        throw new Error("Method not implemented.");
      },
      async removeItem(key, _opts) {
        throw new Error("Method not implemented.");
      },
      async getKeys(base, _opts) {
        if (Date.now() > expire || cache.length === 0) {
          // 过期
          const data = await fetchIssues(options);
          // console.log("fetch data");
          // console.log(JSON.stringify(data, null, 2));

          cache = data;
          return data;
        } else {
          console.log("hit cache");
          return cache;
        }
      },
      async clear(base, _opts) {
        throw new Error("Method not implemented.");
      },
      // async dispose() {},
      // async watch(callback) {},
    };
  }
);

export const giteeIssuesFormatterDriver = defineDriver(
  (options: GiteeIssuesDriverOptions) => {
    // options 判断
    // 1. 是否有 access_token
    if (!options.access_token) {
      throw new Error("access_token is required");
    }
    // 2. 是否有 repo
    if (!options.repo) {
      throw new Error("repo is required");
    }
    if (!options.repo.startsWith("https://gitee.com")) {
      throw new Error("repo should start with https://gitee.com");
    }

    // 引入 cache layer

    let cache: string[] = [];
    // ttl
    const ttl = (options.ttl || 60) * 1000;
    const expire = Date.now() + ttl;

    return {
      name: "gitee-issues-driver",
      options,
      async hasItem(key, _opts) {
        throw new Error("Method not implemented.");
        // return true;
      },
      async getItem(key, _opts) {
        throw new Error("Method not implemented.");

        // return null;
      },
      async setItem(key, value, _opts) {
        throw new Error("Method not implemented.");
      },
      async removeItem(key, _opts) {
        throw new Error("Method not implemented.");
      },
      async getKeys(base, _opts) {
        if (Date.now() > expire || cache.length === 0) {
          // 过期
          const data = await fetchIssues(options);
          // console.log("fetch data");
          // console.log(JSON.stringify(data, null, 2));

          cache = data;
          return data;
        } else {
          console.log("hit cache");
          return cache;
        }
      },
      async clear(base, _opts) {
        throw new Error("Method not implemented.");
      },
      // async dispose() {},
      // async watch(callback) {},
    };
  }
);
