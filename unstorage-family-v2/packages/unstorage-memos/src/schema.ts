import { z } from "zod";

export const baseConfigSchema: z.ZodType = z.object({
  baseUrl: z
    .string({
      required_error: "baseUrl is required",
      message: "baseUrl must be start with http",
    })
    .startsWith("http")
    .transform((url) => {
      return url.endsWith("/") ? url.slice(0, -1) : url;
    }),

  AccessToken: z.string({
    required_error: "AccessToken is required",
    message: "AccessToken must be a string",
  }),
});

export const IGetListOptionsSchema: z.ZodType = z.object({
  pageSize: z.number().optional().default(10),
  pageToken: z.string().optional().default(""),
  filter: z.string().array().optional(),
  moreInfo: z.boolean().optional().default(false),
});

export const IListResSchema: z.ZodType = z.object({
  id: z.string(),
  uid: z.string(),
  createTime: z.string(),
  updateTime: z.string(),
  displayTime: z.string(),
  content: z.string(),
  visibility: z.array(z.string()),
  tags: z.array(z.string()),
  desc: z.string(),
});

export const CleanList: z.ZodType = z.object({
  nextPageToken: z.string(),
  memos: z.array(
    z.object({
      name: z.string(),
      state: z.string(),
      createTime: z.string(),
      updateTime: z.string(),
      displayTime: z.string(),
      content: z.string(),
      tags: z.array(z.string()),
      snippet: z.string(),
    }),
  ),
});
