import { ofetch } from "ofetch";
import { z } from "zod";

const baseURL = "https://notes.ijust.cc";

const headers = {
  "Content-Type": "application/json",
  Authorization: "Bearer " + process.env.token,
};

// const listResType = z.object({
//   nextPageToken: z.string(),
//   memos: z.array(
//     z.object({
//       name: z.string(),
//       uid: z.string(),
//       createTime: z.string(),
//       updateTime: z.string(),
//       displayTime: z.string(),
//       content: z.string(),
//       tags: z.array(z.string()),
//       snippet: z.string(),
//     })
//   ),
// });

// https://notes.ijust.cc/api/v1/memos?filter=visibilities==['public']
const fetchNotes = async () => {
  const url = new URL(baseURL + "/api/v1/memos");
  // ['public', 'private']
  url.searchParams.append("filter", "visibility in ['PUBLIC']");
  // url.searchParams.append("filter", 'visibility == "PUBLIC"');
  url.searchParams.append("pageSize", "10");
  // url.searchParams.append("pageToken", "CAoQCg==");
  const notes = await ofetch(url.toString(), {
    method: "GET",
    headers,
  });
  // const simplateRes = listResType.parse(notes);
  console.log(notes.memos.length);
  // console.log(notes.memos[0]);
  // console.log(simplateRes);
};

// fetchNotes();

const postNotes = async () => {
  ofetch(baseURL + "/api/v1/memos", {
    method: "POST",
    headers,
    body: JSON.stringify({
      content: `## hello2
> hi

nice to [baidu](https://baidu.com)
`,
      visibility: "PUBLIC", // PRIVATE
      resources: [],
      relations: [],
    }),
  });
};
// postNotes();

const updateInfoSchema = z.object({
  // uid: z.string(),
  // rowStatus: z.string(),
  // creator: z.string(),
  content: z.string(),
  // visibility: z
  // .enum(["PUBLIC", "PRIVATE", "VISIBILITY_UNSPECIFIED", "PROTECTED"])
  // .default("VISIBILITY_UNSPECIFIED"),
  // tags: z.array(z.string()),
  // pinned: z.boolean(),
  // resources: z.array(z.any()),
  // relations: z.array(z.any()),
  // snippet: z.string(),
});

const updateNote = async () => {
  const res = await fetch(baseURL + "/api/v1/memos/144", {
    headers,
  }).then((res) => res.json());

  const info = updateInfoSchema.parse(res);
  // console.log(info);
  info.content = info.content + "\n\n---\n\n" + "## end";
  const id = res.name.split("/").pop();

  fetch(baseURL + "/api/v1/memos/" + id, {
    body: JSON.stringify(info),
    method: "patch",
    headers,
  }).then((res) => {
    console.log(4, res.json());
  });
};

// updateNote();

const deleteNote = () => {
  const id = "146";
  const url = new URL(baseURL + "/api/v1/memos/" + id);

  fetch(url.toString(), {
    headers,
    method: "DELETE",
  }).then((res) => {
    console.log(res.json());
  });
};
// deleteNote();
