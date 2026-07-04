// Chan path traversal: chi cho phep fileId gom chu, so va dau gach ngang.
export function isSafeId(id: string | null): id is string {
  return !!id && /^[a-zA-Z0-9-]+$/.test(id)
}