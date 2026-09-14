# Dependency patches

## harfbuzzjs 0.10.0

Satori 0.33.4 imports HarfBuzz's initialization promise, including in its
standalone entry. The default Emscripten loader assumes browser Worker globals
and fetches the Wasm binary; that initialization fails in Cloudflare Workers.

This patch adds a `workerd` export with the same promise API. Cloudflare's Vite
plugin selects it automatically and bundles `hb.wasm` as a compiled module.
The entry instantiates that module through Emscripten's `instantiateWasm` hook.
When that hook is supplied, the loader skips browser and Node file discovery.
The default Node/browser entry is retained.

The wrapper also registers the exported Wasm `free` function directly. Wrapping
it in a JavaScript callback would make Emscripten compile a Wasm trampoline at
runtime, which Workers disallow.

The patch covers the initialization and shaping operations used by Satori.
HarfBuzz's optional drawing, tracing and custom JavaScript callbacks still use
dynamic trampolines and are outside its scope. No Satori patch is required.

`hb.js` is generated and minified: its only changes are the `instantiateWasm`
guards on the three environment flags. Keep it minified when refreshing the
patch with `pnpm patch harfbuzzjs@0.10.0` and `pnpm patch-commit`.

Validate updates with the Node unit suite and the browser/HTTP suite, including
the social-image PNG snapshot. Also check the built Worker directly with
Wrangler; a Node-only test cannot verify Worker Wasm restrictions. Remove this
patch when upstream supplies an equivalent Worker-compatible entry.
