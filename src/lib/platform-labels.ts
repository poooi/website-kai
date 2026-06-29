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
