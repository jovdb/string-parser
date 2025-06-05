import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { ExpressionPage } from './components/expressions/ExpressionPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExpressionPage />
  </StrictMode>,
)
