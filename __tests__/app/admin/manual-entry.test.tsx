import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock Apollo
vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn().mockImplementation(() => ({
    data: {
      contributionCategories: [
        { id: '1', name: 'Tithe', code: 'TITHE' },
        { id: '2', name: 'Offering', code: 'OFFER' },
        { id: '3', name: 'Building Fund', code: 'BUILD' },
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

// Mock next/link to return proper JSX
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

import ManualEntryPage from '@/app/(dashboard)/admin/contributions/manual-entry/page'

describe('ManualEntryPage', () => {
  it('renders the heading', () => {
    render(<ManualEntryPage />)
    expect(screen.getByText('Manual Contribution Entry')).toBeInTheDocument()
  })

  it('renders the Member Information card', () => {
    render(<ManualEntryPage />)
    expect(screen.getByText('Member Information')).toBeInTheDocument()
    expect(screen.getByText('Enter phone number to identify the contributor')).toBeInTheDocument()
  })

  it('renders the Contribution Details card', () => {
    render(<ManualEntryPage />)
    expect(screen.getByText('Contribution Details')).toBeInTheDocument()
  })

  it('renders the Save Contribution button', () => {
    render(<ManualEntryPage />)
    expect(screen.getByRole('button', { name: /Save Contribution/i })).toBeInTheDocument()
  })

  it('renders phone number input and search button', () => {
    render(<ManualEntryPage />)
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument()
  })

  it('renders View All Contributions link', () => {
    render(<ManualEntryPage />)
    expect(screen.getByText('View All Contributions')).toBeInTheDocument()
  })
})
