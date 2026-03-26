import { describe, it, expect } from 'vitest'
import {
  INITIATE_CONTRIBUTION,
  GENERATE_CONTRIBUTION_REPORT,
} from '@/lib/graphql/mutations'

describe('mutations', () => {
  it('exports INITIATE_CONTRIBUTION as DocumentNode', () => {
    expect(INITIATE_CONTRIBUTION).toBeDefined()
    expect(INITIATE_CONTRIBUTION.kind).toBe('Document')
  })

  it('INITIATE_CONTRIBUTION contains initiateContribution operation', () => {
    const body = (INITIATE_CONTRIBUTION as any).loc?.source?.body || ''
    expect(body).toContain('initiateContribution')
  })

  it('exports GENERATE_CONTRIBUTION_REPORT as DocumentNode', () => {
    expect(GENERATE_CONTRIBUTION_REPORT).toBeDefined()
    expect(GENERATE_CONTRIBUTION_REPORT.kind).toBe('Document')
  })

  it('GENERATE_CONTRIBUTION_REPORT contains generateContributionReport operation', () => {
    const body = (GENERATE_CONTRIBUTION_REPORT as any).loc?.source?.body || ''
    expect(body).toContain('generateContributionReport')
  })
})
