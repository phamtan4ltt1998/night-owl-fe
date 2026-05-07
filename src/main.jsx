import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import PWAUpdater from './pwa/PWAUpdater.jsx'
import InstallBanner from './pwa/InstallBanner.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="580494851023-u34i18n43a2cho99kp20ncjnl47u2q1d.apps.googleusercontent.com">
      <App />
      <PWAUpdater />
      <InstallBanner />
    </GoogleOAuthProvider>
  </StrictMode>,
)
