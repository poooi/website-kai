import { describe, expect, it } from 'vitest'

import {
  detectRequestPlatform,
  detectTargetFromRequest,
  isMobileDevice,
  OS,
  parseUA,
  PlatformSpec,
  Target,
} from './target'

const headersFor = (
  userAgent: string,
  clientHints: Record<string, string> = {},
) =>
  new Headers({
    'User-Agent': userAgent,
    ...clientHints,
  })

describe('detectTargetFromRequest', () => {
  it.each([
    {
      name: 'Windows x64 from reduced Chromium UA plus architecture hints',
      headers: headersFor(
        'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        {
          'Sec-CH-UA-Arch': '"x86"',
          'Sec-CH-UA-Bitness': '"64"',
          'Sec-CH-UA-Mobile': '?0',
          'Sec-CH-UA-Platform': '"Windows"',
        },
      ),
      expected: {
        os: OS.windows,
        spec: PlatformSpec.X64Setup,
        target: Target.win64Setup,
      },
    },
    {
      name: 'Windows ia32 from reduced Chromium UA plus architecture hints',
      headers: headersFor(
        'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        {
          'Sec-CH-UA-Arch': '"x86"',
          'Sec-CH-UA-Bitness': '"32"',
          'Sec-CH-UA-Mobile': '?0',
          'Sec-CH-UA-Platform': '"Windows"',
        },
      ),
      expected: {
        os: OS.windows,
        spec: PlatformSpec.IA32Setup,
        target: Target.win32Setup,
      },
    },
    {
      name: 'Windows ARM from reduced Chromium UA plus architecture hints',
      headers: headersFor(
        'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        {
          'Sec-CH-UA-Arch': '"arm"',
          'Sec-CH-UA-Bitness': '"64"',
          'Sec-CH-UA-Mobile': '?0',
          'Sec-CH-UA-Platform': '"Windows"',
        },
      ),
      expected: {
        os: OS.windows,
        spec: PlatformSpec.ARM,
        target: Target.winArm,
      },
    },
    {
      name: 'macOS Intel from Chromium architecture hints',
      headers: headersFor(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        {
          'Sec-CH-UA-Arch': '"x86"',
          'Sec-CH-UA-Bitness': '"64"',
          'Sec-CH-UA-Mobile': '?0',
          'Sec-CH-UA-Platform': '"macOS"',
        },
      ),
      expected: {
        os: OS.macos,
        spec: PlatformSpec.X64Setup,
        target: Target.macos,
      },
    },
    {
      name: 'Apple Silicon from Chromium architecture hints despite Intel macOS UA',
      headers: headersFor(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        {
          'Sec-CH-UA-Arch': '"arm"',
          'Sec-CH-UA-Bitness': '"64"',
          'Sec-CH-UA-Mobile': '?0',
          'Sec-CH-UA-Platform': '"macOS"',
        },
      ),
      expected: {
        os: OS.macos,
        spec: PlatformSpec.ARM,
        target: Target.macosArm,
      },
    },
    {
      name: 'Safari-style macOS UA without architecture hints defaults to Apple Silicon',
      headers: headersFor(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_7) ' +
          'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15',
      ),
      expected: {
        os: OS.macos,
        spec: PlatformSpec.ARM,
        target: Target.macosArm,
      },
    },
    {
      name: 'Ubuntu Firefox x64 UA',
      headers: headersFor(
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:152.0) ' +
          'Gecko/20100101 Firefox/152.0',
      ),
      expected: {
        os: OS.linux,
        spec: PlatformSpec.X64DEB,
        target: Target.linuxDeb,
      },
    },
  ])(
    'maps $name to the recommended download',
    async ({ headers, expected }) => {
      await expect(detectTargetFromRequest(headers)).resolves.toEqual(expected)
    },
  )

  it('keeps Linux distro detection when generic Linux Client Hints are present', async () => {
    await expect(
      detectTargetFromRequest(
        headersFor(
          'Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36',
          {
            'Sec-CH-UA-Arch': '"x86"',
            'Sec-CH-UA-Bitness': '"64"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"Linux"',
          },
        ),
      ),
    ).resolves.toEqual({
      os: OS.linux,
      spec: PlatformSpec.X64RPM,
      target: Target.linuxRpm,
    })
  })

  it('falls back to the parsed UA architecture when x86 Client Hints omit bitness', async () => {
    await expect(
      detectTargetFromRequest(
        headersFor(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
          {
            'Sec-CH-UA-Arch': '"x86"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"Windows"',
          },
        ),
      ),
    ).resolves.toEqual({
      os: OS.windows,
      spec: PlatformSpec.X64Setup,
      target: Target.win64Setup,
    })
  })

  it('falls back to the parsed UA architecture when arm Client Hints omit bitness', async () => {
    await expect(
      detectTargetFromRequest(
        headersFor('Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36', {
          'Sec-CH-UA-Arch': '"arm"',
          'Sec-CH-UA-Mobile': '?0',
          'Sec-CH-UA-Platform': '"Linux"',
        }),
      ),
    ).resolves.toEqual({
      os: OS.linux,
      spec: PlatformSpec.ARMPortable,
      target: Target.linuxArm,
    })
  })

  describe('isMobileDevice', () => {
    it('classifies wearable user agents as mobile devices', async () => {
      const headers = headersFor(
        'Mozilla/5.0 (Linux; Android 13; Google Pixel Watch Build/TWD9.230205.001) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      )

      await expect(parseUA(headers)).resolves.toMatchObject({
        device: { type: 'wearable' },
      })
      await expect(isMobileDevice(headers)).resolves.toBe(true)
      await expect(detectRequestPlatform(headers)).resolves.toMatchObject({
        isMobile: true,
      })
    })
  })
})
