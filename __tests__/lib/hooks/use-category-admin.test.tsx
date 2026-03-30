import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn().mockReturnValue({
    data: {
      myCategoryAdminRoles: [
        { id: '1', category: { id: 'c1', name: 'Tithe', code: 'TITHE', description: '' }, assignedAt: '2024-01-01', isActive: true },
      ],
    },
    loading: false, error: null, refetch: vi.fn(),
  }),
}))

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({ user: { memberId: 1 } }),
}))

import { useMyCategoryAdminRoles, useCategoryAdminIds } from '@/lib/hooks/use-category-admin'

describe('useMyCategoryAdminRoles', () => {
  it('returns roles array', () => {
    const { result } = renderHook(() => useMyCategoryAdminRoles())
    expect(result.current.roles.length).toBe(1)
    expect(result.current.isAnyCategoryAdmin).toBe(true)
  })
})

describe('useCategoryAdminIds', () => {
  it('returns category IDs', () => {
    const { result } = renderHook(() => useCategoryAdminIds())
    expect(result.current.categoryIds).toContain('c1')
    expect(result.current.categories.length).toBe(1)
  })
})
