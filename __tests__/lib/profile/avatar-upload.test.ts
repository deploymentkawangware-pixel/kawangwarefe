/**
 * avatar-upload client tests.
 * Pure-function tests for the validator + a fetch-mocked integration test.
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  AVATAR_MAX_BYTES,
  validateAvatarLocally,
  uploadAvatar,
} from '@/lib/profile/avatar-upload'

describe('validateAvatarLocally', () => {
  it('accepts a small PNG', () => {
    const f = new File([new Uint8Array(1024)], 'a.png', { type: 'image/png' })
    expect(() => validateAvatarLocally(f)).not.toThrow()
  })

  it('accepts a JPEG', () => {
    const f = new File([new Uint8Array(1024)], 'a.jpg', { type: 'image/jpeg' })
    expect(() => validateAvatarLocally(f)).not.toThrow()
  })

  it('rejects GIFs', () => {
    const f = new File([new Uint8Array(1024)], 'a.gif', { type: 'image/gif' })
    expect(() => validateAvatarLocally(f)).toThrow(/Unsupported/)
  })

  it('rejects oversize files', () => {
    const f = new File([new Uint8Array(AVATAR_MAX_BYTES + 1)], 'a.png', {
      type: 'image/png',
    })
    expect(() => validateAvatarLocally(f)).toThrow(/too large/i)
  })
})

describe('uploadAvatar', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('POSTs multipart with bearer token on happy path', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: 'ok', avatar_url: '/media/x.png' }),
    })
    global.fetch = mockFetch as unknown as typeof fetch

    const f = new File([new Uint8Array(100)], 'pic.png', { type: 'image/png' })
    const res = await uploadAvatar(f, 'jwt-token')

    expect(res.success).toBe(true)
    expect(mockFetch).toHaveBeenCalledOnce()
    const [, init] = mockFetch.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer jwt-token')
    expect(init.body).toBeInstanceOf(FormData)
  })

  it('throws on server-side rejection (success=false)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ success: false, message: 'Image too large' }),
    }) as unknown as typeof fetch

    const f = new File([new Uint8Array(100)], 'pic.png', { type: 'image/png' })
    await expect(uploadAvatar(f, 't')).rejects.toThrow(/Image too large/)
  })
})
