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

export enum CPU {
  x64 = 'x64',
  ia32 = 'ia32',
  arm = 'arm',
}

export enum LinuxPackageFormat {
  deb = 'deb',
  rpm = 'rpm',
}

export enum DistributionType {
  setup = 'setup',
  portable = 'portable',
}

export enum PlatformSpec {
  X64Setup = 'x64Setup', // setup for windows x64 and macOS Intel
  X64Portable = 'x64Portable', // portable for windows x64 and Linux x64
  IA32Setup = 'ia32Setup', // setup for windows x86
  IA32Portable = 'ia32Portable', // portable for windows x86
  ARM = 'arm', // setup for windows ARM and macOS Apple silicon
  X64DEB = 'x64DEB', // deb package for linux x64
  x64RPM = 'x64RPM', // rpm package for linux x64
  ARMDEB = 'armDEB', // deb package for linux ARM
  ARMPortable = 'armPortable', // currently for linux only, windows ARM is always setup
}

export const platformToTarget = {
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
    [PlatformSpec.x64RPM]: Target.linuxRpm,
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
      return `/dist/${version}/poi-${pure}.7z`
    case Target.linuxArm:
      return `/dist/${version}/poi-${pure}-arm64.7z`
    case Target.linuxDeb:
      return `/dist/${version}/poi_${pure}_amd64.deb`
    case Target.linuxDebArm:
      return `/dist/${version}/poi_${pure}_arm64.deb`
    case Target.linuxRpm:
      return `/dist/${version}/poi-${pure}.x86_64.rpm`
    case Target.macos:
      return `/dist/${version}/poi-${pure}.dmg`
    case Target.macosArm:
      return `/dist/${version}/poi-${pure}-arm64.dmg`
    case Target.win32:
      return `/dist/${version}/poi-${pure}-ia32-win.7z`
    case Target.win32Setup:
      return `/dist/${version}/poi-setup-${pure}.exe`
    case Target.win64:
      return `/dist/${version}/poi-${pure}-win.7z`
    case Target.win64Setup:
      return `/dist/${version}/poi-setup-${pure}.exe`
    case Target.winArm:
      return `/dist/${version}/poi-${pure}-arm64-win.7z`
    default:
      return DEFAULT_URI
  }
}

export const detectTarget = (ua: string) => {
  const { os, cpu } = new UAParser(ua).getResult()
  if (os.name === 'Linux') {
    if (cpu.architecture === 'arm64' || cpu.architecture === 'arm') {
      return Target.linuxArm
    }
    return Target.linux
  }
  if (os.name === 'Debian' || os.name === 'Ubuntu') {
    if (cpu.architecture === 'arm64' || cpu.architecture === 'arm') {
      return Target.linuxDebArm
    }
    return Target.linuxDeb
  }
  if (os.name === 'CentOS' || os.name === 'Fedora') {
    return Target.linuxRpm
  }
  if (os.name === 'Mac OS') {
    if (cpu.architecture === 'arm64' || cpu.architecture === 'arm') {
      return Target.macosArm
    }
    return Target.macos
  }
  if (os.name === 'Windows') {
    if (cpu.architecture === 'ia64' || cpu.architecture === 'amd64') {
      return Target.win64Setup
    }
    return Target.win32Setup
  }
  return Target.linux
}
