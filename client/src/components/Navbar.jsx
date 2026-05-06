import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { Home, LogOut, User as UserIcon, PlusSquare, Shield, Bell, Check, CheckCircle2, Menu, X, Moon, Sun } from 'lucide-react';
import { format } from 'date-fns';

const Navbar = () => {
  const { user, isAdmin, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notificationRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      const fetchUnreadMessages = async () => {
        const { data, error } = await supabase
          .from('contact_messages')
          .select('*, property:properties(title)')
          .eq('is_read', false)
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setUnreadMessages(data);
        }
      };
      
      fetchUnreadMessages();

      // Subscribe to new messages
      const channel = supabase.channel('public:contact_messages')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => {
          fetchUnreadMessages();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const markAsRead = async (messageId) => {
    try {
      if (messageId === 'all') {
        const ids = unreadMessages.map(m => m.id);
        if(ids.length === 0) return;
        await supabase.from('contact_messages').update({ is_read: true }).in('id', ids);
      } else {
        await supabase.from('contact_messages').update({ is_read: true }).eq('id', messageId);
      }
      if (messageId === 'all') {
        setUnreadMessages([]);
      } else {
        setUnreadMessages(prev => prev.filter(m => m.id !== messageId));
      }
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleNotificationClick = (msg) => {
    markAsRead(msg.id);
    setShowNotificationPopup(false);
    navigate('/dashboard?tab=queries');
  };

  const NavLink = ({ to, children, className = '', onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`font-medium transition-colors ${
        location.pathname === to
          ? 'text-indigo-600'
          : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600'
      } ${className}`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white dark:bg-gray-800/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-6 transition-transform">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">AI Accommodate</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/properties">Listing</NavLink>
            {user ? (
              <>
                {isAdmin && (
                  <NavLink to="/admin" className="flex items-center gap-1">
                    <Shield className="w-4 h-4" /> Admin
                  </NavLink>
                )}
                <NavLink to="/dashboard" className="flex items-center gap-1">
                  <PlusSquare className="w-4 h-4" /> Dashboard
                </NavLink>
                
                {/* Notification Bell */}
                <div className="relative flex items-center" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotificationPopup(!showNotificationPopup)}
                    className="relative flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors p-1"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadMessages.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[16px] h-[16px]">
                        {unreadMessages.length > 99 ? '99+' : unreadMessages.length}
                      </span>
                    )}
                  </button>

                  {/* Notification Popover */}
                  {showNotificationPopup && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Notifications</h3>
                        {unreadMessages.length > 0 && (
                          <button 
                            onClick={() => markAsRead('all')}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {unreadMessages.length === 0 ? (
                          <div className="p-6 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center gap-2">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                            <p className="text-sm">No unread notifications.</p>
                          </div>
                        ) : (
                          unreadMessages.map((msg) => (
                            <div 
                              key={msg.id} 
                              onClick={() => handleNotificationClick(msg)}
                              className="p-3 border-b border-gray-50 hover:bg-indigo-50/50 cursor-pointer transition-colors"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-sm text-gray-900 dark:text-white truncate pr-2">{msg.name}</span>
                                <span className="text-[10px] text-indigo-600 font-medium whitespace-nowrap bg-indigo-50 px-1.5 py-0.5 rounded">
                                  {format(new Date(msg.created_at), 'MMM dd')}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-1">
                                Inquired about: <span className="font-medium text-gray-700 dark:text-gray-200">{msg.property?.title || 'Unknown Property'}</span>
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">"{msg.message}"</p>
                            </div>
                          ))
                        )}
                      </div>
                      <Link 
                        to="/dashboard?tab=queries" 
                        onClick={() => setShowNotificationPopup(false)}
                        className="block w-full text-center p-2 text-xs font-semibold text-indigo-600 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:bg-gray-800 transition-colors"
                      >
                        View all queries
                      </Link>
                    </div>
                  )}
                </div>

                <Link to="/profile" className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700 hover:text-indigo-600 transition-colors ml-1">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-indigo-600">{(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{user.name}</span>
                </Link>
                <div className="flex items-center gap-2 pl-2 border-l border-gray-100 dark:border-gray-800 ml-1">
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-all border border-gray-100 dark:border-gray-700"
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-red-500 hover:text-red-700 font-semibold transition-colors text-sm ml-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-all border border-gray-100 dark:border-gray-700 mr-2"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotificationPopup(!showNotificationPopup)}
                  className="relative p-1 text-gray-600 dark:text-gray-300"
                >
                  <Bell className="w-5 h-5" />
                  {unreadMessages.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadMessages.length > 9 ? '9+' : unreadMessages.length}
                    </span>
                  )}
                </button>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-in Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Panel */}
          <div className="fixed top-16 right-0 bottom-0 w-72 bg-white dark:bg-gray-900 shadow-2xl z-50 md:hidden overflow-y-auto border-l border-gray-100 dark:border-gray-800 transition-colors duration-300"
               style={{ animation: 'slideIn 0.2s ease-out' }}>
            <div className="p-5 space-y-1">
              {user && (
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold">{(user.name || 'U').charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
              )}

              <NavLink to="/properties" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:bg-gray-900 w-full text-base" onClick={() => setMobileMenuOpen(false)}>
                <Home className="w-5 h-5" /> Browse Listings
              </NavLink>

              {user ? (
                <>
                  {isAdmin && (
                    <NavLink to="/admin" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:bg-gray-900 w-full text-base" onClick={() => setMobileMenuOpen(false)}>
                      <Shield className="w-5 h-5" /> Admin Panel
                    </NavLink>
                  )}
                  <NavLink to="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:bg-gray-900 w-full text-base" onClick={() => setMobileMenuOpen(false)}>
                    <PlusSquare className="w-5 h-5" /> Dashboard
                  </NavLink>
                  <NavLink to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:bg-gray-900 w-full text-base" onClick={() => setMobileMenuOpen(false)}>
                    <UserIcon className="w-5 h-5" /> My Profile
                  </NavLink>

                  <hr className="my-3 border-gray-100 dark:border-gray-800" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 w-full text-red-500 font-medium text-base transition-colors"
                  >
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:bg-gray-900 w-full text-base" onClick={() => setMobileMenuOpen(false)}>
                    <UserIcon className="w-5 h-5" /> Login
                  </NavLink>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 mt-3 bg-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors w-full text-base"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
