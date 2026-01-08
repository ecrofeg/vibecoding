import { useSetAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { searchFilterAtom } from '@/entities/transaction'
import { Input } from '@chakra-ui/react'
import { useState, useEffect } from 'react'

type Props = {
  className?: string
}

export const SearchInput = ({ className }: Props) => {
  const { t } = useTranslation()
  const setSearchQuery = useSetAtom(searchFilterAtom)
  const [localSearchValue, setLocalSearchValue] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedValue = localSearchValue.trim()
      if (trimmedValue.length >= 3) {
        setSearchQuery(trimmedValue)
      } else {
        setSearchQuery('')
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [localSearchValue, setSearchQuery])

  return (
    <Input
      placeholder={t('transactionsList.searchPlaceholder')}
      value={localSearchValue}
      onChange={(e) => setLocalSearchValue(e.target.value)}
      className={className}
    />
  )
}

