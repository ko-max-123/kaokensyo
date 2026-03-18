export interface Env {
  WORKER_API_ORIGIN?: string
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const workerOrigin = ctx.env.WORKER_API_ORIGIN
  if (!workerOrigin) {
    return new Response(
      'WORKER_API_ORIGIN is not set. Set it in Cloudflare Pages environment variables.',
      { status: 500 }
    )
  }
  // /api に来たら Worker の /api に転送（Worker側は 404 が正常）
  const target = new URL('/api', workerOrigin)
  return fetch(target.toString(), ctx.request)
}

