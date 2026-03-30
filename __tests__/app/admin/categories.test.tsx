import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock Apollo
vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn().mockImplementation(() => ({
    data: {
      contributionCategories: [
        { id: '1', name: 'Tithe', code: 'TITHE', description: 'Monthly tithe contributions', isActive: true, routingMode: 'REQUIRES_PURPOSE', fallbackIfNoGroup: 'TOP_LEVEL' },
        { id: '2', name: 'Building Fund', code: 'BUILD', description: 'Church building project', isActive: true, routingMode: 'AUTO_MEMBER_GROUP', fallbackIfNoGroup: 'TOP_LEVEL' },
        { id: '3', name: 'Missions', code: 'MISSIONS', description: '', isActive: false, routingMode: 'REQUIRES_PURPOSE', fallbackIfNoGroup: 'TOP_LEVEL' },
      ],
    },
    loading: false,
    error: null,
    refetch: vi.fn(),
  })),
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

  it('renders category names and codes', () => {
    render(<CategoryManagementPage />)
    expect(screen.getByText('Tithe')).toBeInTheDocument()
    expect(screen.getByText('TITHE')).toBeInTheDocument()
    expect(screen.getByText('Building Fund')).toBeInTheDocument()
    expect(screen.getByText('BUILD')).toBeInTheDocument()
    expect(screen.getByText('Missions')).toBeInTheDocument()
  })

  it('shows statistics for total, active, and inactive departments', () => {
    render(<CategoryManagementPage />)
    expect(screen.getByText('Total Departments')).toBeInTheDocument()
  })

  it('shows Add Department button', () => {
    render(<CategoryManagementPage />)
    expect(screen.getByRole('button', { name: /Add Department/i })).toBeInTheDocument()
  })

  it('renders edit and delete buttons for each category', () => {
    render(<CategoryManagementPage />)
    const editButtons = screen.getAllByRole('button', { name: /Edit/i })
    expect(editButtons.length).toBe(3)
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i })
    expect(deleteButtons.length).toBe(3)
  })

  it('shows routing mode badges', () => {
    render(<CategoryManagementPage />)
    const purposeBadges = screen.getAllByText('Requires Purpose')
    expect(purposeBadges.length).toBeGreaterThan(0)
    expect(screen.getByText('Auto Group Match')).toBeInTheDocument()
  })
})
