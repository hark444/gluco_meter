import { Outlet } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';

const AppLayout = () => {
  return (
    <div className="app-shell">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
