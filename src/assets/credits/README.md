# Credits icons

Local copies of the special-thanks logos referenced by poi's
[`assets/data/constant.cson`](https://github.com/poooi/poi/blob/master/assets/data/constant.cson).
They are bundled by Vite and served from this origin; the credits page never
loads them from a remote host at runtime.

| File                      | Original source (as listed in `constant.cson`)                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `kcwiki.png`              | `https://upload.kcwiki.org/commons/thumb/d/d1/Kcwiki-banner.png/600px-Kcwiki-banner.png`                         |
| `taonpm.png`              | `https://zos.alipayobjects.com/rmsportal/UQvFKvLLWPPmxTM.png`                                                    |
| `kancolle-wikia.webp`     | `https://vignette4.wikia.nocookie.net/kancolle/images/8/89/Wiki-wordmark.png/revision/latest?cb=20141226051229`  |
| `electronic-observer.png` | `https://github.com/andanteyk/ElectronicObserver/blob/develop/ElectronicObserver/Assets/AppIcon_64.png?raw=true` |
| `who-calls-the-fleet.png` | `https://avatars1.githubusercontent.com/u/31863156?s=64&v=4`                                                     |
| `kensuke-tanaka.jpg`      | `https://www.famitsu.com/images/000/039/658/l_522b1c633860a.jpg`                                                 |

Notes:

- The Wikia wordmark was fetched from the current `static.wikia.nocookie.net`
  CDN; `constant.cson` still lists the older `vignette4.wikia.nocookie.net`
  link for the same file.
- `kancolle-wikia.webp` is a WebP (RIFF) image; the `.webp` extension matches
  its container so it is not served with a mismatched MIME type.
- All logos render in the credits page's uniform 64x64 slots: wide banners are
  left-aligned and clipped by the slot, square marks are contained, and the
  portrait is cover-cropped to the face.
- `../poi-character-mask.svg` is derived from `../poi.svg` with the
  `circular-frame` group omitted; the credits page uses it as an alpha mask for
  the contributors/supporters avatar fallback.
