# @web.worker/unstorage-gitee-issues-drivers

## install

```shell
npm i unstorage @web.worker/unstorage-gitee-issues-drivers
```

## useage

```js
import { createStorage } from "unstorage";
import { giteeIssuesDriver } from "@web.worker/unstorage-gitee-issues-drivers";

const storage = createStorage({
  driver: giteeIssuesDriver({
    repo: "https://gitee.com/xiaoxfa/blog-issues-template",
    access_token: process.env.GITEE_TOKEN!,
    labels: "post", // optional
    creator: "xiaoxfa", // optional
    ttl: 60, // 60 seconds cache
  }),
});

const keys = await storage.getKeys();
console.log("get keys", keys);
// you need use JSON.parse
```
