# Personal Budget Tracker

A comprehensive personal finance management application built with React, TypeScript, and Vite. Track expenses, manage budgets, and gain insights into your spending habits.

## Features

### Core Features
- **CSV Import**: Upload bank statements in CSV format
- **PDF Import**: Import transactions from PDF bank statements (with DeepSeek AI)
- **Smart Categorization**: Automatic transaction categorization with 9 fixed categories
- **Budget Tracking**: Set and monitor budgets by category with forecasting
- **Date Range Filtering**: Filter transactions by custom date ranges
- **Transaction Management**: View, search, and edit transaction details

### Advanced Features
- **Rules Engine**: Create custom rules for automatic categorization
- **AI Integration**: DeepSeek AI for merchant normalization and categorization
- **Merchant Normalization**: Standardize merchant names automatically
- **Transfer Detection**: Automatically detect and exclude internal transfers
- **Insights & Analytics**:
  - Leaks detection (small recurring expenses)
  - Top merchants analysis
  - Monthly spending trends
  - Category-based expense breakdown
- **Need/Want Classification**: Distinguish between essential and discretionary spending

## Tech Stack

- **Build Tool**: Vite + React 19 + TypeScript
- **State Management**: Jotai with IndexedDB persistence
- **Database**: IndexedDB (via Dexie.js)
- **UI Framework**: Chakra UI v3 + Tailwind CSS
- **Charts**: Nivo (pie, bar charts)
- **Utilities**: 
  - papaparse (CSV parsing)
  - pdf-parse (PDF parsing)
  - date-fns (date manipulation)
  - uuid (ID generation)

## Data Models

```typescript
type Transaction = {
  id: string
  sourceId: string
  source: string
  bankId: string
  date: Date
  amount: number
  currency: string
  merchantRaw: string
  merchantNorm: string
  categoryId: string | null
  needType: 'need' | 'want' | 'mixed' | 'unknown'
  txType: 'expense' | 'income' | 'transfer' | 'refund'
  isTransfer: boolean
  // ... more fields
}

type Category = {
  id: string
  name: string
  nameEn: string
  color: string
  defaultNeedType: NeedType
}

type Rule = {
  id: string
  priority: number
  matchType: 'exact' | 'contains' | 'regex'
  pattern: string
  categoryId: string
  // ... more fields
}

type Budget = {
  id: string
  period: string // 'YYYY-MM'
  categoryId: string
  limitAmount: number
  currency: string
}
```

## Categories

The app uses 9 fixed categories:
1. **Groceries** (Еда дома) - Need
2. **Eating Out** (Еда вне дома) - Want
3. **Delivery** (Доставка) - Want
4. **Coffee/Snacks** (Кофе/перекусы) - Want
5. **Transport** (Транспорт) - Mixed
6. **Shopping** (Покупки) - Want
7. **Subscriptions** (Подписки/сервисы) - Mixed
8. **Health** (Здоровье) - Need
9. **Other** (Прочее) - Unknown

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Type Checking

```bash
pnpm tsc
```

## DeepSeek AI Integration

To use AI-powered features:

1. Get an API key from [DeepSeek](https://deepseek.com)
2. Go to Settings in the app
3. Enter your API key
4. Enable AI features for:
   - Merchant normalization
   - Transaction categorization
   - PDF import

## File Structure

```
src/
├── app/                    # App entry and providers
├── entities/               # Business entities
│   ├── transaction/        # Transaction logic
│   ├── category/          # Categories
│   ├── rule/              # Categorization rules
│   └── budget/            # Budget management
├── features/              # Feature modules
│   └── deepseek/          # AI integration
├── pages/                 # Page components
│   ├── dashboard/         # Main dashboard
│   └── settings/          # Settings page
├── shared/                # Shared utilities
│   ├── db/               # Database setup
│   ├── lib/              # Utilities
│   └── types/            # Type definitions
└── widgets/               # UI widgets
    ├── budgetTiles/       # Budget display
    ├── csvUploader/       # File upload
    ├── leaksWidget/       # Insights
    ├── rulesManager/      # Rules management
    └── transactionsList/  # Transaction table
```

## Migration from localStorage

On first launch, the app automatically migrates existing data from localStorage to IndexedDB.

## License

MIT
