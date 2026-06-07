import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';

export default function MainLayout() {
  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <main className="content-feed">
          <Outlet />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}
