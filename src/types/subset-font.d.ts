declare module 'subset-font' {
  export interface SubsetFontOptions {
    targetFormat?: 'woff2'
    preserveNameIds?: number[]
  }

  const subsetFont: (
    originalFont: Buffer,
    text: string,
    options?: SubsetFontOptions,
  ) => Promise<Buffer>

  export default subsetFont
}
