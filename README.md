# web.worker-unstorage-drivers

这是一个 [unstorage](https://github.com/unjs/unstorage) 拓展库集合。

## unstorage 是什么？

[unstorage]((<https://github.com/unjs/unstorage>)) 是一个开发协议。它整合了操作数据、存储，非常容易开发和集成。

对于用户来说，屏蔽了底层细节，更容易使用和接入，也非常适合适配 MCP 协议。

## 这个仓库有什么？

- [unstorage-xlog-driver](./packages/unstorage-xlog-driver/README.md) 操作网站 xlog.app 的数据。
- [@web.worker/unstorage-memos](./packages/@web.worker/unstorage-memos) 操作 memos 服务的数据。
- [@web.worker/unstorage-gitee-issues-drivers](./packages/@web.worker/unstorage-gitee-issues-drivers) 操作 gitee 网站 issues 的数据。
- unstorage-gitee-issues-driver 操作 github issues 的数据。
- unstorage-bitable-feishu-driver。操作飞书多维表格的数据。
