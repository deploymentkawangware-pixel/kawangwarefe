import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock next/navigation with useParams
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation')
  return { ...actual, useParams: () => ({ id: '1' }) }
})

// Mock Apollo
vi.mock('@apollo/client/react', () => ({
  useQuery: () => ({ data: null, loading: false, error: null, refetch: vi.fn() }),
  useMutation: () => [vi.fn(), { loading: false }],
}))

// Mock auth
vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { memberId: 1 }, logout: vi.fn() }),
  AuthProvider: ({ children }: any) => children,
}))

// Mock user role hook
vi.mock('@/lib/hooks/use-user-role', () => ({
  useUserRole: () => ({
    isStaff: true,
    canAccessAdmin: true,
    canAccessFeature: () => true,
    isAuthenticated: true,
    loading: false,
    adminCategories: [],
    adminCategoryIds: [],
    adminGroupNames: [],
  }),
}))

// Mock admin layout
vi.mock('@/components/layouts/admin-layout', () => ({
  AdminLayout: ({ children }: any) => <div data-testid="admin-layout">{children}</div>,
}))

// Mock admin protected route
vi.mock('@/components/auth/admin-protected-route', () => ({
  AdminProtectedRoute: ({ children }: any) => <div>{children}</div>,
}))

// Mock next/link to return proper JSX
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

import PurposesPage from '@/app/(dashboard)/admin/categories/[id]/purposes/page'

describe('PurposesPage', () => {
  it('renders the heading', () => {
    render(<PurposesPage />)
    expect(screen.getByText('Department Purposes')).toBeInTheDocument()
  })
})
