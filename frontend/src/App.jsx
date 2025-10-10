import './App.css'
import AppLayout from './components/layout/AppLayout'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  )
}

export default App
