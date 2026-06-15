'use client'

import { useState } from 'react'
import { FONT_PRESETS, THEME_OPTIONS, type BodyFont, type Theme } from '@/lib/appearance'
import { UiButton, UiInput } from '@/components/ui/primitives'
import {
  DEFAULT_TYPOGRAPHY_PRESETS,
  normalizeTypographyPresetsConfig,
  TYPOGRAPHY_PRESET_OPTIONS,
  type TypographyPresetId,
  type TypographyPresetsConfig,
  type TypographyPresetTokens,
} from '@/lib/typography'

interface Props {
  initialTheme: Theme
  initialFont: BodyFont
  initialTypographyPresets?: string
  onSave: (values: {
    theme: Theme
    font: BodyFont
    typographyPresets: TypographyPresetsConfig
  }) => void | Promise<void>
  saving: boolean
}

export function ThemeManager({
  initialTheme,
  initialFont,
  initialTypographyPresets = '',
  onSave,
  saving,
}: Props) {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(initialTheme)
  const [selectedFont, setSelectedFont] = useState<BodyFont>(initialFont)
  const [typographyPresets, setTypographyPresets] = useState<TypographyPresetsConfig>(
    normalizeTypographyPresetsConfig(initialTypographyPresets),
  )

  const currentFont = FONT_PRESETS.find((preset) => preset.id === selectedFont) || FONT_PRESETS[0]
  const updateTypographyToken = (
    preset: TypographyPresetId,
    key: keyof TypographyPresetTokens,
    value: string,
  ) => {
    setTypographyPresets((current) => ({
      ...current,
      [preset]: {
        ...current[preset],
        [key]: value,
      },
    }) as unknown as TypographyPresetsConfig)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-base font-medium text-[var(--editor-ink)]">默认主题</h3>
        <p className="text-sm text-[var(--editor-muted)]">
          这里设置的是网站首次访问时的默认主题。访客后续如果自己切换主题，会优先使用本地保存的偏好。
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {THEME_OPTIONS.map((theme) => (
            <label
              key={theme.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                selectedTheme === theme.id
                  ? 'border-[var(--editor-accent)] bg-[var(--editor-accent)]/5'
                  : 'border-[var(--editor-line)] bg-[var(--editor-panel)] hover:border-[var(--editor-soft)]'
              }`}
            >
              <input
                type="radio"
                name="default-theme"
                value={theme.id}
                checked={selectedTheme === theme.id}
                onChange={() => setSelectedTheme(theme.id)}
                className="mt-1 accent-[var(--editor-accent)]"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-[var(--editor-ink)]">{theme.label}</div>
                <p className="mt-1 text-sm leading-relaxed text-[var(--editor-muted)]">{theme.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-medium text-[var(--editor-ink)]">正文字体</h3>
        <p className="text-sm text-[var(--editor-muted)]">
          设置前台文章正文的字体。主题控制首页风格，字体控制阅读正文体验。
        </p>
        <div className="grid gap-3">
          {FONT_PRESETS.map((preset) => (
            <label
              key={preset.id}
              className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                selectedFont === preset.id
                  ? 'border-[var(--editor-accent)] bg-[var(--editor-accent)]/5'
                  : 'border-[var(--editor-line)] bg-[var(--editor-panel)] hover:border-[var(--editor-soft)]'
              }`}
            >
              <input
                type="radio"
                name="body-font"
                value={preset.id}
                checked={selectedFont === preset.id}
                onChange={() => setSelectedFont(preset.id)}
                className="mt-1 accent-[var(--editor-accent)]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--editor-ink)]">{preset.name}</span>
                  <span className="text-xs text-[var(--stone-gray)]">{preset.desc}</span>
                </div>
                <p
                  className="mt-1 text-sm leading-relaxed text-[var(--editor-muted)]"
                  style={{ fontFamily: preset.family || 'inherit' }}
                >
                  白日依山尽，黄河入海流。The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {currentFont.needsLoad && (
        <p className="text-xs text-[var(--stone-gray)]">
          当前字体需要从 CDN 加载（约 4MB），首次加载后会被浏览器缓存。
        </p>
      )}

      <div className="space-y-3">
        <div>
          <h3 className="text-base font-medium text-[var(--editor-ink)]">文章排版</h3>
          <p className="mt-1 text-sm text-[var(--editor-muted)]">
            编辑器、前台文章、公众号复制与导出共用这些参数。
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {TYPOGRAPHY_PRESET_OPTIONS.map((option) => {
            const tokens = typographyPresets[option.id]
            return (
              <section
                key={option.id}
                className="rounded-xl border border-[var(--editor-line)] bg-[var(--editor-panel)] p-4"
              >
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-[var(--editor-ink)]">{option.label}</h4>
                  <p className="mt-0.5 text-xs leading-5 text-[var(--editor-muted)]">{option.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    ['fontSize', '字号', 'px', '0.5'],
                    ['lineHeight', '行高', '', '0.01'],
                    ['letterSpacing', '字距', 'em', '0.01'],
                    ['paragraphSpacing', '段距', 'em', '0.05'],
                  ] as const).map(([key, label, unit, step]) => (
                    <label key={key} className="text-xs text-[var(--editor-muted)]">
                      <span className="mb-1.5 block">{label}{unit ? ` (${unit})` : ''}</span>
                      <UiInput
                        type="number"
                        step={step}
                        value={tokens[key]}
                        onChange={(event) => updateTypographyToken(option.id, key, event.target.value)}
                        className="ui-control h-10 px-3 text-[var(--editor-ink)]"
                      />
                    </label>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
        <UiButton
          type="button"
          tone="quiet"
          onClick={() => setTypographyPresets(DEFAULT_TYPOGRAPHY_PRESETS)}
        >
          恢复推荐值
        </UiButton>
      </div>

      <UiButton
        onClick={() => void onSave({
          theme: selectedTheme,
          font: selectedFont,
          typographyPresets: normalizeTypographyPresetsConfig(typographyPresets),
        })}
        disabled={saving}
        tone="solid"
      >
        {saving ? '保存中...' : '保存主题管理设置'}
      </UiButton>
    </div>
  )
}
