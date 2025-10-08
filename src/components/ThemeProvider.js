'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export default function ThemeProvider({ children }) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="light"
      enableSystem={true}
      storageKey="cms-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
