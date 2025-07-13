# unstorage-memos

这是一个基于 [Memos](https://github.com/usememos/memos/) [openAPI](https://memos.apidocumentation.com/reference) 实现的 [`unstorage`](https://unstorage.unjs.io/) [适配器 Driver](https://unstorage.unjs.io/guide/custom-driver)。

## 前置准备

1. 【baseUrl】已经自托管了 memos 的服务，可以通过 url 访问
2. 【AccessToken】进入 设置 - 我的账号 -Access Token，找到 token

## 使用方法

注意：我不认同 getKeys 值返回 string[] 的限制，所以我补充了 `moreInfo:true` 选项，返回原始列表结果，更符合直觉。

需要按照下面方式 `JSON.parse(decodeURIComponent(i))` 具体看下面 Demo

```ts
const storage = createStorage({
  driver: MemosStorageDriver({
    baseUrl: "https://notes.ijust.cc",
    AccessToken: process.env.token as string,
  }),
});

const res1 = await storage.getKeys("", {
  pageSize: 5,
  filter: ["PUBLIC", "PRIVATE"],
  // pageToken: "CAUQCg==", // 翻页索引
  pageToken: "",
  moreInfo: true,
} as IGetListOptions);
const [nextPageToken, ...list] = res1;
console.log(nextPageToken);

const list2 = list.map((i) => JSON.parse(decodeURIComponent(i)));
console.log(list2);
```

## 当前进度

- [x] 基本结构
- [x] getKeys
- [] getItem - 获取详情
- [] setItem - 包含创建、更新
- [] hasItem - 是否存在
- [] removeItem - 删除
