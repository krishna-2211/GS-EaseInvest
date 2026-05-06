export const TICKER_MAP = {
  'Apple':                'AAPL',
  'Tesla':                'TSLA',
  'NVIDIA':               'NVDA',
  'Microsoft':            'MSFT',
  'Johnson & Johnson':    'JNJ',
  'Vanguard S&P 500 ETF': 'VOO',
  'Fidelity Growth Fund': 'FGRIX',
}

// Per-share reference prices used when mock portfolio was created.
// Lets us estimate share count: shares = invested / basePrice
export const BASE_PRICES = {
  AAPL:  190,
  TSLA:  245,
  NVDA:  875,
  MSFT:  415,
  JNJ:   155,
  VOO:   495,
  FGRIX:  24,
}
