import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const { blobs } = await list({ prefix: 'manifests/' })
  const files = await Promise.all(
    blobs.map(async (b) => {
      const m = await (await fetch(b.url, { cache: 'no-store' })).json()
      return {
        fileId: m.fileId,
        name: m.name,
        mime: m.mime,
        size: m.size,
        uploadedAt: m.uploadedAt,
        chunkCount: m.chunks.length,
      }
    })
  )
  files.sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1))
  return NextResponse.json({ files })
}
