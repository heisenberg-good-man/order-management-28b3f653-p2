import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '../context/ToastContext.jsx'
import StableLayout from './StableLayout.jsx'
import StableRouter from './StableRouter.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'

export default function StableApp() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <StableLayout>
          <ErrorBoundary>
            <StableRouter />
          </ErrorBoundary>
        </StableLayout>
      </ToastProvider>
    </BrowserRouter>
  )
}
