import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  const normalizedCurrency = currency_code?.toUpperCase()
  const effectiveLocale =
    normalizedCurrency === "GHS" && locale === "en-US" ? "en-GH" : locale

  return currency_code && !isEmpty(currency_code)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency_code,
        currencyDisplay: normalizedCurrency === "GHS" ? "narrowSymbol" : "symbol",
        minimumFractionDigits,
        maximumFractionDigits,
      })
        .format(amount)
        // Some environments render GHS as "GHS" even with narrowSymbol.
        .replace(/^GHS\s?/, "GH₵")
    : amount.toString()
}
