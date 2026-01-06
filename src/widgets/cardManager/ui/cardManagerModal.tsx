import { useState, useEffect } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { v4 as uuidv4 } from 'uuid'
import {
  Dialog,
  Input,
  Button,
  VStack,
  Field,
  NativeSelectRoot,
  NativeSelectField,
  HStack,
} from '@chakra-ui/react'
import { cardsAtom, selectedCardAtom } from '@/entities/card'
import { transactionsAtom } from '@/entities/transaction'
import type { Card, CardType } from '@/shared/types'
import { useTranslation } from 'react-i18next'

type CardManagerModalProps = {
  isOpen: boolean
  onClose: () => void
  editingCard?: Card
}

const CARD_COLORS = [
  { label: 'Blue', value: '#3182CE' },
  { label: 'Purple', value: '#805AD5' },
  { label: 'Green', value: '#38A169' },
  { label: 'Orange', value: '#DD6B20' },
  { label: 'Red', value: '#E53E3E' },
  { label: 'Pink', value: '#D53F8C' },
  { label: 'Teal', value: '#319795' },
]

export const CardManagerModal = ({
  isOpen,
  onClose,
  editingCard,
}: CardManagerModalProps) => {
  const { t } = useTranslation()
  const [cards, setCards] = useAtom(cardsAtom)
  const [transactions, setTransactions] = useAtom(transactionsAtom)
  const setSelectedCard = useSetAtom(selectedCardAtom)
  const [name, setName] = useState(editingCard?.name ?? '')
  const [type, setType] = useState<CardType>(editingCard?.type ?? 'debit')
  const [color, setColor] = useState(editingCard?.color ?? CARD_COLORS[0].value)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (editingCard) {
      setName(editingCard.name)
      setType(editingCard.type)
      setColor(editingCard.color)
    } else {
      setName('')
      setType('debit')
      setColor(CARD_COLORS[0].value)
    }
  }, [editingCard])

  const handleSave = () => {
    if (!name.trim()) return

    if (editingCard) {
      setCards(
        cards.map((card) =>
          card.id === editingCard.id
            ? { ...card, name: name.trim(), type, color }
            : card
        )
      )
    } else {
      const newCard: Card = {
        id: uuidv4(),
        name: name.trim(),
        type,
        color,
      }
      setCards([...cards, newCard])
    }

    handleClose()
  }

  const handleClose = () => {
    setName('')
    setType('debit')
    setColor(CARD_COLORS[0].value)
    setShowDeleteConfirm(false)
    onClose()
  }

  const handleDelete = () => {
    if (!editingCard) return

    setCards(cards.filter((card) => card.id !== editingCard.id))
    setTransactions(transactions.filter((tx) => tx.cardId !== editingCard.id))
    setSelectedCard((current) => current === editingCard.id ? null : current)
    
    handleClose()
  }

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={(details) => !details.open && handleClose()}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              {editingCard ? t('cards.editCard') : t('cards.addCard')}
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={4} alignItems="stretch">
                <Field.Root>
                  <Field.Label>{t('cards.cardName')}</Field.Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('cards.cardNamePlaceholder')}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>{t('cards.cardType')}</Field.Label>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={type}
                      onChange={(e) => setType(e.target.value as CardType)}
                    >
                      <option value="debit">{t('cards.debit')}</option>
                      <option value="credit">{t('cards.credit')}</option>
                    </NativeSelectField>
                  </NativeSelectRoot>
                </Field.Root>

                <Field.Root>
                  <Field.Label>{t('cards.cardColor')}</Field.Label>
                  <HStack gap={2} flexWrap="wrap">
                    {CARD_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColor(c.value)}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: c.value,
                          border: color === c.value ? '3px solid black' : '2px solid #ccc',
                          cursor: 'pointer',
                        }}
                        aria-label={c.label}
                      />
                    ))}
                  </HStack>
                </Field.Root>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack justify="space-between" width="full">
                {editingCard && (
                  <Button
                    colorPalette="red"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    {t('cards.deleteCard')}
                  </Button>
                )}
                <HStack gap={2} marginLeft="auto">
                  <Button variant="outline" onClick={handleClose}>
                    {t('common.cancel')}
                  </Button>
                  <Button colorPalette="blue" onClick={handleSave} disabled={!name.trim()}>
                    {t('common.save')}
                  </Button>
                </HStack>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      <Dialog.Root open={showDeleteConfirm} onOpenChange={(details) => !details.open && setShowDeleteConfirm(false)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>{t('cards.deleteCardTitle')}</Dialog.Header>
            <Dialog.Body>
              {t('cards.deleteCardMessage')}
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                {t('common.cancel')}
              </Button>
              <Button colorPalette="red" onClick={handleDelete}>
                {t('cards.deleteCardConfirm')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  )
}

