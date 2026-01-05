import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { clearTransactionsAtom } from '@/entities/transaction'
import { Button, Dialog } from '@chakra-ui/react'

type Props = {
  className?: string
}

export const ClearStorageButton = ({ className }: Props) => {
  const { t } = useTranslation()
  const clearTransactions = useSetAtom(clearTransactionsAtom)
  const [isOpen, setIsOpen] = useState(false)

  const handleClear = () => {
    clearTransactions()
    setIsOpen(false)
  }

  return (
    <>
      <Button
        colorPalette="red"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        {t('clearStorage.button')}
      </Button>
      <Dialog.Root open={isOpen} onOpenChange={(details) => setIsOpen(details.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>{t('clearStorage.title')}</Dialog.Header>
            <Dialog.Body>
              {t('clearStorage.message')}
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                {t('clearStorage.cancel')}
              </Button>
              <Button
                colorPalette="red"
                onClick={handleClear}
              >
                {t('clearStorage.confirm')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  )
}

