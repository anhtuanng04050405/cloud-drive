import { list, put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { isSafeId } from '@/lib/safe'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const data = await req.json()
  const fileId = data.fileId
  if (!isSafeId(fileId)) {
    return NextResponse.json({ error: 'fileId khong hop le' }, { status: 400 })
  }
  const { blobs } = await list({ prefix: 'chunks/' + fileId + '/' })
  const chunks = blobs
    .map((b) => ({ index: Number(b.pathname.split('/').pop()), url: b.url }))
    .sort((a, b) => a.index - b.index)
  const manifest = {
    fileId,
    name: String(data.name).slice(0, 300),
    mime: data.mime || 'application/octet-stream',
    size: data.size,
    chunks,
    uploadedAt: new Date().toISOString(),
  }
  await put('manifests/' + fileId + '.json', JSON.stringify(manifest), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  })
  return NextResponse.json({ ok: true, chunkCount: chunks.length })
}