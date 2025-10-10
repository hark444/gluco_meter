import Header from '../Header'
import HomePage from '../HomePage'
import Footer from '../Footer'

const AppLayout = () => {
  return (
    <div className="app-shell">
      <Header />
      <HomePage />
      <Footer />
    </div>
  )
}

export default AppLayout
