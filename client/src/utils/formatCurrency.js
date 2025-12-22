export const formatCurrency = (
  amount,
  { locale, currency = "NGN", currencyDisplay = "narrowSymbol" } = {},
) => {
  // Use provided locale or browser's default
  const userLocale = locale || getDefaultLocale();

  // Get currency for the locale if not provided
  const currencyToUse = currency || getCurrencyForLocale(userLocale);

  try {
    // Force NGN to use the Naira symbol
    const options = {
      style: "currency",
      currency: currencyToUse,
      currencyDisplay: currencyToUse === "NGN" ? "narrowSymbol" : currencyDisplay,
    };

    return new Intl.NumberFormat(userLocale, options).format(amount);
  } catch (error) {
    console.error("Error formatting currency, falling back to NGN:", error);
    // Fallback to NGN if the currency is not supported
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      currencyDisplay,
    }).format(amount);
  }
};

const getDefaultLocale = () => {
  if (typeof navigator !== "undefined") {
    return (
      navigator.language ||
      (navigator.languages && navigator.languages[0]) ||
      "en-NG"
    );
  }
  return "en-NG";
};

const getCurrencyForLocale = (locale) => {
  // A mapping of locale to default currency
  const localeToCurrency = {
    "en-NG": "NGN",
    "en-US": "USD",
    "en-GB": "GBP",
    "de-DE": "EUR",
    "fr-FR": "EUR",
    "ja-JP": "JPY",
    "zh-CN": "CNY",
    "ru-RU": "RUB",
    "pt-BR": "BRL",
    "es-ES": "EUR",
    "it-IT": "EUR",
  };

  // Return the currency for the exact locale or the parent language
  return (
    localeToCurrency[locale] || localeToCurrency[locale.split("-")[0]] || "NGN" // Fallback to NGN
  );
};
