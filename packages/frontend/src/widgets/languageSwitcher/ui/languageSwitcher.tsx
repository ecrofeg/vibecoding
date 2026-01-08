import { useTranslation } from 'react-i18next'
import { Button, HStack } from '@chakra-ui/react'

type Props = {
  className?: string
}

export const LanguageSwitcher = ({ className }: Props) => {
  const { i18n } = useTranslation()

  const currentLang = i18n.language || 'ru'
  const isRussian = currentLang === 'ru'

  const handleLanguageChange = () => {
    const newLang = isRussian ? 'en' : 'ru'
    i18n.changeLanguage(newLang)
  }

  return (
    <HStack gap={2} className={className}>
      <Button
        size="sm"
        variant={isRussian ? 'solid' : 'outline'}
        colorPalette="blue"
        onClick={handleLanguageChange}
      >
        RU
      </Button>
      <Button
        size="sm"
        variant={!isRussian ? 'solid' : 'outline'}
        colorPalette="blue"
        onClick={handleLanguageChange}
      >
        EN
      </Button>
    </HStack>
  )
}

