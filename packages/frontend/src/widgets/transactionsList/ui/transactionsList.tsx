import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { filteredTransactionsAtom } from '@/entities/transaction'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import { Box, Table, VStack, Heading } from '@chakra-ui/react'
import { useMemo, useState, useDeferredValue } from 'react'
import { SearchInput } from './searchInput'

type Props = {
  className?: string
}

type SortColumn = 'date' | 'name' | 'description' | 'amount'
type SortDirection = 'asc' | 'desc'

export const TransactionsList = ({ className }: Props) => {
  const { t, i18n } = useTranslation()
  const [transactions] = useAtom(filteredTransactionsAtom)
  const [sortColumn, setSortColumn] = useState<SortColumn>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  const deferredTransactions = useDeferredValue(transactions)

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedTransactions = useMemo(() => {
    return [...deferredTransactions].sort((a, b) => {
      let comparison = 0

      switch (sortColumn) {
        case 'date': {
          const timeA = a.date?.getTime() || 0
          const timeB = b.date?.getTime() || 0
          if (isNaN(timeA) || isNaN(timeB)) {
            comparison = 0
          } else {
            comparison = timeA - timeB
          }
          break
        }
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'description':
          comparison = a.description.localeCompare(b.description)
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [deferredTransactions, sortColumn, sortDirection])

  const getSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <span className="text-gray-400">↕</span>
    }
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>
  }

  return (
    <Box className={className}>
      <VStack gap={4} align="stretch">
        <Heading size="lg">{t('transactionsList.title')} ({sortedTransactions.length})</Heading>
        <SearchInput className="bg-white" />
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
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 hover:text-blue-600 cursor-pointer w-full text-left bg-transparent border-none p-0"
                    >
                      {t('transactionsList.name')} {getSortIndicator('name')}
                    </button>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    <button
                      onClick={() => handleSort('description')}
                      className="flex items-center gap-2 hover:text-blue-600 cursor-pointer w-full text-left bg-transparent border-none p-0"
                    >
                      {t('transactionsList.description')} {getSortIndicator('description')}
                    </button>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    <button
                      onClick={() => handleSort('amount')}
                      className="flex items-center gap-2 hover:text-blue-600 cursor-pointer w-full text-left bg-transparent border-none p-0"
                    >
                      {t('transactionsList.amount')} {getSortIndicator('amount')}
                    </button>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    {t('transactionsList.category')}
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
              {sortedTransactions.map(tx => (
                <Table.Row key={tx.id}>
                  <Table.Cell className="whitespace-nowrap">
                    {formatDate(tx.date, i18n.language, (key) => t(`transactionsList.${key}`))}
                  </Table.Cell>
                  <Table.Cell className="font-medium">{tx.name}</Table.Cell>
                  <Table.Cell>{tx.description}</Table.Cell>
                  <Table.Cell className={tx.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatCurrency(tx.amount)}
                  </Table.Cell>
                  <Table.Cell>
                    {t(`categories.${tx.category}`)}
                  </Table.Cell>
                </Table.Row>
              ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}
      </VStack>
    </Box>
  )
}

