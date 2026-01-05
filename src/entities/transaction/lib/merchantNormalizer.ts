const MERCHANT_PATTERNS = [
  { pattern: /яндекс\.?еда/i, normalized: 'Яндекс Еда' },
  { pattern: /delivery club|деливери клаб/i, normalized: 'Delivery Club' },
  { pattern: /самокат/i, normalized: 'Самокат' },
  { pattern: /пятёрочка|пятерочка|pyaterochka/i, normalized: 'Пятёрочка' },
  { pattern: /магнит/i, normalized: 'Магнит' },
  { pattern: /перекрёсток|перекресток/i, normalized: 'Перекрёсток' },
  { pattern: /ашан/i, normalized: 'Ашан' },
  { pattern: /макдональдс|mcdonald/i, normalized: 'McDonalds' },
  { pattern: /kfc|кфс/i, normalized: 'KFC' },
  { pattern: /бургер кинг|burger king/i, normalized: 'Burger King' },
  { pattern: /старбакс|starbucks/i, normalized: 'Starbucks' },
  { pattern: /яндекс\.?такси|yandex taxi/i, normalized: 'Яндекс Такси' },
  { pattern: /uber|убер/i, normalized: 'Uber' },
  { pattern: /bolt|болт/i, normalized: 'Bolt' },
  { pattern: /метро|metro card/i, normalized: 'Метро' },
  { pattern: /сбп/i, normalized: 'СБП' },
  { pattern: /ozon|озон/i, normalized: 'Ozon' },
  { pattern: /wildberries|вайлдберриз/i, normalized: 'Wildberries' },
  { pattern: /aliexpress|али[её]кспресс/i, normalized: 'AliExpress' },
  { pattern: /netflix|нетфликс/i, normalized: 'Netflix' },
  { pattern: /spotify|спотифай/i, normalized: 'Spotify' },
  { pattern: /apple|эпл/i, normalized: 'Apple' },
  { pattern: /google|гугл/i, normalized: 'Google' },
  { pattern: /yandex\.?plus|яндекс\.?плюс/i, normalized: 'Яндекс Плюс' },
]

export const normalizeMerchantName = (raw: string): string => {
  const cleaned = raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')

  for (const { pattern, normalized } of MERCHANT_PATTERNS) {
    if (pattern.test(cleaned)) {
      return normalized
    }
  }

  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\u0400-\u04FF-]/g, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .slice(0, 100)
}

export const extractCardLast4 = (description: string): string | null => {
  const match = description.match(/\*{4}(\d{4})|(\d{4})\s*$/i)
  return match ? (match[1] || match[2]) : null
}
