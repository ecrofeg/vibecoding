import { useAtom } from 'jotai'
import { Tabs, Button, HStack, IconButton } from '@chakra-ui/react'
import { cardsAtom, selectedCardAtom } from '@/entities/card'
import { useTranslation } from 'react-i18next'
import type { Card } from '@/shared/types'

type CardTabsProps = {
  onAddCard: () => void
  onEditCard: (card: Card) => void
}

export const CardTabs = ({ onAddCard, onEditCard }: CardTabsProps) => {
  const { t } = useTranslation()
  const [cards] = useAtom(cardsAtom)
  const [selectedCard, setSelectedCard] = useAtom(selectedCardAtom)

  const tabValue = selectedCard ?? 'all'

  const handleTabChange = (value: string) => {
    setSelectedCard(value === 'all' ? null : value)
  }

  const handleEditClick = (e: React.MouseEvent, card: Card) => {
    e.stopPropagation()
    onEditCard(card)
  }

  return (
    <HStack gap={4} width="full" alignItems="center" flexWrap="wrap">
      <Tabs.Root 
        value={tabValue} 
        onValueChange={(e) => handleTabChange(e.value)}
        variant="enclosed"
        colorPalette="blue"
        flex="1"
      >
        <Tabs.List>
          <Tabs.Trigger value="all">
            {t('cards.allCards')}
          </Tabs.Trigger>
          {cards.map((card) => (
            <Tabs.Trigger key={card.id} value={card.id}>
              <HStack gap={2}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: card.color,
                  }}
                />
                <span>{card.name}</span>
                <IconButton
                  aria-label="Edit card"
                  size="xs"
                  variant="ghost"
                  onClick={(e) => handleEditClick(e, card)}
                >
                  ✏️
                </IconButton>
              </HStack>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      <Button onClick={onAddCard} size="sm" colorPalette="blue">
        {t('cards.addCard')}
      </Button>
    </HStack>
  )
}

