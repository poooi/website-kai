// Run: pnpm dlx svgo@4.0.0 --config svgo.config.mjs -i src/assets/maizuru.svg -o src/assets/maizuru.svg
// Preserve the geography layers used by HarbourMap's reveal animation.
export default {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          cleanupIds: false,
          collapseGroups: false,
          convertShapeToPath: false,
          // Themes are selected at runtime through data-theme on the SVG root.
          inlineStyles: false,
        },
      },
    },
  ],
}
