const NO_DIVISION_CURRENCIES = new Set([
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
])

export function getSmallestUnit(amount: number, currencyCode: string): number {
  const normalized = currencyCode?.toLowerCase()

  if (NO_DIVISION_CURRENCIES.has(normalized)) {
    return Math.round(amount)
  }

  return Math.round(amount * 100)
}

export function getAmountFromSmallestUnit(
  amount: number,
  currencyCode: string
): number {
  const normalized = currencyCode?.toLowerCase()

  if (NO_DIVISION_CURRENCIES.has(normalized)) {
    return amount
  }

  return amount / 100
}
