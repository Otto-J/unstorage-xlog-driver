import z from 'zod'
import memcache from './cache'

const baseResSchema = z.object({
  code: z.number(),
  msg: z.string(),
})

const authCodeSchema = z.object({
  tenant_access_token: z.string(),
  expire: z.number(),
})

const URL_AUTH
  = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal'

export async function getTenantAccessToken(APP_ID: string, APP_SECRET: string) {
  const tokenCache: {
    token: string
    expireTime: number
  } | null = memcache.get(`token_${APP_ID}`) ?? null

  if (tokenCache && tokenCache.expireTime > Date.now()) {
    return tokenCache.token
  }
  const res = await fetch(URL_AUTH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      app_id: APP_ID,
      app_secret: APP_SECRET,
    }),
  })
  const data = await res.json()

  const schema = baseResSchema.merge(authCodeSchema)
  const parsedData = schema.safeParse(data)
  if (!parsedData.success) {
    throw new Error((parsedData as any).error.message)
  }

  if (parsedData.data.code !== 0) {
    throw new Error(parsedData.data.msg)
  }

  const now = Date.now()
  const expireTime = now + parsedData.data.expire * 1000
  const tokenData = {
    token: parsedData.data.tenant_access_token,
    expireTime,
  }

  // 缓存 token 数据
  memcache.set(`token_${APP_ID}`, tokenData)

  return tokenData.token
}
