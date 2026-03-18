export interface Env {}

export default {
  async fetch(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/api/health') {
      return Response.json({ status: 'ok', service: 'face-habit-viewer-api' })
    }
    if (url.pathname === '/api/version') {
      return Response.json({ version: '0.1.0' })
    }
    return new Response('Not Found', { status: 404 })
  },
}
