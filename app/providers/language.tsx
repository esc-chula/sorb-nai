import { createContext, useContext, useEffect, useState } from 'react'

export const LanguageContext = createContext({
  language: 'th',
  onLanguageChange: () => {},
})

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [language, setLanguage] = useState<'th' | 'en'>('th')

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language')
    if (storedLanguage) {
      setLanguage(storedLanguage as 'th' | 'en')
    }
  }, [])

  const handleLanguageChange = () => {
    const newLanguage = language === 'th' ? 'en' : 'th'
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  return (
    <LanguageContext.Provider
      value={{ language, onLanguageChange: handleLanguageChange }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
