import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Home, LogOut, User as UserIcon, PlusSquare, Shield, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchMessageCount = async () => {
        const { count, error } = await supabase
          .from('contact_messages')
          .select('*', { count: 'exact', head: true });
        
        if (!error && count !== null) {
          setMessageCount(count);
        }
      };
      
      fetchMessageCount();

      // Subscribe to new messages
      const channel = supabase.channel('public:contact_messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_messages' }, () => {
          fetchMessageCount();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

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
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                    <Shield className="w-5 h-5" />
                    Admin
                  </Link>
                )}
                <Link to="/dashboard" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                  <PlusSquare className="w-5 h-5" />
                  Dashboard
                </Link>
                
                <Link to="/dashboard?tab=queries" className="relative flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
                  <Bell className="w-5 h-5" />
                  {messageCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[16px] h-[16px]">
                      {messageCount > 99 ? '99+' : messageCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="flex items-center gap-2 pr-4 border-r border-gray-200 hover:text-indigo-600 transition-colors">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">{user.name}</span>
                </Link>
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
