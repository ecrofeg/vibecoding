import { useRef, useState } from 'react'
import { useAtomValue } from 'jotai'
import { useTranslation } from 'react-i18next'
import { useUploadCsv } from '@/entities/transaction'
import { selectedCardAtom } from '@/entities/card'
import { useCards } from '@/entities/card'
import { Button, Box, VStack, Text } from '@chakra-ui/react'

type Props = {
  className?: string
}

export const CsvUploader = ({ className }: Props) => {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const selectedCard = useAtomValue(selectedCardAtom)
  const { data: cards = [] } = useCards()
  const uploadCsvMutation = useUploadCsv()

  const handleFile = async (file: File) => {
    if (!selectedCard) {
      alert(t('csvUploader.noCardSelected'))
      return
    }

    if (!file.name.endsWith('.csv')) {
      alert(t('csvUploader.invalidFile'))
      return
    }

    try {
      const result = await uploadCsvMutation.mutateAsync({ cardId: selectedCard, file })

      const message = result.new > 0 && result.updated > 0
        ? t('csvUploader.importSuccess', { total: result.total, new: result.new, updated: result.updated })
        : result.new > 0
        ? t('csvUploader.importSuccessNew', { count: result.new })
        : t('csvUploader.importSuccessUpdated', { count: result.updated })

      alert(message)
    } catch (error) {
      console.error('Error uploading CSV:', error)
      alert(t('csvUploader.importError', { error: error instanceof Error ? error.message : 'Unknown error' }))
    } finally {
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

  const currentCard = cards.find((card) => card.id === selectedCard)

  return (
    <Box className={className}>
      <VStack gap={4}>
        {currentCard && (
          <Text fontSize="sm" color="gray.600">
            {t('csvUploader.importingTo')}: <strong>{currentCard.name}</strong>
          </Text>
        )}
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
            disabled={uploadCsvMutation.isPending}
          >
            {uploadCsvMutation.isPending
              ? t('csvUploader.processing')
              : t('csvUploader.selectFile')}
          </Button>
        </Box>
      </VStack>
    </Box>
  )
}
