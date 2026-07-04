import { list, del } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { isSafeId } from '@/lib/safe'

export const runtime = 'nodejs'

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id
  if (!isSafeId(id)) return new NextResponse('Bad request', { status: 400 })
  const chunkList = await list({ prefix: 'chunks/' + id + '/' })
  if (chunkList.blobs.length) await del(chunkList.blobs.map((b) => b.url))
  const manifestList = await list({ prefix: 'manifests/' + id })
  if (manifestList.blobs.length) await del(manifestList.blobs.map((b) => b.url))
  return NextResponse.json({ ok: true })
}