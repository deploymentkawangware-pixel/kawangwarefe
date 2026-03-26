import { describe, it, expect } from 'vitest'
import {
  CREATE_MANUAL_CONTRIBUTION,
  LOOKUP_MEMBER_BY_PHONE,
} from '@/lib/graphql/manual-contribution-mutations'

describe('manual-contribution-mutations', () => {
  it('exports CREATE_MANUAL_CONTRIBUTION as DocumentNode', () => {
    expect(CREATE_MANUAL_CONTRIBUTION).toBeDefined()
    expect(CREATE_MANUAL_CONTRIBUTION.kind).toBe('Document')
  })

  it('CREATE_MANUAL_CONTRIBUTION contains createManualContribution operation', () => {
    const body = (CREATE_MANUAL_CONTRIBUTION as any).loc?.source?.body || ''
    expect(body).toContain('createManualContribution')
  })

  it('exports LOOKUP_MEMBER_BY_PHONE as DocumentNode', () => {
    expect(LOOKUP_MEMBER_BY_PHONE).toBeDefined()
    expect(LOOKUP_MEMBER_BY_PHONE.kind).toBe('Document')
  })

  it('LOOKUP_MEMBER_BY_PHONE contains lookupMemberByPhone operation', () => {
    const body = (LOOKUP_MEMBER_BY_PHONE as any).loc?.source?.body || ''
    expect(body).toContain('lookupMemberByPhone')
  })
})
