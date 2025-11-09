import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './App.css'
import AppLayout from './components/layout/AppLayout'
import ReadingsDashboard from './components/readings/ReadingsDashboard'
import AddReadingPage from './components/readings/AddReadingPage'
import ViewReadingsPage from './components/readings/ViewReadingsPage'
import { AuthProvider } from './context/AuthContext'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/readings" replace />
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
])

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
