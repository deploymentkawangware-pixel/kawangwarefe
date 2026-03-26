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

// Mock next/link to return proper JSX
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

import CategoryManagementPage from '@/app/(dashboard)/admin/categories/page'

describe('CategoryManagementPage', () => {
  it('renders the heading', () => {
    render(<CategoryManagementPage />)
    expect(screen.getByText('Contribution Departments')).toBeInTheDocument()
  })

  it('shows the all departments section', () => {
    render(<CategoryManagementPage />)
    expect(screen.getByText('All Departments')).toBeInTheDocument()
  })

  it('shows empty state when no departments', () => {
    render(<CategoryManagementPage />)
    expect(screen.getByText('No departments found. Create one to get started.')).toBeInTheDocument()
  })
})
