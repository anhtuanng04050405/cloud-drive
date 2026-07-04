import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { isSafeId } from '@/lib/safe'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  const fileId = searchParams.get('fileId')
  const index = searchParams.get('index')
  if (!isSafeId(fileId) || index === null || !/^[0-9]+$/.test(index)) {
    return NextResponse.json({ error: 'Tham so khong hop le' }, { status: 400 })
  }
  const body = await req.arrayBuffer()
  await put('chunks/' + fileId + '/' + index, Buffer.from(body), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/octet-stream',
  })
  return NextResponse.json({ ok: true })
}