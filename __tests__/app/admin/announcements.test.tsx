import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

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

// Mock confirm dialog hook
vi.mock('@/hooks/use-confirm-dialog', () => ({
  useConfirmDialog: () => ({
    confirm: vi.fn(),
    ConfirmDialog: () => null,
  }),
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  format: (date: any, fmt: string) => 'Jan 1, 2025',
  isPast: () => false,
  isFuture: () => true,
  isToday: () => false,
}))

import AnnouncementsManagementPage from '@/app/(dashboard)/admin/announcements/page'

describe('AnnouncementsManagementPage', () => {
  it('renders the heading', () => {
    render(<AnnouncementsManagementPage />)
    expect(screen.getByText('Announcements')).toBeInTheDocument()
  })
})
