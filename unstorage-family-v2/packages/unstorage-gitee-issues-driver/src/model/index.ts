import type { GiteeIssuesDriverOptions } from "..";
import markdownit from "markdown-it";
import { frontmatterPlugin } from "@mdit-vue/plugin-frontmatter";
import type { MarkdownItEnv } from "@mdit-vue/types";
import dayjs from "dayjs";

// format 才需要
// import tz from "dayjs/plugin/timezone";
// import utc from "dayjs/plugin/utc";
// dayjs.extend(tz);
// dayjs.extend(utc);

// dayjs.tz.setDefault("Asia/Shanghai");

const md = markdownit({
  html: true,
}).use(frontmatterPlugin, {
  grayMatterOptions: {
    excerpt: true,
    excerpt_separator: "<!-- more -->",
  },
});

export const fetchIssues = async (options: GiteeIssuesDriverOptions) => {
  const [_, owner, repo] = options.repo
    .split("https://gitee.com")[1]
    .split("/");

  const token = options.access_token;
  const creator = options.creator ?? owner;
  const page = 99;
  const label = options.labels ?? "post";
  const baseUrl = `https://gitee.com/api/v5/repos/${owner}/${repo}/issues`;
  const params = new URLSearchParams();
  params.append("access_token", token);
  params.append("state", "all");
  // label=post
  params.append("labels", label);
  // sort=created&direction=desc&page=1&per_page=99&creator=xiaoxfa'
  params.append("sort", "created");
  params.append("direction", "desc");
  params.append("page", "1");
  params.append("per_page", page.toString());
  params.append("creator", creator);

  return fetch(`${baseUrl}?${params.toString()}`)
    .then((res) => res.json())
    .then((list: any) => {
      // console.log(list, 2);
      return ((list ?? []) as any[])
        .map((issue) => {
          const rawBody = issue.body;
          const env: MarkdownItEnv = {};

          const html = md.render(rawBody, env);
          // console.log("---");
          // console.log(env.content?.slice(0, 100));
          // console.log(env.frontmatter);

          return {
            id: issue.number,
            title: env.frontmatter?.title ?? issue.title,
            labels:
              env.frontmatter?.tags ??
              (issue.labels as any[]).map((label) =>
                typeof label === "string" ? label : label.name
              ),
            // body: issue.body,
            body: encodeURIComponent(env?.content ?? issue.body),
            created_at: dayjs(env.frontmatter?.create_time ?? issue.created_at),
            updated_at: dayjs(env.frontmatter?.update_time ?? issue.updated_at),
            publish_time: dayjs(
              env.frontmatter?.publish_time ?? issue.created_at
            ),
            meta: env.frontmatter,
            bodyHtml: encodeURIComponent(html),
          };
        })
        .map((issue) => {
          return JSON.stringify(issue);
        });
    })
    .catch((err) => {
      console.error(err);
      return [];
    });
};
