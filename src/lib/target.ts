import trimStart from 'lodash/trimStart'
import { UAParser } from 'ua-parser-js'

export enum Target {
  linux = 'linux-x64',
  linuxArm = 'linux-arm',
  linuxDeb = 'linux-deb-x64',
  linuxDebArm = 'linux-deb-arm',
  linuxRpm = 'linux-rpm-x64',
  macos = 'macos-x64',
  macosArm = 'macos-arm',
  win64Setup = 'win-x64-setup',
  win64 = 'win-x64',
  win32Setup = 'win-ia32-setup',
  win32 = 'win-ia32',
  winArm = 'win-arm',
}

export enum OS {
  windows = 'windows',
  macos = 'macos',
  linux = 'linux',
}

export enum PlatformSpec {
  X64Setup = 'x64Setup', // setup for windows x64 and macOS Intel
  X64Portable = 'x64Portable', // portable for windows x64 and Linux x64
  IA32Setup = 'ia32Setup', // setup for windows x86
  IA32Portable = 'ia32Portable', // portable for windows x86
  ARM = 'arm', // setup for windows ARM and macOS Apple silicon
  X64DEB = 'x64DEB', // deb package for linux x64
  X64RPM = 'x64RPM', // rpm package for linux x64
  ARMDEB = 'armDEB', // deb package for linux ARM
  ARMPortable = 'armPortable', // currently for linux only, windows ARM is always setup
}

export const platformToTarget: Record<
  OS,
  Partial<Record<PlatformSpec, Target>>
> = {
  [OS.windows]: {
    [PlatformSpec.X64Setup]: Target.win64Setup,
    [PlatformSpec.X64Portable]: Target.win64,
    [PlatformSpec.IA32Setup]: Target.win32Setup,
    [PlatformSpec.IA32Portable]: Target.win32,
    [PlatformSpec.ARM]: Target.winArm,
  },
  [OS.macos]: {
    [PlatformSpec.X64Setup]: Target.macos,
    [PlatformSpec.ARM]: Target.macosArm,
  },
  [OS.linux]: {
    [PlatformSpec.X64DEB]: Target.linuxDeb,
    [PlatformSpec.X64RPM]: Target.linuxRpm,
    [PlatformSpec.X64Portable]: Target.linux,
    [PlatformSpec.ARMDEB]: Target.linuxDebArm,
    [PlatformSpec.ARMPortable]: Target.linuxArm,
  },
}

const DEFAULT_URI = 'https://github.com/poooi/poi/releases'

// the semver-regex package does not support `-beta.0` prerelase version, have to host one here
// copied from https://regex101.com/r/vkijKf/1/ which is suggested by semver.org
const semverRegex =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/

export const getDownloadLink = (
  version: string | undefined,
  target: Target,
) => {
  const pure = trimStart(version, 'v')
  if (!semverRegex.test(pure)) {
    return DEFAULT_URI
  }
  switch (target) {
    case Target.linux:
      return `/dist/poi-${pure}.7z`
    case Target.linuxArm:
      return `/dist/poi-${pure}-arm64.7z`
    case Target.linuxDeb:
      return `/dist/poi_${pure}_amd64.deb`
    case Target.linuxDebArm:
      return `/dist/poi_${pure}_arm64.deb`
    case Target.linuxRpm:
      return `/dist/poi-${pure}.x86_64.rpm`
    case Target.macos:
      return `/dist/poi-${pure}.dmg`
    case Target.macosArm:
      return `/dist/poi-${pure}-arm64.dmg`
    case Target.win32:
      return `/dist/poi-${pure}-ia32-win.7z`
    case Target.win32Setup:
      return `/dist/poi-setup-${pure}.exe`
    case Target.win64:
      return `/dist/poi-${pure}-win.7z`
    case Target.win64Setup:
      return `/dist/poi-setup-${pure}.exe`
    case Target.winArm:
      return `/dist/poi-${pure}-arm64-win.7z`
    default:
      return DEFAULT_URI
  }
}

export interface DetectionResult {
  os: OS
  spec: PlatformSpec
  target: Target
}

export interface RequestPlatformResult extends DetectionResult {
  isMobile: boolean
}

export const parseUA = async (headers: Headers) => {
  return UAParser(Object.fromEntries(headers)).withClientHints()
}

const parseRawUA = async (headers: Headers) => {
  return UAParser(Object.fromEntries(headers))
}

const normalizeClientHintValue = (value: string | null) =>
  value?.trim().replace(/^"|"$/g, '')

const detectClientHintArchitecture = (headers: Headers) => {
  const arch = normalizeClientHintValue(headers.get('Sec-CH-UA-Arch'))
    ?.toLowerCase()
    .replace('-', '_')
  const bitness = normalizeClientHintValue(headers.get('Sec-CH-UA-Bitness'))

  if (arch === 'aarch64' || arch === 'arm64') {
    return 'arm64'
  }
  if (arch === 'arm') {
    if (bitness === '64') {
      return 'arm64'
    }
    if (bitness === '32') {
      return 'arm'
    }
    return undefined
  }
  if (arch === 'x86') {
    if (bitness === '64') {
      return 'amd64'
    }
    if (bitness === '32') {
      return 'ia32'
    }
    return undefined
  }
  if (arch === 'x86_64') {
    return 'amd64'
  }

  return undefined
}

const detectClientHintOS = (headers: Headers) => {
  const platform = normalizeClientHintValue(
    headers.get('Sec-CH-UA-Platform'),
  )?.toLowerCase()

  switch (platform) {
    case 'windows':
      return 'Windows'
    case 'macos':
      return 'macOS'
    // Keep Linux distro names from the UA when available; "Linux" from
    // Client Hints is too generic to choose deb/rpm packages.
    case 'linux':
      return 'Linux'
    default:
      return undefined
  }
}

const isMobileUA = (ua: Awaited<ReturnType<typeof parseUA>>) => {
  return [
    'mobile',
    'tablet',
    'console',
    'smarttv',
    'wearable',
    'embedded',
  ].includes(ua.device.type!)
}

export const isMobileDevice = async (headers: Headers) => {
  return isMobileUA(await parseUA(headers))
}

const detectTargetFromUA = (
  ua: Awaited<ReturnType<typeof parseUA>>,
  hints?: { architecture?: string; os?: string },
): DetectionResult => {
  const osName =
    hints?.os === 'Linux' ? (ua.os.name ?? hints.os) : (hints?.os ?? ua.os.name)
  const architecture = hints?.architecture ?? ua.cpu.architecture

  if (osName === 'Linux') {
    if (architecture === 'arm64' || architecture === 'arm') {
      return {
        os: OS.linux,
        spec: PlatformSpec.ARMPortable,
        target: Target.linuxArm,
      }
    }
    return {
      os: OS.linux,
      spec: PlatformSpec.X64Portable,
      target: Target.linux,
    }
  }

  if (osName === 'Debian' || osName === 'Ubuntu') {
    if (architecture === 'arm64' || architecture === 'arm') {
      return {
        os: OS.linux,
        spec: PlatformSpec.ARMDEB,
        target: Target.linuxDebArm,
      }
    }

    return {
      os: OS.linux,
      spec: PlatformSpec.X64DEB,
      target: Target.linuxDeb,
    }
  }
  if (osName === 'CentOS' || osName === 'Fedora') {
    if (architecture === 'arm64' || architecture === 'arm') {
      return {
        os: OS.linux,
        spec: PlatformSpec.ARMPortable,
        target: Target.linuxArm,
      }
    }
    return {
      os: OS.linux,
      spec: PlatformSpec.X64RPM,
      target: Target.linuxRpm,
    }
  }
  if (osName === 'macOS') {
    if (architecture === 'arm64' || architecture === 'arm') {
      return {
        os: OS.macos,
        spec: PlatformSpec.ARM,
        target: Target.macosArm,
      }
    }
    return {
      os: OS.macos,
      spec: PlatformSpec.X64Setup,
      target: Target.macos,
    }
  }
  if (osName === 'Windows') {
    if (architecture === 'arm64' || architecture === 'arm') {
      return {
        os: OS.windows,
        spec: PlatformSpec.ARM,
        target: Target.winArm,
      }
    }
    if (architecture === 'ia64' || architecture === 'amd64') {
      return {
        os: OS.windows,
        spec: PlatformSpec.X64Setup,
        target: Target.win64Setup,
      }
    }
    return {
      os: OS.windows,
      spec: PlatformSpec.IA32Setup,
      target: Target.win32Setup,
    }
  }
  return {
    os: OS.linux,
    spec: PlatformSpec.X64Portable,
    target: Target.linux,
  }
}

export const detectTargetFromRequest = async (
  headers: Headers,
): Promise<DetectionResult> => {
  return detectTargetFromUA(await parseRawUA(headers), {
    architecture: detectClientHintArchitecture(headers),
    os: detectClientHintOS(headers),
  })
}

export const detectRequestPlatform = async (
  headers: Headers,
): Promise<RequestPlatformResult> => {
  const ua = await parseUA(headers)
  return {
    ...detectTargetFromUA(await parseRawUA(headers), {
      architecture: detectClientHintArchitecture(headers),
      os: detectClientHintOS(headers),
    }),
    isMobile: isMobileUA(ua),
  }
}
