const API_KEY_STORAGE_KEY = 'deepseek_api_key'

export const getDeepseekApiKey = () => localStorage.getItem(API_KEY_STORAGE_KEY)

export const hasDeepseekApiKey = () => !!getDeepseekApiKey()
