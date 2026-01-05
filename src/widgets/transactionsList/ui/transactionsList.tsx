import { useAtomValue, useSetAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { filteredTransactionsAtom, updateTransaction, applyRulesToTransactions } from '@/entities/transaction'
import { CATEGORIES } from '@/entities/category'
import { saveRuleToDB, rulesAtom } from '@/entities/rule'
import { transactionsAtom } from '@/entities/transaction'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import { Box, Table, VStack, Heading, Select, Badge, Button, Dialog } from '@chakra-ui/react'
import { useMemo, useState, useDeferredValue } from 'react'
import { SearchInput } from './searchInput'
import { CreateRuleDialog } from './createRuleDialog'
import type { Transaction, Rule } from '@/shared/types'

type Props = {
  className?: string
}

type SortColumn = 'date' | 'merchant' | 'category' | 'amount'
type SortDirection = 'asc' | 'desc'

export const TransactionsList = ({ className }: Props) => {
  const { t, i18n } = useTranslation()
  const transactions = useAtomValue(filteredTransactionsAtom)
  const allTransactions = useAtomValue(transactionsAtom)
  const updateTx = useSetAtom(updateTransaction)
  const saveRule = useSetAtom(saveRuleToDB)
  const rules = useAtomValue(rulesAtom)
  const [sortColumn, setSortColumn] = useState<SortColumn>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showTransfers, setShowTransfers] = useState(false)
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)
  
  const deferredTransactions = useDeferredValue(transactions)

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleCategoryChange = async (tx: Transaction, newCategoryId: string) => {
    const category = CATEGORIES.find(c => c.id === newCategoryId)
    
    await updateTx({
      ...tx,
      categoryId: newCategoryId,
      needType: category?.defaultNeedType || 'unknown',
      categorySource: 'manual',
      categoryConfidence: 1.0,
    })

    const similarCount = allTransactions.filter(
      t => t.merchantNorm === tx.merchantNorm && t.id !== tx.id
    ).length

    if (similarCount > 0) {
      setSelectedTx(tx)
      setPendingCategory(newCategoryId)
      setRuleDialogOpen(true)
    }
  }

  const handleRuleSave = async (rule: Rule) => {
    await saveRule(rule)

    const updatedTransactions = applyRulesToTransactions(allTransactions, [...rules, rule])
    
    for (const tx of updatedTransactions) {
      if (
        tx.merchantNorm === selectedTx?.merchantNorm &&
        tx.categorySource !== 'manual'
      ) {
        await updateTx(tx)
      }
    }

    setSelectedTx(null)
    setPendingCategory(null)
  }

  const filteredByTransfers = useMemo(() => {
    if (showTransfers) {
      return deferredTransactions
    }
    return deferredTransactions.filter(tx => !tx.isTransfer)
  }, [deferredTransactions, showTransfers])

  const sortedTransactions = useMemo(() => {
    return [...filteredByTransfers].sort((a, b) => {
      let comparison = 0

      switch (sortColumn) {
        case 'date': {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date)
          const dateB = b.date instanceof Date ? b.date : new Date(b.date)
          const timeA = dateA.getTime()
          const timeB = dateB.getTime()
          if (isNaN(timeA) || isNaN(timeB)) {
            comparison = 0
          } else {
            comparison = timeA - timeB
          }
          break
        }
        case 'merchant':
          comparison = a.merchantNorm.localeCompare(b.merchantNorm)
          break
        case 'category': {
          const catA = a.categoryId || ''
          const catB = b.categoryId || ''
          comparison = catA.localeCompare(catB)
          break
        }
        case 'amount':
          comparison = a.amount - b.amount
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredByTransfers, sortColumn, sortDirection])

  const getSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <span className="text-gray-400">↕</span>
    }
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>
  }

  const getCategoryColor = (categoryId: string | null) => {
    if (!categoryId) return 'gray'
    const category = CATEGORIES.find(c => c.id === categoryId)
    return category?.color || 'gray'
  }

  return (
    <Box className={className}>
      <VStack gap={4} align="stretch">
        <Heading size="lg">{t('transactionsList.title')} ({sortedTransactions.length})</Heading>
        <Box className="flex gap-4">
          <SearchInput className="bg-white flex-1" />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showTransfers}
              onChange={(e) => setShowTransfers(e.target.checked)}
            />
            <span>{t('transactionsList.showTransfers', 'Show transfers')}</span>
          </label>
        </Box>
        {sortedTransactions.length === 0 ? (
          <p className="text-gray-500">{t('transactionsList.empty')}</p>
        ) : (
          <Box overflowX="auto" className="shadow-lg bg-white rounded-lg">
            <Table.Root variant="line" size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>
                    <button
                      onClick={() => handleSort('date')}
                      className="flex items-center gap-2 hover:text-blue-600 cursor-pointer w-full text-left bg-transparent border-none p-0"
                    >
                      {t('transactionsList.date')} {getSortIndicator('date')}
                    </button>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    <button
                      onClick={() => handleSort('merchant')}
                      className="flex items-center gap-2 hover:text-blue-600 cursor-pointer w-full text-left bg-transparent border-none p-0"
                    >
                      {t('transactionsList.merchant', 'Merchant')} {getSortIndicator('merchant')}
                    </button>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    <button
                      onClick={() => handleSort('category')}
                      className="flex items-center gap-2 hover:text-blue-600 cursor-pointer w-full text-left bg-transparent border-none p-0"
                    >
                      {t('transactionsList.category', 'Category')} {getSortIndicator('category')}
                    </button>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    {t('transactionsList.type', 'Type')}
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    <button
                      onClick={() => handleSort('amount')}
                      className="flex items-center gap-2 hover:text-blue-600 cursor-pointer w-full text-left bg-transparent border-none p-0"
                    >
                      {t('transactionsList.amount')} {getSortIndicator('amount')}
                    </button>
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
              {sortedTransactions.map(tx => (
                <Table.Row key={tx.id}>
                  <Table.Cell className="whitespace-nowrap">
                    {formatDate(tx.date, i18n.language, (key) => t(`transactionsList.${key}`))}
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <div className="font-medium">{tx.merchantNorm}</div>
                      <div className="text-xs text-gray-500">{tx.descriptionRaw}</div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Select.Root
                      size="sm"
                      value={tx.categoryId || ''}
                      onValueChange={(e) => handleCategoryChange(tx, e.value[0])}
                    >
                      <Select.Trigger>
                        <Select.ValueText>
                          {tx.categoryId 
                            ? CATEGORIES.find(c => c.id === tx.categoryId)?.name || 'Unknown'
                            : t('transactionsList.uncategorized', 'Uncategorized')}
                        </Select.ValueText>
                      </Select.Trigger>
                      <Select.Content>
                        {CATEGORIES.map(cat => (
                          <Select.Item key={cat.id} item={cat.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: cat.color }}
                              />
                              {i18n.language === 'ru' ? cat.name : cat.nameEn}
                            </div>
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={tx.needType === 'need' ? 'blue' : tx.needType === 'want' ? 'orange' : 'gray'}>
                      {tx.needType}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className={tx.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatCurrency(tx.amount)}
                  </Table.Cell>
                </Table.Row>
              ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}
      </VStack>

      {selectedTx && pendingCategory && (
        <CreateRuleDialog
          open={ruleDialogOpen}
          onClose={() => {
            setRuleDialogOpen(false)
            setSelectedTx(null)
            setPendingCategory(null)
          }}
          merchantNorm={selectedTx.merchantNorm}
          categoryId={pendingCategory}
          needType={CATEGORIES.find(c => c.id === pendingCategory)?.defaultNeedType || 'unknown'}
          onSave={handleRuleSave}
        />
      )}
    </Box>
  )
}

