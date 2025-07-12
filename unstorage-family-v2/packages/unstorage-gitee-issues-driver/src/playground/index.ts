import { createStorage } from "unstorage";
import { giteeIssuesDriver } from "..";

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
const con = keys.map((key) => JSON.parse(key));
console.log(
  "get keys",
  con.map((post) => {
    const { body, ...other } = post;
    return other;
  })
);
