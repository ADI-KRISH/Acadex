import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useApp } from '../context/AppContext';

export default function Layout({ children }) {
  const { activeClass, setActiveClass } = useApp();
  const location = useLocation();

  return (
    <div className="app-shell">
      <Sidebar activeClass={activeClass} onClassChange={setActiveClass} />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
