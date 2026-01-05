import { useRef, useState } from 'react'
import { useSetAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { parseCSV, addTransactions } from '@/entities/transaction'
import { applyRulesToTransactions } from '@/entities/rule'
import { rulesAtom } from '@/entities/rule'
import { useAtomValue } from 'jotai'
import { Button, Box, VStack, Text } from '@chakra-ui/react'

type Props = {
  className?: string
}

export const CsvUploader = ({ className }: Props) => {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const addTx = useSetAtom(addTransactions)
  const rules = useAtomValue(rulesAtom)

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.pdf')) {
      alert(t('csvUploader.invalidFile'))
      return
    }

    setIsProcessing(true)

    try {
      let parsedTransactions
      
      if (file.name.endsWith('.csv')) {
        const text = await file.text()
        parsedTransactions = parseCSV(text)
      } else {
        alert(t('csvUploader.pdfNotImplemented', 'PDF import coming soon!'))
        setIsProcessing(false)
        return
      }

      const categorizedTransactions = applyRulesToTransactions(parsedTransactions, rules)
      
      const result = await addTx(categorizedTransactions)
      
      const message = result.added > 0 && result.duplicates > 0
        ? t('csvUploader.importSuccess', { 
            total: parsedTransactions.length, 
            new: result.added, 
            updated: result.duplicates 
          })
        : result.added > 0
        ? t('csvUploader.importSuccessNew', { count: result.added })
        : t('csvUploader.importSuccessDuplicates', { count: result.duplicates })
      
      alert(message)
    } catch (error) {
      console.error('Error parsing CSV:', error)
      alert(t('csvUploader.importError', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }))
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
            accept=".csv,.pdf"
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
          <Text fontSize="sm" color="gray.600">
            {t('csvUploader.dragDrop', 'or drag and drop CSV/PDF file here')}
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}

