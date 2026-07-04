'use client'
import { useEffect, useRef, useState } from 'react'

const CHUNK_SIZE = 4 * 1024 * 1024 // 4MB moi phan

type FileItem = {
  fileId: string
  name: string
  mime: string
  size: number
  uploadedAt: string
  chunkCount: number
}

function formatSize(n: number) {
  if (n < 1024) return n + ' B'
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
  if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB'
  return (n / 1024 / 1024 / 1024).toFixed(2) + ' GB'
}

export default function Home() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [progress, setProgress] = useState<number | null>(null)
  const [status, setStatus] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function load() {
    const r = await fetch('/api/files', { cache: 'no-store' })
    if (r.ok) {
      const d = await r.json()
      setFiles(d.files)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fileId = crypto.randomUUID()
    const total = Math.ceil(file.size / CHUNK_SIZE) || 1
    setStatus('Dang tai: ' + file.name)
    try {
      for (let i = 0; i < total; i++) {
        const part = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
        const res = await fetch('/api/upload-chunk?fileId=' + fileId + '&index=' + i, {
          method: 'POST',
          body: part,
        })
        if (!res.ok) throw new Error('Loi tai phan ' + (i + 1))
        setProgress(Math.round(((i + 1) / total) * 100))
      }
      await fetch('/api/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, name: file.name, mime: file.type, size: file.size }),
      })
      setStatus('Da tai len: ' + file.name + ' (chia thanh ' + total + ' phan)')
      await load()
    } catch (err: any) {
      setStatus('Loi: ' + err.message)
    } finally {
      setProgress(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Xoa file nay?')) return
    await fetch('/api/delete/' + id, { method: 'POST' })
    await load()
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST' })
    location.href = '/login'
  }

  return (
    <div className='container'>
      <div className='topbar'>
        <h1 className='title'>Cloud Drive</h1>
        <button onClick={logout} className='btn btn-ghost'>Dang xuat</button>
      </div>

      <label className='dropzone'>
        <input ref={inputRef} type='file' onChange={onUpload} hidden />
        <div className='dz-main'>Bam de chon file tai len</div>
        <div className='dz-sub'>File lon se tu dong duoc chia nho thanh cac phan 4MB</div>
      </label>

      {progress !== null && (
        <div className='progress'>
          <progress className='progress-el' value={progress} max={100} />
          <span className='progress-text'>{progress}%</span>
        </div>
      )}
      {status && <p className='status'>{status}</p>}

      <div className='filelist'>
        {files.length === 0 && <p className='empty'>Chua co file nao.</p>}
        {files.map((f) => (
          <div key={f.fileId} className='row'>
            <div>
              <div className='row-name'>{f.name}</div>
              <div className='row-meta'>{formatSize(f.size)} - {f.chunkCount} phan - {new Date(f.uploadedAt).toLocaleString('vi-VN')}</div>
            </div>
            <div className='row-actions'>
              <a href={'/api/download/' + f.fileId} className='btn btn-download'>Tai ve</a>
              <button onClick={() => onDelete(f.fileId)} className='btn btn-delete'>Xoa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}