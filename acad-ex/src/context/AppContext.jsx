import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [activeClass, setActiveClass] = useState('all');

  return (
    <AppContext.Provider value={{ activeClass, setActiveClass }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
