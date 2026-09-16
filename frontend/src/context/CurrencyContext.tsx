import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CURRENCY_STORAGE_KEY,
  type Currency,
} from "@/lib/currency";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (next: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readStoredCurrency(): Currency {
  if (typeof window === "undefined") return "USD";
  const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
  return stored === "INR" ? "INR" : "USD";
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(readStoredCurrency);

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ currency, setCurrency }),
    [currency, setCurrency],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
