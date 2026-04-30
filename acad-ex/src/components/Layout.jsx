import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

// Layout wraps all private pages with Sidebar.
// activeClass state is shared to ForumPage via React context approach below.
// ForumPage reads it via a simple window event / prop drilling workaround.

export default function Layout({ children }) {
  const [activeClass, setActiveClass] = useState('all');
  const location = useLocation();

  // Clone child and inject activeClass only for ForumPage
  const child = typeof children === 'object' && children !== null
    ? { ...children, props: { ...children.props, activeClass } }
    : children;

  return (
    <div className="app-shell">
      <Sidebar activeClass={activeClass} onClassChange={setActiveClass} />
      <div className="main-content">
        {child}
      </div>
    </div>
  );
}
