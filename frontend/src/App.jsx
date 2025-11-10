import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import AppLayout from './components/layout/AppLayout'
import AuthLayout from './components/layout/AuthLayout'
import LoginPage from './components/auth/LoginPage'
import SignUpPage from './components/auth/SignUpPage'
import ReadingsDashboard from './components/readings/ReadingsDashboard'
import AddReadingPage from './components/readings/AddReadingPage'
import ViewReadingsPage from './components/readings/ViewReadingsPage'
import { AuthProvider } from './context/AuthContext'
import HomePage from './components/HomePage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'readings',
        element: <ReadingsDashboard />,
        children: [
          {
            index: true,
            element: <ViewReadingsPage />
          },
          {
            path: 'add',
            element: <AddReadingPage />
          }
        ]
      }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'signup',
        element: <SignUpPage />
      }
    ]
  }
])

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
