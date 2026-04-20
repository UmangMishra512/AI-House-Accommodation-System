import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, LogOut, User as UserIcon, PlusSquare } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-6 w-6 text-indigo-600" />
              <span className="font-bold text-xl text-gray-900 tracking-tight">AI Accommodate</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/properties" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              Listing
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                  <PlusSquare className="w-5 h-5" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
