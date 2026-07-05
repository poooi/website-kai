import { OS, PlatformSpec } from '~/lib/target'
import { m } from '~/paraglide/messages'

export const getPlatformLabels = () => ({
  os: {
    [OS.windows]: m.windows(),
    [OS.macos]: m.macos(),
    [OS.linux]: m.linux(),
  },
  spec: {
    [PlatformSpec.X64Setup]: m.x64Setup(),
    [PlatformSpec.X64Portable]: m.x64Portable(),
    [PlatformSpec.IA32Setup]: m.ia32Setup(),
    [PlatformSpec.IA32Portable]: m.ia32Portable(),
    [PlatformSpec.ARM]: m.arm(),
    [PlatformSpec.X64DEB]: m.x64DEB(),
    [PlatformSpec.X64RPM]: m.x64RPM(),
    [PlatformSpec.ARMDEB]: m.armDEB(),
    [PlatformSpec.ARMPortable]: m.armPortable(),
  },
})

export const getPlatformSpecLabel = (os: OS, spec: PlatformSpec) => {
  if (os === OS.windows) {
    switch (spec) {
      case PlatformSpec.X64Setup:
        return m.windowsX64Setup()
      case PlatformSpec.X64Portable:
        return m.windowsX64Portable()
      case PlatformSpec.IA32Setup:
        return m.windowsIA32Setup()
      case PlatformSpec.IA32Portable:
        return m.windowsIA32Portable()
      case PlatformSpec.ARM:
        return m.windowsARM()
    }
  }

  if (os === OS.macos) {
    switch (spec) {
      case PlatformSpec.X64Setup:
        return m.macosIntel()
      case PlatformSpec.ARM:
        return m.macosAppleSilicon()
    }
  }

  if (os === OS.linux) {
    switch (spec) {
      case PlatformSpec.X64DEB:
        return m.linuxX64DEB()
      case PlatformSpec.X64RPM:
        return m.linuxX64RPM()
      case PlatformSpec.X64Portable:
        return m.linuxX64Portable()
      case PlatformSpec.ARMDEB:
        return m.linuxARMDEB()
      case PlatformSpec.ARMPortable:
        return m.linuxARMPortable()
    }
  }

  return getPlatformLabels().spec[spec]
}
