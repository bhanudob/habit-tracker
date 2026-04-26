import { useState, useEffect } from 'react'

export function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem('ht_theme') === 'dark')

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('ht_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('ht_theme', 'light')
    }
  }, [dark])

  return { dark, toggle: () => setDark((d) => !d) }
}
