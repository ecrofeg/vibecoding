import type { Category } from '@/shared/types'

export const CATEGORIES: Category[] = [
  { id: 'food-home', name: 'Еда дома', nameEn: 'Groceries', color: '#4CAF50', defaultNeedType: 'need' },
  { id: 'food-out', name: 'Еда вне дома', nameEn: 'Eating Out', color: '#FF9800', defaultNeedType: 'want' },
  { id: 'delivery', name: 'Доставка', nameEn: 'Delivery', color: '#E91E63', defaultNeedType: 'want' },
  { id: 'coffee', name: 'Кофе/перекусы', nameEn: 'Coffee/Snacks', color: '#795548', defaultNeedType: 'want' },
  { id: 'transport', name: 'Транспорт', nameEn: 'Transport', color: '#2196F3', defaultNeedType: 'mixed' },
  { id: 'shopping', name: 'Покупки', nameEn: 'Shopping', color: '#9C27B0', defaultNeedType: 'want' },
  { id: 'subscriptions', name: 'Подписки/сервисы', nameEn: 'Subscriptions', color: '#00BCD4', defaultNeedType: 'mixed' },
  { id: 'health', name: 'Здоровье', nameEn: 'Health', color: '#F44336', defaultNeedType: 'need' },
  { id: 'other', name: 'Прочее', nameEn: 'Other', color: '#607D8B', defaultNeedType: 'unknown' },
]
