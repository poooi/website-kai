import { rm } from 'node:fs/promises'

import { compile } from '@inlang/paraglide-js'

import { paraglideOptions } from '../paraglide.config.ts'

const outdir = paraglideOptions.outdir

await rm(outdir, { force: true, recursive: true })

await compile(paraglideOptions)
