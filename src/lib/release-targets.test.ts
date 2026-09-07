import { describe, expect, it } from 'vitest'
import { matchReleaseTargets } from './release-targets'
import { getDownloadLink, Target } from './target'

describe('release asset matching', () => {
  it('only offers targets with an actual matching installer', () => {
    const files = [
      'poi-setup-12.0.1.exe',
      'poi-12.0.1-arm64-win.7z',
      'poi-12.0.1.dmg',
      'poi-12.0.1-arm64.dmg',
      'poi-12.0.1.7z',
      'poi_12.0.1_arm64.deb',
    ]
    const targets = matchReleaseTargets('v12.0.1', files)
    expect(targets).toContain(Target.win64Setup)
    expect(targets).toContain(Target.winArm)
    expect(targets).toContain(Target.macos)
    expect(targets).toContain(Target.macosArm)
    expect(targets).toContain(Target.linux)
    expect(targets).toContain(Target.linuxDebArm)
    expect(targets).not.toContain(Target.win32)
    expect(targets).not.toContain(Target.win32Setup)
    expect(targets).not.toContain(Target.linuxRpm)
    for (const target of targets)
      expect(files).toContain(
        getDownloadLink('v12.0.1', target).replace('/dist/', ''),
      )
  })
  it('does not offer guessed downloads when the release has no assets', () => {
    expect(matchReleaseTargets('v12.0.1', [])).toEqual([])
  })
  it('keeps the 32-bit installer for releases that include ia32 packages', () => {
    expect(
      matchReleaseTargets('v10.9.2', [
        'poi-setup-10.9.2.exe',
        'poi-10.9.2-ia32-win.7z',
      ]),
    ).toContain(Target.win32Setup)
  })
})
