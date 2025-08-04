const demoRes = [
  {
    id: 1,
    url: "https://git.ijust.cc/api/v1/repos/ji3206/ob_uniapp/issues/1",
    html_url: "https://git.ijust.cc/ji3206/ob_uniapp/issues/1",
    number: 1,
    user: {
      id: 1,
      login: "ji3206",
      login_name: "",
      source_id: 0,
      full_name: "",
      email: "fa@ijust.cc",
      avatar_url:
        "https://git.ijust.cc/avatars/45b8f9771900f7c8b32efd0767069c69",
      html_url: "https://git.ijust.cc/ji3206",
      language: "zh-CN",
      is_admin: true,
      last_login: "2025-07-30T22:02:35+08:00",
      created: "2025-07-25T10:50:16+08:00",
      restricted: false,
      active: true,
      prohibit_login: false,
      location: "",
      website: "",
      description: "",
      visibility: "public",
      followers_count: 0,
      following_count: 0,
      starred_repos_count: 0,
      username: "ji3206",
    },
    original_author: "",
    original_author_id: 0,
    title: "demo",
    body: "demo1",
    ref: "",
    assets: [],
    labels: [],
    milestone: null,
    assignee: null,
    assignees: null,
    state: "open",
    is_locked: false,
    comments: 0,
    created_at: "2025-08-04T10:30:04+08:00",
    updated_at: "2025-08-04T10:30:04+08:00",
    closed_at: null,
    due_date: null,
    pull_request: null,
    repository: {
      id: 1,
      name: "ob_uniapp",
      owner: "ji3206",
      full_name: "ji3206/ob_uniapp",
    },
    pin_order: 0,
  },
];

export async function getRecords(): Promise<any> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not set");
  }
  // 如果没有 / 结尾，追加一个 /
  const baseURL = `https://git.ijust.cc/`;
  const owner = "ji3206";
  const repo = "ob_uniapp";
  const path = "issues";

  const response = await fetch(
    `${baseURL}/api/v1/repos/${owner}/${repo}/${path}?token=${apiKey}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    },
  );
  const data = await response.json();
  console.log(data);
}
