import { rm } from 'node:fs/promises'

import { compile } from '@inlang/paraglide-js'

import { paraglideOptions } from '../paraglide.config.js'

await rm(paraglideOptions.outdir, { force: true, recursive: true })
await compile(paraglideOptions)
