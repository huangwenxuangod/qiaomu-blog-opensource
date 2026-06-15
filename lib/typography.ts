export const TYPOGRAPHY_PRESET_IDS = ['compact', 'standard', 'relaxed', 'wechat'] as const

export type TypographyPresetId = (typeof TYPOGRAPHY_PRESET_IDS)[number]

export interface TypographyPresetTokens {
  fontSize: number
  lineHeight: number
  letterSpacing: number
  paragraphSpacing: number
}

export type TypographyPresetsConfig = Record<TypographyPresetId, TypographyPresetTokens>

export const TYPOGRAPHY_PRESET_OPTIONS: Array<{
  id: TypographyPresetId
  label: string
  description: string
}> = [
  { id: 'compact', label: '紧凑', description: '信息密度更高，适合短篇和工具说明。' },
  { id: 'standard', label: '标准', description: '均衡的默认阅读节奏，适合大多数文章。' },
  { id: 'relaxed', label: '舒展', description: '更宽松的行距和段距，适合长文阅读。' },
  { id: 'wechat', label: '公众号', description: '针对公众号阅读与复制做稳定适配。' },
]

export const DEFAULT_TYPOGRAPHY_PRESETS: TypographyPresetsConfig = {
  compact: {
    fontSize: 16,
    lineHeight: 1.68,
    letterSpacing: 0,
    paragraphSpacing: 0.9,
  },
  standard: {
    fontSize: 17,
    lineHeight: 1.86,
    letterSpacing: 0,
    paragraphSpacing: 1.15,
  },
  relaxed: {
    fontSize: 17,
    lineHeight: 1.96,
    letterSpacing: 0.01,
    paragraphSpacing: 1.45,
  },
  wechat: {
    fontSize: 17,
    lineHeight: 1.78,
    letterSpacing: 0,
    paragraphSpacing: 1.45,
  },
}

const TOKEN_LIMITS = {
  fontSize: [14, 24],
  lineHeight: [1.35, 2.4],
  letterSpacing: [-0.03, 0.12],
  paragraphSpacing: [0.5, 2.5],
} as const

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return Math.min(max, Math.max(min, numeric))
}

export function normalizeTypographyPreset(value: unknown): TypographyPresetId {
  return TYPOGRAPHY_PRESET_IDS.includes(value as TypographyPresetId)
    ? value as TypographyPresetId
    : 'standard'
}

export function normalizeTypographyPresetsConfig(value: unknown): TypographyPresetsConfig {
  let source = value
  if (typeof value === 'string' && value.trim()) {
    try {
      source = JSON.parse(value)
    } catch {
      source = null
    }
  }

  const input = source && typeof source === 'object'
    ? source as Partial<Record<TypographyPresetId, Partial<TypographyPresetTokens>>>
    : {}

  return Object.fromEntries(
    TYPOGRAPHY_PRESET_IDS.map((id) => {
      const defaults = DEFAULT_TYPOGRAPHY_PRESETS[id]
      const tokens = input[id] || {}
      return [
        id,
        {
          fontSize: clampNumber(tokens.fontSize, defaults.fontSize, ...TOKEN_LIMITS.fontSize),
          lineHeight: clampNumber(tokens.lineHeight, defaults.lineHeight, ...TOKEN_LIMITS.lineHeight),
          letterSpacing: clampNumber(tokens.letterSpacing, defaults.letterSpacing, ...TOKEN_LIMITS.letterSpacing),
          paragraphSpacing: clampNumber(tokens.paragraphSpacing, defaults.paragraphSpacing, ...TOKEN_LIMITS.paragraphSpacing),
        },
      ]
    }),
  ) as TypographyPresetsConfig
}

export function buildTypographyStyleVariables(config: TypographyPresetsConfig) {
  return Object.fromEntries(
    TYPOGRAPHY_PRESET_IDS.flatMap((id) => {
      const tokens = config[id]
      return [
        [`--typography-${id}-font-size`, `${tokens.fontSize}px`],
        [`--typography-${id}-line-height`, String(tokens.lineHeight)],
        [`--typography-${id}-letter-spacing`, `${tokens.letterSpacing}em`],
        [`--typography-${id}-paragraph-spacing`, `${tokens.paragraphSpacing}em`],
      ]
    }),
  ) as Record<string, string>
}

export function buildTypographyPresetCss(
  rootSelector: string,
  config: TypographyPresetsConfig,
) {
  return TYPOGRAPHY_PRESET_IDS.map((id) => {
    const tokens = config[id]
    return `
${rootSelector}[data-typography-preset="${id}"],
${rootSelector} [data-typography-preset="${id}"] {
  font-size: ${tokens.fontSize}px;
  line-height: ${tokens.lineHeight};
  letter-spacing: ${tokens.letterSpacing}em;
}

${rootSelector} [data-typography-preset="${id}"] {
  margin-top: ${tokens.paragraphSpacing}em;
  margin-bottom: ${tokens.paragraphSpacing}em;
}`.trim()
  }).join('\n\n')
}
