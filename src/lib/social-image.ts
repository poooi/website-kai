import resvgWasmModule from '@resvg/resvg-wasm/index_bg.wasm'
import yogaWasmModule from 'satori/yoga.wasm'

import { createSocialImageResponseWithWasm } from './social-image-renderer'

type FetchAsset = (pathname: string) => Promise<Response>

export const createSocialImageResponse = (fetchAsset: FetchAsset) =>
  createSocialImageResponseWithWasm(fetchAsset, resvgWasmModule, yogaWasmModule)
