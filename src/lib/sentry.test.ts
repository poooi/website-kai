import { describe, expect, it } from 'vitest'

import { handleSentryTunnel, sentryDsn } from './sentry'

const makeEnvelope = (dsn = sentryDsn) => {
  return `${JSON.stringify({ dsn })}\n${JSON.stringify({ type: 'event' })}\n{}`
}

describe('handleSentryTunnel', () => {
  it('rejects unsupported methods with no-store', async () => {
    const response = await handleSentryTunnel(
      new Request('https://poi.moe/api/monitoring'),
    )

    expect(response.status).toBe(405)
    expect(response.headers.get('Allow')).toBe('POST')
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })

  it('rejects malformed envelopes', async () => {
    const response = await handleSentryTunnel(
      new Request('https://poi.moe/api/monitoring', {
        body: 'not-json',
        method: 'POST',
      }),
    )

    expect(response.status).toBe(400)
  })

  it('rejects envelopes for a different DSN', async () => {
    const response = await handleSentryTunnel(
      new Request('https://poi.moe/api/monitoring', {
        body: makeEnvelope('https://public@example.com/1'),
        method: 'POST',
      }),
    )

    expect(response.status).toBe(400)
  })

  it('rejects envelopes without a DSN', async () => {
    const response = await handleSentryTunnel(
      new Request('https://poi.moe/api/monitoring', {
        body: `${JSON.stringify({})}\n${JSON.stringify({ type: 'event' })}\n{}`,
        method: 'POST',
      }),
    )

    expect(response.status).toBe(400)
  })

  it('forwards valid envelopes only to the configured Sentry ingest URL', async () => {
    const calls: Array<{ input: string; init?: RequestInit }> = []
    const response = await handleSentryTunnel(
      new Request('https://poi.moe/api/monitoring', {
        body: makeEnvelope(),
        headers: { 'Content-Type': 'text/plain' },
        method: 'POST',
      }),
      {
        fetcher: (async (input, init) => {
          const inputUrl =
            typeof input === 'string'
              ? input
              : input instanceof URL
                ? input.toString()
                : input.url
          calls.push({ input: inputUrl, init })
          return new Response('', { status: 202 })
        }) satisfies typeof fetch,
      },
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(calls).toHaveLength(1)
    const [call] = calls
    expect(call).toBeDefined()
    expect(call!.input).toBe(
      'https://o171991.ingest.us.sentry.io/api/4508112237101056/envelope/?sentry_key=cada89d337c4fa8d92e1e1b2ddc1fdfc',
    )
    expect(call!.init?.method).toBe('POST')
    expect(call!.init?.headers).toEqual({ 'Content-Type': 'text/plain' })
  })
})
