const normalizeSpacing = (value: string): string => value.replace(/\s+/g, ' ').trim()

export const normalizeMerchant = (value: string): string => {
  if (!value) {
    return ''
  }

  const lowered = value.toLowerCase()
  const stripped = lowered.replace(/[^\p{L}\p{N}]+/gu, ' ')
  return normalizeSpacing(stripped)
}
