import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { socialImageHeight, socialImageWidth } from './social-image-constants'
import { createSocialImageResponseWithWasm } from './social-image-renderer'

const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const assetPaths = new Map([
  ['/social/poi.png', ['src', 'assets', 'poi.png']],
  [
    '/social/IBMPlexSans-SemiBold.woff',
    [
      'node_modules',
      '@ibm',
      'plex-sans',
      'fonts',
      'complete',
      'woff',
      'IBMPlexSans-SemiBold.woff',
    ],
  ],
  [
    '/social/resvg.wasm',
    ['node_modules', '@resvg', 'resvg-wasm', 'index_bg.wasm'],
  ],
  ['/social/yoga.wasm', ['node_modules', 'satori', 'yoga.wasm']],
])

describe('createSocialImageResponse', () => {
  it('generates the Next-era social card as a PNG', async () => {
    const wasmInput = await readFile(
      path.join(process.cwd(), ...assetPaths.get('/social/resvg.wasm')!),
    )
    const yogaWasmInput = await readFile(
      path.join(process.cwd(), ...assetPaths.get('/social/yoga.wasm')!),
    )
    const response = await createSocialImageResponseWithWasm(
      async (pathname) => {
        const assetPath = assetPaths.get(pathname)
        if (!assetPath) {
          return new Response('', { status: 404 })
        }

        return new Response(
          await readFile(path.join(process.cwd(), ...assetPath)),
        )
      },
      wasmInput,
      yogaWasmInput,
    )

    expect(response.headers.get('Content-Type')).toBe('image/png')
    expect(response.headers.get('Cache-Control')).toBe('public,max-age=3600')

    const image = new Uint8Array(await response.arrayBuffer())
    expect([...image.subarray(0, pngSignature.length)]).toEqual(pngSignature)
    const dataView = new DataView(image.buffer, image.byteOffset)
    expect(dataView.getUint32(16)).toBe(socialImageWidth)
    expect(dataView.getUint32(20)).toBe(socialImageHeight)
    expect(image.byteLength).toBeGreaterThan(10_000)
  })
})
