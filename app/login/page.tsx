'use client'
import { useState } from 'react'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoading(false)
    if (res.ok) location.href = '/'
    else setError('Sai mat khau')
  }

  return (
    <div className='login-wrap'>
      <form onSubmit={submit} className='login-card'>
        <h2 className='login-title'>Cloud Drive</h2>
        <p className='login-sub'>Nhap mat khau de truy cap.</p>
        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Mat khau'
          className='login-input'
        />
        {error && <p className='login-error'>{error}</p>}
        <button disabled={loading} className='btn btn-primary'>
          {loading ? 'Dang kiem tra...' : 'Dang nhap'}
        </button>
      </form>
    </div>
  )
}