import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const dialogSource = readFileSync(
  new URL('../src/components/ui/dialog.tsx', import.meta.url),
  'utf8',
).split('function DialogContent(')[1]!
const selectSource = readFileSync(
  new URL('../src/components/ui/select.tsx', import.meta.url),
  'utf8',
).split('function SelectContent(')[1]!
const contentClasses = /className=\{cn\(\s*'([^']+)'/
const overlayClasses = [
  ['dialog', contentClasses.exec(dialogSource)![1]!],
  [
    'select',
    contentClasses.exec(selectSource)![1]! +
      ' ' +
      /position === 'popper' &&\s*'([^']+)'/.exec(selectSource)![1]!,
  ],
]

test('shadcn overlays keep their intended position throughout animation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/en/explore', { waitUntil: 'networkidle' })

  // Use the actual component class lists against the production stylesheet.
  // Dialog and Select are reusable primitives, not currently routed page content.
  const frames = await page.evaluate((overlayClasses) => {
    const samples: Record<string, { x: number; y: number; scale: number }[]> =
      {}
    for (const [name, classes] of overlayClasses) {
      for (const state of ['open', 'closed']) {
        const element = document.createElement('div')
        element.className = classes!
        element.dataset.state = state
        element.dataset.side = 'bottom'
        Object.assign(element.style, {
          position: 'fixed',
          left: '50%',
          top: '50%',
          width: '200px',
          height: '100px',
        })
        document.body.append(element)
        const animation = element.getAnimations()[0]
        if (!animation) throw new Error('Expected overlay animation')
        animation.pause()
        animation.effect!.updateTiming({ fill: 'both', easing: 'linear' })
        const duration = Number(animation.effect!.getComputedTiming().duration)
        samples[name + '-' + state] = [0, 0.5, 1].map((progress) => {
          animation.currentTime = duration * progress
          const style = getComputedStyle(element)
          const matrix = new DOMMatrixReadOnly(style.transform)
          const rect = element.getBoundingClientRect()
          return {
            x: rect.x + rect.width / 2 - parseFloat(style.left) - 100,
            y: rect.y + rect.height / 2 - parseFloat(style.top) - 50,
            scale: matrix.a,
          }
        })
        element.remove()
      }
    }
    return samples
  }, overlayClasses)

  for (const state of ['open', 'closed']) {
    frames['dialog-' + state]!.forEach((frame, index) => {
      expect(frame.x).toBeCloseTo(-100, 1)
      expect(frame.y).toBeCloseTo(-50, 1)
      if (index === 1) {
        expect(frame.scale).toBeGreaterThan(0.95)
        expect(frame.scale).toBeLessThan(1)
      } else {
        const progress = state === 'open' ? index / 2 : 1 - index / 2
        expect(frame.scale).toBeCloseTo(0.95 + progress * 0.05, 3)
      }
    })
  }
  // Popper's 4px gap remains in place while its independent 8px slide settles.
  for (const [name, offsets] of Object.entries({
    'select-open': [-4, 0, 4],
    'select-closed': [4, 4, 4],
  })) {
    frames[name]!.forEach((frame, index) => {
      expect(frame.x).toBeCloseTo(0, 1)
      if (name === 'select-open' && index === 1) {
        expect(frame.y).toBeGreaterThan(-4)
        expect(frame.y).toBeLessThan(4)
      } else {
        expect(frame.y).toBeCloseTo(offsets[index]!, 1)
      }
    })
  }
})
