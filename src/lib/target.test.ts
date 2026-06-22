import { describe, expect, it } from 'vitest'

import {
  detectTargetFromRequest,
  isMobileDevice,
  OS,
  parseUA,
  PlatformSpec,
  Target,
} from './target'

describe('detectTargetFromRequest', () => {
  it('maps Windows ARM client hints to the Windows ARM target', async () => {
    await expect(
      detectTargetFromRequest(
        new Headers({
          'Sec-CH-UA-Arch': '"arm"',
          'Sec-CH-UA-Mobile': '?0',
          'Sec-CH-UA-Platform': '"Windows"',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; ARM64) AppleWebKit/537.36',
        }),
      ),
    ).resolves.toEqual({
      os: OS.windows,
      spec: PlatformSpec.ARM,
      target: Target.winArm,
    })
  })

  describe('isMobileDevice', () => {
    it('classifies wearable user agents as mobile devices', async () => {
      const headers = new Headers({
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 13; Google Pixel Watch Build/TWD9.230205.001) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      })

      await expect(parseUA(headers)).resolves.toMatchObject({
        device: { type: 'wearable' },
      })
      await expect(isMobileDevice(headers)).resolves.toBe(true)
    })
  })

  it('maps generic Linux ARM to an available Linux ARM platform spec', async () => {
    await expect(
      detectTargetFromRequest(
        new Headers({
          'Sec-CH-UA-Arch': '"arm"',
          'Sec-CH-UA-Mobile': '?0',
          'Sec-CH-UA-Platform': '"Linux"',
          'User-Agent': 'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36',
        }),
      ),
    ).resolves.toEqual({
      os: OS.linux,
      spec: PlatformSpec.ARMPortable,
      target: Target.linuxArm,
    })
  })

  it('maps Fedora ARM to an available Linux ARM platform spec', async () => {
    await expect(
      detectTargetFromRequest(
        new Headers({
          'Sec-CH-UA-Arch': '"arm"',
          'Sec-CH-UA-Mobile': '?0',
          'Sec-CH-UA-Platform': '"Linux"',
          'User-Agent':
            'Mozilla/5.0 (X11; Fedora; Linux aarch64) AppleWebKit/537.36',
        }),
      ),
    ).resolves.toEqual({
      os: OS.linux,
      spec: PlatformSpec.ARMPortable,
      target: Target.linuxArm,
    })
  })
})
