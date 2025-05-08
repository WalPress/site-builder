import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import AppLayout from './components/layouts/appLayout.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppLayout>
        <HashRouter>
          <App />
        </HashRouter>
      </AppLayout>
    </ThemeProvider>
  </StrictMode>,
)
