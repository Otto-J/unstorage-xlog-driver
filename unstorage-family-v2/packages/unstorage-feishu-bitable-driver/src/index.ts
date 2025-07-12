import { URLSearchParams } from 'node:url'
import z from 'zod'
import { getTenantAccessToken } from './src/core/index'

const querySchema: z.ZodType = z.object({
  token: z.string(),
  page_token: z.string().default(''),
  page_size: z.string().default('20'),
  app_token: z.string(),
  table_id: z.string(),
  view_id: z.string(),
})

async function getRecords(options: z.infer<typeof querySchema>) {
  const optionsValidate = querySchema.safeParse(options)
  if (!optionsValidate.success) {
    throw new Error((optionsValidate as any).error.message)
  }
  let option = optionsValidate.data
  // console.log('option',option)

  const queryString = new URLSearchParams({
    page_token: option.page_token,
    page_size: option.page_size,
  }).toString()

  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${options.app_token}/tables/${options.table_id}/records/search?${queryString}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${option.token}`,
    },
    body: JSON.stringify({
      view_id: option.view_id,
    }),
  })
  const data = (await res.json()) as any

  if (data.code !== 0) {
    throw new Error(data.msg)
  }

  return data.data
}

const API_BODY: z.ZodType = z.object({
  app_token: z.string(),
  table_id: z.string(),
  view_id: z.string(),
})

export default async function (ctx: any): Promise<{
  status: boolean;
  message: string;
  data: any;
}> {
  const query = ctx.query
  const validatedBody = API_BODY.safeParse(ctx.body)
  if (!validatedBody.success) {
    return {
      status: false,
      message: '参数错误',
      data: null,
    }
  }
  const { app_token, table_id, view_id } = validatedBody.data
  try {
    const APP_ID = 'cli_a770e6e47d39d013'
    const APP_SECRET = 'yrRhyy0GZs5bFvqkL8ogicuIdKcTG733'
    const token = await getTenantAccessToken(APP_ID, APP_SECRET)
    const records = await getRecords({
      token,
      app_token,
      table_id,
      view_id,
      page_size: query.page_size,
      page_token: query.page_token,
    })
    return {
      status: true,
      message: '获取成功',
      data: records,
    }
  }
  catch (error) {
    return {
      status: false,
      message: error.message,
      data: error,
    }
  }
}

// {"app_token":"Q4febCQd2aSfz1sdfAucTmKsngd","table_id":"tblVDCEYHvZBQCZn","view_id":"vewVxc8yxk" }
