import type React from 'react';
import { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import gsap from 'gsap';

const Layout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  // GSAP animations for the layout elements
  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      '.navbar',
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }
    );

    tl.fromTo(
      '.page-content',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <header className="navbar sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">LinkShort</span>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                    <span>{user?.username}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="page-content flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} LinkShort. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
