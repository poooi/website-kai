import { Resvg, initWasm, type InitInput } from '@resvg/resvg-wasm'
import { createElement } from 'react'
import satori, { init as initSatori } from 'satori/standalone'

import {
  socialImageHeight,
  socialImageWidth,
  withSocialImageHeaders,
} from './social-image-constants'

const socialImageLogoPath = '/social/poi.png'
const socialImageFontPath = '/social/IBMPlexSans-SemiBold.woff'

type FetchAsset = (pathname: string) => Promise<Response>
type RenderedSocialImage = ReturnType<InstanceType<typeof Resvg>['render']>

let activeWasmInput: InitInput | undefined
let activeYogaWasmInput: Parameters<typeof initSatori>[0] | undefined
let resvgReady: Promise<void> | undefined
let satoriReady: Promise<void> | undefined
let socialImageInputs:
  | Promise<{
      fontData: ArrayBuffer
      logoDataUrl: string
    }>
  | undefined

const readAsset = async (fetchAsset: FetchAsset, pathname: string) => {
  const response = await fetchAsset(pathname)
  if (!response.ok) {
    throw new Error(
      `Unable to load social image asset ${pathname}: ${response.status}`,
    )
  }
  return response
}

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

const loadSocialImageInputs = (fetchAsset: FetchAsset) => {
  socialImageInputs ??= Promise.all([
    readAsset(fetchAsset, socialImageFontPath).then((response) =>
      response.arrayBuffer(),
    ),
    readAsset(fetchAsset, socialImageLogoPath).then(async (response) => {
      const contentType = response.headers.get('Content-Type') ?? 'image/png'
      return `data:${contentType};base64,${arrayBufferToBase64(
        await response.arrayBuffer(),
      )}`
    }),
  ])
    .then(([fontData, logoDataUrl]) => ({ fontData, logoDataUrl }))
    .catch((error: unknown) => {
      socialImageInputs = undefined
      throw error
    })

  return socialImageInputs
}

const ensureResvg = (wasmInput: InitInput) => {
  if (activeWasmInput && activeWasmInput !== wasmInput) {
    throw new Error('resvg WASM has already been initialized')
  }

  activeWasmInput = wasmInput
  resvgReady ??= initWasm(wasmInput).catch((error: unknown) => {
    resvgReady = undefined
    activeWasmInput = undefined
    throw error
  })

  return resvgReady
}

const ensureSatori = (yogaWasmInput: Parameters<typeof initSatori>[0]) => {
  if (activeYogaWasmInput && activeYogaWasmInput !== yogaWasmInput) {
    throw new Error('Satori Yoga WASM has already been initialized')
  }

  activeYogaWasmInput = yogaWasmInput
  satoriReady ??= initSatori(yogaWasmInput).catch((error: unknown) => {
    satoriReady = undefined
    activeYogaWasmInput = undefined
    throw error
  })

  return satoriReady
}

const createPngResponseBody = (png: Uint8Array) => {
  if (
    png.buffer instanceof ArrayBuffer &&
    png.byteOffset === 0 &&
    png.byteLength === png.buffer.byteLength
  ) {
    return png.buffer
  }

  const body = new ArrayBuffer(png.byteLength)
  new Uint8Array(body).set(png)
  return body
}

export const createSocialImageResponseWithWasm = async (
  fetchAsset: FetchAsset,
  wasmInput: InitInput,
  yogaWasmInput: Parameters<typeof initSatori>[0],
) => {
  const [{ fontData, logoDataUrl }] = await Promise.all([
    loadSocialImageInputs(fetchAsset),
    ensureResvg(wasmInput),
    ensureSatori(yogaWasmInput),
  ])

  const svg = await satori(
    createElement(
      'div',
      {
        style: {
          alignItems: 'center',
          background: 'white',
          display: 'flex',
          fontFamily: 'IBM Plex Sans',
          fontSize: '240px',
          fontWeight: 600,
          height: '100%',
          justifyContent: 'center',
          lineHeight: '1.2em',
          width: '100%',
        },
      },
      createElement('img', {
        height: 400,
        src: logoDataUrl,
        width: 400,
      }),
      createElement('div', null, 'poi'),
    ),
    {
      fonts: [
        {
          data: fontData,
          name: 'IBM Plex Sans',
          weight: 600,
        },
      ],
      height: socialImageHeight,
      width: socialImageWidth,
    },
  )

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'original',
    },
  })
  let image: RenderedSocialImage | undefined
  try {
    image = resvg.render()
    return new Response(createPngResponseBody(image.asPng()), {
      headers: withSocialImageHeaders(),
    })
  } finally {
    image?.free()
    resvg.free()
  }
}
