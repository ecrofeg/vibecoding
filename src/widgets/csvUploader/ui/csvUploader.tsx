import { useRef, useState } from 'react'
import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { transactionsAtom, parseCSV } from '@/entities/transaction'
import { Button, Box, VStack } from '@chakra-ui/react'

type Props = {
  className?: string
}

export const CsvUploader = ({ className }: Props) => {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactions, setTransactions] = useAtom(transactionsAtom)

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert(t('csvUploader.invalidFile'))
      return
    }

    setIsProcessing(true)

    try {
      const text = await file.text()
      const parsedTransactions = parseCSV(text)
      
      const existingIds = new Set(transactions.map(tx => tx.documentId))
      let newCount = 0
      let updatedCount = 0
      
      for (const tx of parsedTransactions) {
        if (existingIds.has(tx.documentId)) {
          updatedCount++
        } else {
          newCount++
        }
      }
      
      setTransactions((prev) => {
        const record: Record<string, Transaction> = {}
        for (const tx of prev) {
          record[tx.documentId] = tx
        }
        for (const tx of parsedTransactions) {
          record[tx.documentId] = tx
        }
        return Object.values(record)
      })
      
      const message = newCount > 0 && updatedCount > 0
        ? t('csvUploader.importSuccess', { total: parsedTransactions.length, new: newCount, updated: updatedCount })
        : newCount > 0
        ? t('csvUploader.importSuccessNew', { count: newCount })
        : t('csvUploader.importSuccessUpdated', { count: updatedCount })
      
      alert(message)
    } catch (error) {
      console.error('Error parsing CSV:', error)
      alert(t('csvUploader.importError', { error: error instanceof Error ? error.message : 'Unknown error' }))
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <Box className={className}>
      <VStack gap={4}>
        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="csv-upload"
          />
          <Button
            colorPalette="blue"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            {isProcessing ? t('csvUploader.processing') : t('csvUploader.selectFile')}
          </Button>
        </Box>
      </VStack>
    </Box>
  )
}

