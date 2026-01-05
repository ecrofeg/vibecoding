import { useState, useEffect } from 'react'
import { Box, Button, Input, Text, Heading, VStack, HStack, Card } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { db } from '../../../shared/db/database'
import DeepSeekService from '../../../features/deepseek/deepseekService'

export const SettingsPage = () => {
  const { t } = useTranslation()
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [savedMessage, setSavedMessage] = useState(false)

  useEffect(() => {
    const loadApiKey = async () => {
      const setting = await db.settings.get('deepseek_api_key')
      if (setting) {
        setApiKey(setting.value)
      }
    }
    loadApiKey()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    setSavedMessage(false)
    
    try {
      await db.settings.put({
        key: 'deepseek_api_key',
        value: apiKey,
      })
      
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 3000)
    } catch (error) {
      console.error('Failed to save API key:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult('error')
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const service = new DeepSeekService({ apiKey: apiKey.trim() })
      const success = await service.testConnection()
      setTestResult(success ? 'success' : 'error')
    } catch (error) {
      console.error('Connection test failed:', error)
      setTestResult('error')
    } finally {
      setIsTesting(false)
    }
  }

  const handleClear = async () => {
    setApiKey('')
    await db.settings.delete('deepseek_api_key')
    setTestResult(null)
    setSavedMessage(false)
  }

  return (
    <Box p={6} maxW="800px" mx="auto">
      <Heading size="lg" mb={6}>{t('settings.title', 'Settings')}</Heading>

      <VStack gap={6} align="stretch">
        <Card.Root>
          <Card.Body>
            <VStack align="stretch" gap={4}>
              <Box>
                <Text fontWeight="bold" mb={2}>
                  {t('settings.deepseek.title', 'DeepSeek API Key')}
                </Text>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  {t('settings.deepseek.description', 
                    'Enter your DeepSeek API key to enable AI-powered transaction categorization and normalization. Get your key at deepseek.com'
                  )}
                </Text>
              </Box>

              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                size="md"
              />

              <HStack>
                <Button
                  onClick={handleSave}
                  loading={isLoading}
                  colorPalette="blue"
                  disabled={!apiKey.trim()}
                >
                  {t('settings.save', 'Save')}
                </Button>

                <Button
                  onClick={handleTest}
                  loading={isTesting}
                  variant="outline"
                  disabled={!apiKey.trim()}
                >
                  {t('settings.test', 'Test Connection')}
                </Button>

                <Button
                  onClick={handleClear}
                  variant="ghost"
                  colorPalette="red"
                >
                  {t('settings.clear', 'Clear')}
                </Button>
              </HStack>

              {savedMessage && (
                <Text color="green.600" fontSize="sm">
                  {t('settings.saved', 'API key saved successfully')}
                </Text>
              )}

              {testResult === 'success' && (
                <Text color="green.600" fontSize="sm">
                  {t('settings.test.success', 'Connection successful!')}
                </Text>
              )}

              {testResult === 'error' && (
                <Text color="red.600" fontSize="sm">
                  {t('settings.test.error', 'Connection failed. Please check your API key.')}
                </Text>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body>
            <VStack align="stretch" gap={3}>
              <Text fontWeight="bold">
                {t('settings.features.title', 'Features')}
              </Text>
              
              <Box>
                <Text fontSize="sm" fontWeight="medium">
                  {t('settings.features.categorization', 'AI Categorization')}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {t('settings.features.categorization.desc', 
                    'Automatically categorize transactions using AI'
                  )}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium">
                  {t('settings.features.normalization', 'Merchant Normalization')}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {t('settings.features.normalization.desc', 
                    'Normalize merchant names for better tracking'
                  )}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium">
                  {t('settings.features.pdf', 'PDF Import')}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {t('settings.features.pdf.desc', 
                    'Import transactions from PDF bank statements'
                  )}
                </Text>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  )
}
