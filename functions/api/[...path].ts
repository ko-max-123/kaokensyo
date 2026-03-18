export interface Env {
  /**
   * 転送先の Worker オリジン（末尾スラッシュなし）
   * 例: https://face-habit-viewer-api.mini-mountain1990.workers.dev
   */
  WORKER_API_ORIGIN?: string
}

function withCors(resp: Response, origin: string | null): Response {
  const h = new Headers(resp.headers)
  if (origin) h.set('Access-Control-Allow-Origin', origin)
  h.set('Vary', 'Origin')
  h.set('Access-Control-Allow-Credentials', 'true')
  h.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  h.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers: h })
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const req = ctx.request
  const origin = req.headers.get('Origin')

  if (req.method === 'OPTIONS') {
    return withCors(new Response(null, { status: 204 }), origin)
  }

  const workerOrigin = ctx.env.WORKER_API_ORIGIN
  if (!workerOrigin) {
    return new Response(
      'WORKER_API_ORIGIN is not set. Set it in Cloudflare Pages environment variables.',
      { status: 500 }
    )
  }

  const url = new URL(req.url)
  // /api/* を Worker 側の /api/* にそのまま転送
  const target = new URL(url.pathname + url.search, workerOrigin)

  const upstream = await fetch(target.toString(), {
    method: req.method,
    headers: req.headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
    redirect: 'manual',
  })

  return withCors(upstream, origin)
}

