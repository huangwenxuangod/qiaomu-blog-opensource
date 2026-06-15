import { describe, expect, it } from 'vitest'
import {
  buildTypographyStyleVariables,
  DEFAULT_TYPOGRAPHY_PRESETS,
  normalizeTypographyPreset,
  normalizeTypographyPresetsConfig,
} from '@/lib/typography'

describe('article typography', () => {
  it('normalizes unknown article presets to standard', () => {
    expect(normalizeTypographyPreset('relaxed')).toBe('relaxed')
    expect(normalizeTypographyPreset('nyt')).toBe('standard')
    expect(normalizeTypographyPreset(null)).toBe('standard')
  })

  it('merges saved settings with safe limits', () => {
    const config = normalizeTypographyPresetsConfig(JSON.stringify({
      compact: {
        fontSize: 99,
        lineHeight: 0.2,
        letterSpacing: 0.05,
        paragraphSpacing: 1.2,
      },
    }))

    expect(config.compact).toEqual({
      fontSize: 24,
      lineHeight: 1.35,
      letterSpacing: 0.05,
      paragraphSpacing: 1.2,
    })
    expect(config.standard).toEqual(DEFAULT_TYPOGRAPHY_PRESETS.standard)
  })

  it('creates variables for every rendering surface', () => {
    const variables = buildTypographyStyleVariables(DEFAULT_TYPOGRAPHY_PRESETS)

    expect(variables['--typography-standard-font-size']).toBe('17px')
    expect(variables['--typography-relaxed-line-height']).toBe('1.96')
    expect(variables['--typography-wechat-paragraph-spacing']).toBe('1.45em')
  })
})
