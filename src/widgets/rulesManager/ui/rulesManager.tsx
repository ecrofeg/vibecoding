import { useAtomValue, useSetAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { 
  Box, 
  VStack, 
  HStack, 
  Heading, 
  Button, 
  Table, 
  Text,
  Badge,
  IconButton,
} from '@chakra-ui/react'
import { useState } from 'react'
import { rulesAtom, deleteRuleFromDB, saveRuleToDB } from '@/entities/rule'
import { CATEGORIES } from '@/entities/category'
import { CreateRuleDialog } from '../../transactionsList/ui/createRuleDialog'
import type { Rule } from '@/shared/types'

type Props = {
  className?: string
}

export const RulesManager = ({ className }: Props) => {
  const { t, i18n } = useTranslation()
  const rules = useAtomValue(rulesAtom)
  const deleteRule = useSetAtom(deleteRuleFromDB)
  const saveRule = useSetAtom(saveRuleToDB)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)

  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority)

  const handleDelete = async (ruleId: string) => {
    if (confirm(t('rules.confirmDelete', 'Are you sure you want to delete this rule?'))) {
      await deleteRule(ruleId)
    }
  }

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule)
    setCreateDialogOpen(true)
  }

  const handleSaveNew = async (rule: Rule) => {
    await saveRule(rule)
  }

  const handleSaveEdit = async (rule: Rule) => {
    if (editingRule) {
      await saveRule({ ...rule, id: editingRule.id })
      setEditingRule(null)
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId)
    return category ? (i18n.language === 'ru' ? category.name : category.nameEn) : 'Unknown'
  }

  const getCategoryColor = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId)
    return category?.color || 'gray'
  }

  return (
    <Box className={className}>
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between">
          <Heading size="lg">{t('rules.title', 'Categorization Rules')}</Heading>
          <Button 
            colorPalette="blue" 
            onClick={() => {
              setEditingRule(null)
              setCreateDialogOpen(true)
            }}
          >
            {t('rules.create', 'Create Rule')}
          </Button>
        </HStack>

        {sortedRules.length === 0 ? (
          <Box p={6} className="text-center text-gray-500 bg-gray-50 rounded-lg">
            <Text>{t('rules.empty', 'No rules yet. Create your first rule to automatically categorize transactions.')}</Text>
          </Box>
        ) : (
          <Box overflowX="auto" className="shadow-lg bg-white rounded-lg">
            <Table.Root variant="line" size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>{t('rules.priority', 'Priority')}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('rules.matchType', 'Match Type')}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('rules.pattern', 'Pattern')}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('rules.category', 'Category')}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('rules.needType', 'Need Type')}</Table.ColumnHeader>
                  <Table.ColumnHeader>{t('rules.actions', 'Actions')}</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sortedRules.map(rule => (
                  <Table.Row key={rule.id}>
                    <Table.Cell>
                      <Badge>{rule.priority}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={
                        rule.matchType === 'exact' ? 'green' :
                        rule.matchType === 'contains' ? 'blue' :
                        'purple'
                      }>
                        {rule.matchType}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm" fontFamily="mono">
                        {rule.pattern}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <HStack>
                        <Box
                          w={3}
                          h={3}
                          borderRadius="full"
                          bg={getCategoryColor(rule.categoryId)}
                        />
                        <Text fontSize="sm">
                          {getCategoryName(rule.categoryId)}
                        </Text>
                      </HStack>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={
                        rule.needType === 'need' ? 'blue' :
                        rule.needType === 'want' ? 'orange' :
                        'gray'
                      }>
                        {rule.needType || 'auto'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <HStack gap={2}>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleEdit(rule)}
                        >
                          {t('rules.edit', 'Edit')}
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          colorPalette="red"
                          onClick={() => handleDelete(rule.id)}
                        >
                          {t('rules.delete', 'Delete')}
                        </Button>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}

        <Box p={4} className="bg-blue-50 rounded-lg">
          <VStack align="start" gap={2}>
            <Text fontWeight="bold" fontSize="sm">
              {t('rules.howItWorks', 'How it works')}:
            </Text>
            <Text fontSize="sm">
              • {t('rules.help1', 'Rules are applied in priority order (higher number = higher priority)')}
            </Text>
            <Text fontSize="sm">
              • {t('rules.help2', 'Exact match: Pattern must match exactly')}
            </Text>
            <Text fontSize="sm">
              • {t('rules.help3', 'Contains: Pattern can appear anywhere in merchant name')}
            </Text>
            <Text fontSize="sm">
              • {t('rules.help4', 'Regex: Use regular expressions for complex patterns')}
            </Text>
            <Text fontSize="sm">
              • {t('rules.help5', 'Manual categorizations always override rules')}
            </Text>
          </VStack>
        </Box>
      </VStack>

      {createDialogOpen && (
        <CreateRuleDialog
          open={createDialogOpen}
          onClose={() => {
            setCreateDialogOpen(false)
            setEditingRule(null)
          }}
          merchantNorm={editingRule?.pattern || ''}
          categoryId={editingRule?.categoryId || CATEGORIES[0].id}
          needType={editingRule?.needType || null}
          onSave={editingRule ? handleSaveEdit : handleSaveNew}
        />
      )}
    </Box>
  )
}
