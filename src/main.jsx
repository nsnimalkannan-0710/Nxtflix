import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { WatchLaterProvider } from './context/WatchLaterContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WatchLaterProvider>
          <App />
        </WatchLaterProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
