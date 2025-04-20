import { createStorage, defineDriver } from "unstorage";
import { Octokit } from "octokit";

export const myStorageDriver = defineDriver(
  (opt: {
    owner: string;
    repo: string;
    auth: string;
    timeoutSeconds?: number;
  }) => {
    const octokit = new Octokit({
      auth: opt.auth,
    });

    const defaultOpt = {
      timeoutSeconds: 60 * 60,
    };

    const options = {
      ...defaultOpt,
      ...opt,
    };

    // 这是要实现缓存
    let files = {};
    let lastCheck = 0;
    let isHandling = false;
    // 这里缓存数据，多次读取不会重复请求
    const loadData = async (cb: Function) => {
      if (lastCheck + options.timeoutSeconds * 1000 > Date.now()) {
        return;
      }
      if (isHandling) {
        return;
      }
      isHandling = true;
      files = await cb(options);
      lastCheck = Date.now();
      isHandling = false;
    };

    async function getIssues(owner: string, repo: string) {
      const issues = await octokit.request("GET /repos/{owner}/{repo}/issues", {
        owner: owner,
        repo: repo,
        labels: "publish",
        creator: owner,
      });

      return issues.data;
    }

    async function getIssueDetails(
      owner: string,
      repo: string,
      issueNumber: number
    ) {
      const issue = await octokit.request(
        "GET /repos/{owner}/{repo}/issues/{issue_number}",
        {
          owner: owner,
          repo: repo,
          issue_number: issueNumber,
        }
      );

      return issue.data;
    }
    return {
      name: "my-custom-driver",
      options,
      async hasItem(key: string, _opts) {
        const issueList = await getIssues(options.owner, options.repo);
        console.log(issueList);
        return !!issueList.find((issue) => String(issue.number) === key);
      },
      async getItem(key: string, _opts) {
        const detail = await getIssueDetails(
          options.owner,
          options.repo,
          Number(key)
        );
        return {
          id: detail.id,
          title: detail.title,
          labels: detail.labels.map((label) =>
            typeof label === "string" ? label : label.name
          ),
          body: detail.body,
          created_at: detail.created_at,
          updated_at: detail.updated_at,
        };
      },
      async getItems(keys: string[], _opts) {
        const isAllMode = keys.length === 1 && keys[0] === "ALL";
        if (isAllMode) {
          const issueList = await getIssues(options.owner, options.repo);
          return issueList.map((issue) => ({
            id: issue.id,
            title: issue.title,
            labels: issue.labels.map((label) =>
              typeof label === "string" ? label : label.name
            ),
            body: issue.body,
            created_at: issue.created_at,
            updated_at: issue.updated_at,
          }));
        } else {
          throw new Error("Not implemented");
        }
      },
      async getItemRaw(key: string, _opts) {
        const detail = await getIssueDetails(
          options.owner,
          options.repo,
          Number(key)
        );
        return {
          ...detail,
        };
      },
      async setItem(key, value, _opts) {},
      async removeItem(key, _opts) {},
      async getKeys(base, _opts) {
        const issueList = await getIssues(options.owner, options.repo);
        console.log(issueList);
        const res = issueList.map((issue) => String(issue.number));
        return res;
      },

      async clear(base, _opts) {},
      async dispose() {},
      // async watch(callback) {},
    };
  }
);
