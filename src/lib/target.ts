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

const BASE_URI = 'https://npmmirror.com/mirrors/poi'
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
      return `${BASE_URI}/${version}/poi-${pure}.7z`
    case Target.linuxArm:
      return `${BASE_URI}/${version}/poi-${pure}-arm64.7z`
    case Target.linuxDeb:
      return `${BASE_URI}/${version}/poi_${pure}_amd64.deb`
    case Target.linuxDebArm:
      return `${BASE_URI}/${version}/poi_${pure}_arm64.deb`
    case Target.linuxRpm:
      return `${BASE_URI}/${version}/poi-${pure}.x86_64.rpm`
    case Target.macos:
      return `${BASE_URI}/${version}/poi-${pure}.dmg`
    case Target.macosArm:
      return `${BASE_URI}/${version}/poi-${pure}-arm64.dmg`
    case Target.win32:
      return `${BASE_URI}/${version}/poi-${pure}-ia32-win.7z`
    case Target.win32Setup:
      return `${BASE_URI}/${version}/poi-setup-${pure}.exe`
    case Target.win64:
      return `${BASE_URI}/${version}/poi-${pure}-win.7z`
    case Target.win64Setup:
      return `${BASE_URI}/${version}/poi-setup-${pure}.exe`
    case Target.winArm:
      return `${BASE_URI}/${version}/poi-${pure}-arm64-win.7z`
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
