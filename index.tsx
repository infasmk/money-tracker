import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  HashRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';

// Contexts & Providers
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import Header from './components/Header';
import QuickLinks from './components/QuickLinks';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Staff from './pages/Staff';
import StaffDetail from './pages/StaffDetail';
import Reports from './pages/Reports';

// Supabase client for auth session check
import { supabase } from './supabase';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Auth Session Persistence Check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Loading state for initial session check
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="h-12 w-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Initializing Terminal...</p>
        </div>
      </div>
    );
  }

  // Login Gateway
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <ThemeProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-[#030712] relative overflow-x-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
              <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary-600/5 rounded-full blur-[140px]"></div>
              <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/5 rounded-full blur-[140px]"></div>
            </div>

            <Header />
            
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-10 py-10 relative z-10">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/income" element={<Income />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/staff/:id" element={<StaffDetail />} />
                <Route path="/reports" element={<Reports />} />
                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <QuickLinks />
            
            {/* Spacer for the fixed bottom navigation */}
            <div className="h-32"></div>
          </div>
        </Router>
      </DataProvider>
    </ThemeProvider>
  );
};

// Mount the Application
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
