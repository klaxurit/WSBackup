import { useEffect, useState, useRef } from 'react'

/**
 * Hook pour débouncer une valeur
 * @param value - La valeur à débouncer
 * @param delay - Le délai en millisecondes
 * @returns La valeur débouncée
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    // Nettoyer le timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Créer un nouveau timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook pour débouncer les appels de fonction
 * @param callback - La fonction à débouncer
 * @param delay - Le délai en millisecondes
 * @returns La fonction débouncée
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const debouncedCallback = (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback as T
}