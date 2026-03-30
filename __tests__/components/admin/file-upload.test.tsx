import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FileUpload } from '@/components/admin/file-upload'

describe('FileUpload', () => {
  it('renders upload area when no file selected', () => {
    render(<FileUpload onFileSelect={vi.fn()} />)
    expect(screen.getByText('Upload File')).toBeInTheDocument()
    expect(screen.getByText('Choose File')).toBeInTheDocument()
  })

  it('shows accepted formats', () => {
    render(<FileUpload onFileSelect={vi.fn()} accept=".csv,.xlsx" maxSize={10} />)
    expect(screen.getByText(/Accepted formats: .csv,.xlsx/)).toBeInTheDocument()
    expect(screen.getByText(/Max 10MB/)).toBeInTheDocument()
  })

  it('shows selected file info', () => {
    const file = new File(['content'], 'data.csv', { type: 'text/csv' })
    render(<FileUpload onFileSelect={vi.fn()} selectedFile={file} />)
    expect(screen.getByText('data.csv')).toBeInTheDocument()
  })

  it('calls onClear when clearing file', () => {
    const onClear = vi.fn()
    const file = new File(['content'], 'data.csv', { type: 'text/csv' })
    render(<FileUpload onFileSelect={vi.fn()} selectedFile={file} onClear={onClear} />)
    // Click the X button to clear
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    expect(onClear).toHaveBeenCalled()
  })

  it('shows drag and drop text', () => {
    render(<FileUpload onFileSelect={vi.fn()} />)
    expect(screen.getByText(/Drag and drop/)).toBeInTheDocument()
  })
})
