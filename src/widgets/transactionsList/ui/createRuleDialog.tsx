import { useState } from 'react'
import { 
  Dialog, 
  Button, 
  VStack, 
  Text,
  Field,
  Input,
  RadioGroup,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import type { Rule, MatchType } from '../../../shared/types'

type Props = {
  open: boolean
  onClose: () => void
  merchantNorm: string
  categoryId: string
  needType: Rule['needType']
  onSave: (rule: Rule) => void
}

export const CreateRuleDialog = ({
  open,
  onClose,
  merchantNorm,
  categoryId,
  needType,
  onSave,
}: Props) => {
  const { t } = useTranslation()
  const [matchType, setMatchType] = useState<MatchType>('exact')
  const [pattern, setPattern] = useState(merchantNorm.toLowerCase())

  const handleSave = () => {
    const rule: Rule = {
      id: uuidv4(),
      priority: Date.now(),
      matchType,
      pattern,
      targetMerchantNorm: merchantNorm,
      categoryId,
      needType,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    onSave(rule)
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              {t('createRule.title', 'Create categorization rule')}
            </Dialog.Title>
          </Dialog.Header>
          
          <Dialog.Body>
            <VStack gap={4} align="stretch">
              <Text>
                {t('createRule.description', 
                  'This rule will automatically categorize future transactions that match the pattern.'
                )}
              </Text>

              <Field label={t('createRule.matchType', 'Match type')}>
                <RadioGroup.Root
                  value={matchType}
                  onValueChange={(e) => setMatchType(e.value as MatchType)}
                >
                  <VStack gap={2} align="start">
                    <RadioGroup.Item value="exact">
                      <RadioGroup.ItemText>
                        {t('createRule.exact', 'Exact match')}
                      </RadioGroup.ItemText>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="contains">
                      <RadioGroup.ItemText>
                        {t('createRule.contains', 'Contains')}
                      </RadioGroup.ItemText>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="regex">
                      <RadioGroup.ItemText>
                        {t('createRule.regex', 'Regular expression')}
                      </RadioGroup.ItemText>
                    </RadioGroup.Item>
                  </VStack>
                </RadioGroup.Root>
              </Field>

              <Field label={t('createRule.pattern', 'Pattern')}>
                <Input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder={merchantNorm.toLowerCase()}
                />
              </Field>

              <Text fontSize="sm" color="gray.600">
                {t('createRule.example', 'Merchant: {{merchant}}', { merchant: merchantNorm })}
              </Text>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <Button variant="outline" onClick={onClose}>
                {t('createRule.cancel', 'Cancel')}
              </Button>
            </Dialog.CloseTrigger>
            <Button colorPalette="blue" onClick={handleSave}>
              {t('createRule.create', 'Create rule')}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
