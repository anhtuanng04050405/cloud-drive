import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { isSafeId } from '@/lib/safe'

export const runtime = 'nodejs'

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id
  if (!isSafeId(id)) return new NextResponse('Bad request', { status: 400 })
  const { blobs } = await list({ prefix: 'manifests/' + id })
  if (!blobs.length) return new NextResponse('Not found', { status: 404 })
  const manifest = await (await fetch(blobs[0].url, { cache: 'no-store' })).json()

  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of manifest.chunks) {
        const res = await fetch(chunk.url, { cache: 'no-store' })
        const buf = new Uint8Array(await res.arrayBuffer())
        controller.enqueue(buf)
      }
      controller.close()
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': manifest.mime || 'application/octet-stream',
      'Content-Disposition': "attachment; filename*=UTF-8''" + encodeURIComponent(manifest.name),
      'Content-Length': String(manifest.size),
    },
  })
}