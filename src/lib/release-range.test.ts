import { describe, expect, it } from 'vitest'
import { releaseRange, releaseYear, type ReleaseEntry } from './release-range'

const entry = (
  version: string,
  publishedAt: string | null = null,
): ReleaseEntry => ({
  version,
  publishedAt,
  language: 'en-US',
  source: 'https://github.com/poooi/poi',
  reconstructed: false,
  html: '<p>Notes</p>',
})
const entries = ['v6.1.3', 'v6.1.1', 'v6.0.1', 'v6.1.2', 'v6.2.0'].map((v) =>
  entry(v),
)

describe('release range', () => {
  it('includes every intermediate version and the target, excluding the starting version', () => {
    expect(
      releaseRange(entries, 'v6.0.1', 'v6.1.3').entries.map((e) => e.version),
    ).toEqual(['v6.1.1', 'v6.1.2', 'v6.1.3'])
  })
  it('normalizes reverse selections and uses version order rather than publication date', () => {
    expect(releaseRange(entries, 'v6.1.3', 'v6.0.1')).toEqual(
      releaseRange(entries, 'v6.0.1', 'v6.1.3'),
    )
    expect(
      releaseRange(
        [
          entry('v10.2.2', '2019-01-01T00:00:00Z'),
          entry('v10.2.1'),
          entry('v10.2.0', '2020-01-01T00:00:00Z'),
        ],
        'v10.2.0',
        'v10.2.2',
      ).entries.map((e) => e.version),
    ).toEqual(['v10.2.1', 'v10.2.2'])
  })
  it('distinguishes identical versions from unknown or prerelease selections', () => {
    expect(releaseRange(entries, 'v6.1.1', 'v6.1.1').status).toBe('same')
    expect(releaseRange(entries, 'v6.1.0', 'v6.1.3').status).toBe('invalid')
    expect(releaseRange(entries, 'v6.1.3-beta.1', 'v6.1.3').status).toBe(
      'invalid',
    )
  })
  it('keeps unknown dates separate instead of inferring a year', () => {
    expect(releaseYear(entry('v10.2.1'))).toBe('undated')
    expect(releaseYear(entry('v6.1.3', '2016-04-02T05:11:53Z'))).toBe('2016')
  })
})
