import { z } from "zod";
import { ofetch } from "ofetch";
import { CleanList, IGetListOptionsSchema, baseConfigSchema } from "./schema";

export type ICommonOptions = z.infer<typeof baseConfigSchema>;

export type IGetListOptions = z.infer<typeof IGetListOptionsSchema>;

export async function getList(
  opt: IGetListOptions & ICommonOptions
): Promise<string[]> {
  if (IGetListOptionsSchema.safeParse(opt).success) {
    const url = new URL(opt.baseUrl + "/api/v1/memos");
    url.searchParams.append("filter", `visibilities==['${opt.filter.join()}']`);
    url.searchParams.append("pageSize", opt.pageSize.toString());
    url.searchParams.append("pageToken", opt.pageToken);

    const res = await ofetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${opt.AccessToken}`,
      },
    }).catch((e) => {
      console.error(e);
      return [];
    });
    console.log(88, res.memos[0]);

    const cleanList = CleanList.safeParse(res);
    if (!cleanList.success) {
      console.error(cleanList.error.errors[0].message);
      return [];
    }

    // 这里返回的 [0] 是翻页索引，后续为索引 id
    const result = [] as string[];
    result.push(cleanList.data.nextPageToken);

    if (!opt.moreInfo) {
      cleanList.data.memos.forEach((i) =>
        result.push(i.name.split("/").pop()!)
      );
    } else {
      cleanList.data.memos.forEach((i) =>
        result.push(encodeURIComponent(JSON.stringify(i)))
      );
    }
    return result;
  } else {
    return [] as string[];
  }
}
export { baseConfigSchema };
