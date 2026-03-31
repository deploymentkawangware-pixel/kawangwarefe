import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BulkAddMembersModal } from '@/components/groups/bulk-add-members-modal'

vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    Search: () => <div data-testid="icon-search" />,
    Users: () => <div data-testid="icon-users" />,
    AlertCircle: () => <div data-testid="icon-alert" />,
    Loader2: () => <div data-testid="icon-loader" />,
  }
})

// We need to mock Apollo Client hooks
const mockMembersData = {
  membersList: {
    items: [
      { id: 'm1', fullName: 'John Doe', phoneNumber: '0711111111' },
      { id: 'm2', fullName: 'Jane Smith', phoneNumber: '0722222222' },
    ],
    total: 2,
    hasMore: false,
  }
}

const mockUseQuery = vi.fn()
const mockUseMutation = vi.fn()

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: any[]) => mockUseQuery(...args),
  useMutation: (...args: any[]) => mockUseMutation(...args),
}))

describe('BulkAddMembersModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    groupId: 'g1',
    groupName: 'Test Group',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseQuery.mockReturnValue({ data: mockMembersData, loading: false })
    mockUseMutation.mockReturnValue([vi.fn(), { loading: false }])
  })

  it('renders the modal with group name', () => {
    render(<BulkAddMembersModal {...defaultProps} />)
    expect(screen.getByText('Add Members to Test Group')).toBeInTheDocument()
  })

  it('renders a list of members', () => {
    render(<BulkAddMembersModal {...defaultProps} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('handles member selection', async () => {
    render(<BulkAddMembersModal {...defaultProps} />)
    const johnCheckbox = screen.getByLabelText('John Doe')
    
    fireEvent.click(johnCheckbox)
    expect(johnCheckbox).toBeChecked()
    
    // Add button should now show (1) selected
    expect(screen.getByRole('button', { name: /Add \(1\)/i })).toBeInTheDocument()
  })

  it('handles select all', () => {
    render(<BulkAddMembersModal {...defaultProps} />)
    const selectAllCheckbox = screen.getByLabelText('Select All')
    
    fireEvent.click(selectAllCheckbox)
    expect(screen.getByLabelText('John Doe')).toBeChecked()
    expect(screen.getByLabelText('Jane Smith')).toBeChecked()
    
    expect(screen.getByRole('button', { name: /Add \(2\)/i })).toBeInTheDocument()
  })

  it('calls mutation on submit and auto closes', async () => {
    const mockMutate = vi.fn().mockResolvedValue({
      data: {
        bulkAddMembersToGroup: {
          success: true,
          message: 'Added members successfully'
        }
      }
    })
    mockUseMutation.mockReturnValue([mockMutate, { loading: false }])

    const onOpenChange = vi.fn()
    render(<BulkAddMembersModal {...defaultProps} onOpenChange={onOpenChange} />)
    
    // Select one
    fireEvent.click(screen.getByLabelText('John Doe'))
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Add \(1\)/i }))
    
    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        memberIds: ['m1'],
        groupId: 'g1'
      }
    })

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText('Added members successfully')).toBeInTheDocument()
    })

    // Advance timers to trigger auto-close
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    }, { timeout: 3000 })
  })
})
