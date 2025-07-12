import { createStorage } from "unstorage";
import { giteeIssuesDriver } from "@web.worker/unstorage-gitee-issues-drivers/parse";
// import { giteeIssuesDriver } from "../index-parse-content";
// @web.worker/unstorage-gitee-issues-drivers

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

const list = con
  .map((post) => {
    const { body, bodyHtml, ...other } = post;
    return other;
  })
  .sort((a, b) => b.update_at - a.update_at);
// .sort((a, b) => b.created_at - a.created_at);
const list2 = list.map((post) => ({
  title: post.title,
  created_at: new Date(post.created_at).toLocaleString(),
  updated_at: new Date(post.updated_at).toLocaleString(),
}));
console.log(list2);
